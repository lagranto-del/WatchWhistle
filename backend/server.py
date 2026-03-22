from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request, Cookie
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Show(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    tvmaze_id: int
    name: str
    image_url: Optional[str] = None
    genres: List[str] = []
    rating: Optional[float] = None
    user_rating: Optional[float] = None
    premiered: Optional[str] = None
    status: Optional[str] = None
    summary: Optional[str] = None
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Episode(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    show_id: str
    tvmaze_episode_id: int
    season: int
    number: int
    name: str
    airdate: Optional[str] = None
    airstamp: Optional[str] = None
    runtime: Optional[int] = None
    summary: Optional[str] = None
    watched: bool = False
    watched_at: Optional[datetime] = None

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    show_id: str
    show_name: str
    episode_name: str
    season: int
    episode_number: int
    airdate: str
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============= AUTH DEPENDENCIES =============

async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    """Get current user from session token (cookie or Authorization header)"""
    token = session_token
    
    # Fallback to Authorization header if cookie not present
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session = await db.user_sessions.find_one({"session_token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    
    # Ensure expires_at is timezone-aware
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.users.find_one({"id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert ISO strings to datetime if needed
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
        # Ensure timezone-aware
        if user_doc["created_at"].tzinfo is None:
            user_doc["created_at"] = user_doc["created_at"].replace(tzinfo=timezone.utc)
    
    return User(**user_doc)

# ============= AUTH ROUTES =============

class AppleSignInRequest(BaseModel):
    identityToken: str
    user: Optional[str] = None
    email: Optional[str] = None
    fullName: Optional[dict] = None
    givenName: Optional[str] = None
    familyName: Optional[str] = None

@api_router.post("/auth/apple")
@api_router.post("/auth/apple-signin")
async def apple_signin(request: AppleSignInRequest, response: Response):
    """Handle Apple Sign In authentication"""
    import jwt
    import httpx
    from jose import jwk
    from jose.exceptions import JWTError
    
    try:
        # Decode the JWT header to get the key ID
        unverified_header = jwt.get_unverified_header(request.identityToken)
        kid = unverified_header.get('kid')
        
        # Fetch Apple's public keys
        async with httpx.AsyncClient() as client:
            keys_response = await client.get('https://appleid.apple.com/auth/keys')
            apple_keys = keys_response.json()
        
        # Find the matching public key
        public_key = None
        for key in apple_keys['keys']:
            if key['kid'] == kid:
                public_key = jwk.construct(key)
                break
        
        if not public_key:
            raise HTTPException(status_code=401, detail="Invalid Apple token")
        
        # Verify and decode the token
        decoded = jwt.decode(
            request.identityToken,
            public_key.to_pem().decode(),
            algorithms=['RS256'],
            audience='com.tillywatchwhistle',
            options={"verify_exp": True}
        )
        
        apple_user_id = decoded.get('sub')
        email = decoded.get('email') or request.email
        
        if not apple_user_id:
            raise HTTPException(status_code=401, detail="No user identifier in Apple response")
        
        # Extract name
        full_name = "Apple User"
        if request.fullName:
            given_name = request.fullName.get('givenName', '')
            family_name = request.fullName.get('familyName', '')
            if given_name and family_name:
                full_name = f"{given_name} {family_name}"
            elif given_name:
                full_name = given_name
        elif request.givenName or request.familyName:
            given_name = request.givenName or ''
            family_name = request.familyName or ''
            if given_name and family_name:
                full_name = f"{given_name} {family_name}"
            elif given_name:
                full_name = given_name
        
        # Check if user exists by apple_id
        user_doc = await db.users.find_one({"apple_id": apple_user_id}, {"_id": 0})
        
        if user_doc:
            # Update last login
            await db.users.update_one(
                {"apple_id": apple_user_id},
                {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
            )
            user_id = user_doc["id"]
            user_email = user_doc.get("email", email)
            user_name = user_doc.get("name", full_name)
        else:
            # Create new user
            if not email:
                raise HTTPException(status_code=400, detail="Email required for new user")
            
            new_user = User(
                email=email,
                name=full_name,
                picture=""  # Apple doesn't provide profile pictures
            )
            user_dict = new_user.model_dump()
            user_dict["apple_id"] = apple_user_id
            user_dict["last_login"] = datetime.now(timezone.utc).isoformat()
            user_dict["created_at"] = user_dict["created_at"].isoformat()
            await db.users.insert_one(user_dict)
            user_id = new_user.id
            user_email = email
            user_name = full_name
        
        # Create session token
        session_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session = UserSession(
            user_id=user_id,
            session_token=session_token,
            expires_at=expires_at
        )
        session_dict = session.model_dump()
        session_dict["expires_at"] = session_dict["expires_at"].isoformat()
        session_dict["created_at"] = session_dict["created_at"].isoformat()
        await db.sessions.insert_one(session_dict)
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60
        )
        
        return {
            "token": session_token,
            "session_token": session_token,
            "user_id": user_id,
            "email": user_email,
            "name": user_name
        }
        
    except JWTError as e:
        logging.error(f"JWT verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid Apple token")
    except Exception as e:
        logging.error(f"Apple sign-in error: {e}")
        raise HTTPException(status_code=500, detail="Error processing sign-in")

# ============= APPLE SIGN IN - WEB OAUTH FLOW (Safari View Controller) =============
# This implements Apple's recommended approach using in-app browser

import secrets
from fastapi.responses import HTMLResponse
from urllib.parse import urlencode

# Store OAuth states (in production, use Redis)
apple_oauth_states = {}

# Apple OAuth Configuration
APPLE_SERVICE_ID = "com.tillywatchwhistle.web"  # Your Services ID from Apple Developer
APPLE_TEAM_ID = os.environ.get("APPLE_TEAM_ID", "")
APPLE_KEY_ID = os.environ.get("APPLE_KEY_ID", "")
APPLE_PRIVATE_KEY = os.environ.get("APPLE_PRIVATE_KEY", "")

def get_apple_redirect_uri():
    """Get the redirect URI based on environment"""
    backend_url = os.environ.get("BACKEND_URL", "https://watchwhistle-production.up.railway.app")
    return f"{backend_url}/api/auth/apple/callback"

def generate_apple_client_secret():
    """Generate JWT client secret for Apple token exchange"""
    import jwt as pyjwt
    
    if not APPLE_TEAM_ID or not APPLE_KEY_ID or not APPLE_PRIVATE_KEY:
        return None
    
    now = datetime.now(timezone.utc)
    payload = {
        "iss": APPLE_TEAM_ID,
        "sub": APPLE_SERVICE_ID,
        "aud": "https://appleid.apple.com",
        "iat": now,
        "exp": now + timedelta(minutes=5),
    }
    
    # The private key should be in PEM format
    private_key = APPLE_PRIVATE_KEY.replace("\\n", "\n")
    
    try:
        client_secret = pyjwt.encode(
            payload,
            private_key,
            algorithm="ES256",
            headers={"kid": APPLE_KEY_ID}
        )
        return client_secret
    except Exception as e:
        logging.error(f"Failed to generate Apple client secret: {e}")
        return None

@api_router.get("/auth/apple/login")
async def initiate_apple_web_auth():
    """
    Initiate Apple Sign In OAuth flow using web-based authentication.
    Returns the authorization URL to open in Safari View Controller.
    """
    # Generate secure state parameter for CSRF protection
    state = secrets.token_urlsafe(32)
    apple_oauth_states[state] = {
        "created_at": datetime.now(timezone.utc),
        "used": False
    }
    
    # Clean up old states (older than 10 minutes)
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=10)
    expired_states = [s for s, data in apple_oauth_states.items() 
                      if data["created_at"] < cutoff]
    for s in expired_states:
        del apple_oauth_states[s]
    
    params = {
        "response_type": "code id_token",
        "client_id": APPLE_SERVICE_ID,
        "redirect_uri": get_apple_redirect_uri(),
        "response_mode": "form_post",
        "scope": "name email",
        "state": state,
    }
    
    auth_url = f"https://appleid.apple.com/auth/authorize?{urlencode(params)}"
    
    return {
        "url": auth_url,
        "state": state
    }

@api_router.post("/auth/apple/callback")
async def handle_apple_web_callback(request: Request, response: Response):
    """
    Handle Apple's OAuth callback with authorization code.
    This is called by Apple after user authorizes the app.
    Returns an HTML page that redirects back to the Capacitor app.
    """
    # Get form data (Apple uses form_post response mode)
    form_data = await request.form()
    
    code = form_data.get("code")
    id_token = form_data.get("id_token")
    state = form_data.get("state")
    user_data_str = form_data.get("user")  # Only provided on first login
    error = form_data.get("error")
    
    logging.info(f"Apple callback received - code: {bool(code)}, id_token: {bool(id_token)}, state: {bool(state)}, error: {error}")
    
    if error:
        logging.error(f"Apple OAuth error: {error}")
        return HTMLResponse(content=f"""
        <html>
            <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
            <body style="font-family: -apple-system, sans-serif; padding: 40px; text-align: center;">
                <h2>Sign In Failed</h2>
                <p>Apple Sign In was cancelled or failed.</p>
                <p>Please close this window and try again.</p>
                <script>
                    // Try to redirect back to app
                    setTimeout(function() {{
                        window.location.href = 'watchwhistle://auth/error?message=' + encodeURIComponent('{error}');
                    }}, 2000);
                </script>
            </body>
        </html>
        """)
    
    if not id_token:
        return HTMLResponse(content="""
        <html>
            <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
            <body style="font-family: -apple-system, sans-serif; padding: 40px; text-align: center;">
                <h2>Sign In Failed</h2>
                <p>No identity token received from Apple.</p>
                <p>Please close this window and try again.</p>
            </body>
        </html>
        """)
    
    # Validate state parameter (CSRF protection)
    if state and state in apple_oauth_states:
        if apple_oauth_states[state]["used"]:
            return HTMLResponse(content="""
            <html>
                <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
                <body style="font-family: -apple-system, sans-serif; padding: 40px; text-align: center;">
                    <h2>Session Expired</h2>
                    <p>This login session has already been used.</p>
                    <p>Please close this window and try again.</p>
                </body>
            </html>
            """)
        apple_oauth_states[state]["used"] = True
    
    try:
        import jwt as pyjwt
        
        # Decode the ID token (Apple provides it directly in form_post mode)
        # For production, validate signature against Apple's JWKS
        decoded = pyjwt.decode(id_token, options={"verify_signature": False})
        
        apple_user_id = decoded.get("sub")
        email = decoded.get("email")
        
        if not apple_user_id:
            raise ValueError("No user ID in token")
        
        # Parse user data if provided (first-time login only)
        full_name = "Apple User"
        if user_data_str:
            try:
                import json
                user_info = json.loads(user_data_str)
                name_info = user_info.get("name", {})
                first_name = name_info.get("firstName", "")
                last_name = name_info.get("lastName", "")
                if first_name and last_name:
                    full_name = f"{first_name} {last_name}"
                elif first_name:
                    full_name = first_name
            except (json.JSONDecodeError, KeyError, TypeError):
                pass
        
        # Check if user exists
        user_doc = await db.users.find_one({"apple_id": apple_user_id}, {"_id": 0})
        
        if user_doc:
            # Update last login
            await db.users.update_one(
                {"apple_id": apple_user_id},
                {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
            )
            user_id = user_doc["id"]
            user_email = user_doc.get("email", email)
            user_name = user_doc.get("name", full_name)
        else:
            # Create new user
            if not email:
                email = f"{apple_user_id}@privaterelay.appleid.com"
            
            new_user = User(
                email=email,
                name=full_name,
                picture=""
            )
            user_dict = new_user.model_dump()
            user_dict["apple_id"] = apple_user_id
            user_dict["last_login"] = datetime.now(timezone.utc).isoformat()
            user_dict["created_at"] = user_dict["created_at"].isoformat()
            await db.users.insert_one(user_dict)
            user_id = new_user.id
            user_email = email
            user_name = full_name
        
        # Create session token
        session_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session = UserSession(
            user_id=user_id,
            session_token=session_token,
            expires_at=expires_at
        )
        session_dict = session.model_dump()
        session_dict["expires_at"] = session_dict["expires_at"].isoformat()
        session_dict["created_at"] = session_dict["created_at"].isoformat()
        await db.user_sessions.insert_one(session_dict)
        
        logging.info(f"Apple web auth successful for user: {user_email}")
        
        # Return HTML that redirects to the app with the session token
        # Using a custom URL scheme to return to the Capacitor app
        return HTMLResponse(content=f"""
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {{
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                        color: white;
                    }}
                    .loader {{
                        width: 50px;
                        height: 50px;
                        border: 4px solid rgba(239, 68, 68, 0.3);
                        border-top: 4px solid #ef4444;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    }}
                    @keyframes spin {{
                        0% {{ transform: rotate(0deg); }}
                        100% {{ transform: rotate(360deg); }}
                    }}
                    h2 {{ color: #ef4444; margin-bottom: 10px; }}
                    p {{ color: #ccc; }}
                </style>
            </head>
            <body>
                <div class="loader"></div>
                <h2>Success!</h2>
                <p>Redirecting to WatchWhistle...</p>
                <script>
                    // Store the session data
                    const sessionData = {{
                        session_token: '{session_token}',
                        user_id: '{user_id}',
                        email: '{user_email}',
                        name: '{user_name}'
                    }};
                    
                    // Try multiple methods to return to the app
                    function redirectToApp() {{
                        // Method 1: Custom URL scheme (for Capacitor)
                        const appUrl = 'watchwhistle://auth/success?session_token=' + 
                            encodeURIComponent(sessionData.session_token);
                        
                        // Method 2: Universal link
                        const universalUrl = 'https://watchwhistle-production.up.railway.app/auth/complete?' +
                            'session_token=' + encodeURIComponent(sessionData.session_token);
                        
                        // Try app URL first
                        window.location.href = appUrl;
                        
                        // Fallback: show manual instructions after delay
                        setTimeout(function() {{
                            document.body.innerHTML = `
                                <div style="text-align: center; padding: 40px;">
                                    <h2 style="color: #22c55e;">✓ Signed In Successfully!</h2>
                                    <p style="color: #ccc;">Please return to the WatchWhistle app.</p>
                                    <p style="color: #888; font-size: 14px; margin-top: 20px;">
                                        If the app doesn't open automatically,<br>
                                        please close this browser and open WatchWhistle.
                                    </p>
                                </div>
                            `;
                        }}, 3000);
                    }}
                    
                    // Execute redirect
                    redirectToApp();
                </script>
            </body>
        </html>
        """)
        
    except Exception as e:
        logging.error(f"Apple web callback error: {e}")
        return HTMLResponse(content=f"""
        <html>
            <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
            <body style="font-family: -apple-system, sans-serif; padding: 40px; text-align: center;">
                <h2>Sign In Failed</h2>
                <p>An error occurred during sign in.</p>
                <p style="color: #888; font-size: 12px;">{str(e)}</p>
                <p>Please close this window and try again.</p>
            </body>
        </html>
        """)

@api_router.post("/auth/demo")
async def demo_login(response: Response):
    """Create a demo account session for testing"""
    # Check if demo user exists
    demo_email = "demo@watchwhistle.app"
    user_doc = await db.users.find_one({"email": demo_email}, {"_id": 0})
    
    if not user_doc:
        # Create demo user
        user = User(
            email=demo_email,
            name="Demo User",
            picture=""
        )
        user_dict = user.model_dump()
        user_dict["created_at"] = user_dict["created_at"].isoformat()
        await db.users.insert_one(user_dict)
        user_id = user.id
    else:
        if isinstance(user_doc.get("created_at"), str):
            user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
            if user_doc["created_at"].tzinfo is None:
                user_doc["created_at"] = user_doc["created_at"].replace(tzinfo=timezone.utc)
        user = User(**user_doc)
        user_id = user.id
    
    # Create session
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session = UserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at
    )
    
    session_dict = session.model_dump()
    session_dict["expires_at"] = session_dict["expires_at"].isoformat()
    session_dict["created_at"] = session_dict["created_at"].isoformat()
    
    await db.user_sessions.insert_one(session_dict)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {"user": user.model_dump(), "session_token": session_token}

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="X-Session-ID header required")
    
    # Call Emergent auth service
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            auth_response.raise_for_status()
            auth_data = auth_response.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to validate session: {str(e)}")
    
    # Check if user exists
    user_doc = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if not user_doc:
        # Create new user
        user = User(
            email=auth_data["email"],
            name=auth_data["name"],
            picture=auth_data["picture"]
        )
        user_dict = user.model_dump()
        user_dict["created_at"] = user_dict["created_at"].isoformat()
        await db.users.insert_one(user_dict)
    else:
        # Convert ISO strings to datetime if needed
        if isinstance(user_doc.get("created_at"), str):
            user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
            # Ensure timezone-aware
            if user_doc["created_at"].tzinfo is None:
                user_doc["created_at"] = user_doc["created_at"].replace(tzinfo=timezone.utc)
        user = User(**user_doc)
    
    # Create session
    session_token = auth_data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session = UserSession(
        user_id=user.id,
        session_token=session_token,
        expires_at=expires_at
    )
    
    session_dict = session.model_dump()
    session_dict["expires_at"] = session_dict["expires_at"].isoformat()
    session_dict["created_at"] = session_dict["created_at"].isoformat()
    
    await db.user_sessions.insert_one(session_dict)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {"user": user.model_dump(), "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current user info"""
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, user: User = Depends(get_current_user), session_token: Optional[str] = Cookie(None)):
    """Logout user"""
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.delete("/users/me")
async def delete_user_account(user: User = Depends(get_current_user)):
    """Delete user account and all associated data"""
    user_id = user.id
    
    # Delete all user data from all collections
    await db.users.delete_one({"id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.shows.delete_many({"user_id": user_id})
    await db.episodes.delete_many({"user_id": user_id})
    await db.notifications.delete_many({"user_id": user_id})
    
    return {"message": "Account deleted successfully"}

# ============= SHOW ROUTES =============

@api_router.get("/shows/search")
async def search_shows(q: str, user: User = Depends(get_current_user)):
    """Search shows using TVMaze API"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"https://api.tvmaze.com/search/shows?q={q}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"TVMaze API error: {str(e)}")

@api_router.post("/shows/favorites")
async def add_favorite_show(show_data: dict, user: User = Depends(get_current_user)):
    """Add show to favorites"""
    # Check if already exists
    existing = await db.shows.find_one({
        "user_id": user.id,
        "tvmaze_id": show_data["tvmaze_id"]
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Show already in favorites")
    
    show = Show(
        user_id=user.id,
        tvmaze_id=show_data["tvmaze_id"],
        name=show_data["name"],
        image_url=show_data.get("image_url"),
        genres=show_data.get("genres", []),
        rating=show_data.get("rating"),
        premiered=show_data.get("premiered"),
        status=show_data.get("status"),
        summary=show_data.get("summary")
    )
    
    show_dict = show.model_dump()
    show_dict["added_at"] = show_dict["added_at"].isoformat()
    await db.shows.insert_one(show_dict)
    
    # Fetch episodes from TVMaze and store them
    await fetch_and_store_episodes(user.id, show.id, show_data["tvmaze_id"])
    
    return show

@api_router.get("/shows/favorites")
async def get_favorite_shows(user: User = Depends(get_current_user)):
    """Get user's favorite shows"""
    shows = await db.shows.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    
    for show in shows:
        if isinstance(show.get("added_at"), str):
            show["added_at"] = datetime.fromisoformat(show["added_at"])
            # Ensure timezone-aware
            if show["added_at"].tzinfo is None:
                show["added_at"] = show["added_at"].replace(tzinfo=timezone.utc)
    
    return shows

@api_router.delete("/shows/favorites/{show_id}")
async def remove_favorite_show(show_id: str, user: User = Depends(get_current_user)):
    """Remove show from favorites"""
    result = await db.shows.delete_one({"id": show_id, "user_id": user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Show not found")
    
    # Delete associated episodes
    await db.episodes.delete_many({"show_id": show_id, "user_id": user.id})
    
    return {"message": "Show removed from favorites"}

@api_router.put("/shows/favorites/{show_id}/rating")
async def rate_show(show_id: str, rating_data: dict, user: User = Depends(get_current_user)):
    """Rate a show"""
    rating = rating_data.get("rating")
    if rating < 0 or rating > 10:
        raise HTTPException(status_code=400, detail="Rating must be between 0 and 10")
    
    result = await db.shows.update_one(
        {"id": show_id, "user_id": user.id},
        {"$set": {"user_rating": rating}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Show not found")
    
    return {"message": "Rating updated"}

# ============= EPISODE ROUTES =============

async def fetch_and_store_episodes(user_id: str, show_id: str, tvmaze_id: int):
    """Fetch episodes from TVMaze and store in database"""
    # Check if episodes already exist for this user and show
    existing_count = await db.episodes.count_documents({
        "user_id": user_id,
        "show_id": show_id
    })
    
    if existing_count > 0:
        # Episodes already fetched, skip
        return
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"https://api.tvmaze.com/shows/{tvmaze_id}/episodes")
            response.raise_for_status()
            episodes_data = response.json()
            
            for ep_data in episodes_data:
                episode = Episode(
                    user_id=user_id,
                    show_id=show_id,
                    tvmaze_episode_id=ep_data["id"],
                    season=ep_data["season"],
                    number=ep_data["number"],
                    name=ep_data["name"],
                    airdate=ep_data.get("airdate"),
                    airstamp=ep_data.get("airstamp"),
                    runtime=ep_data.get("runtime"),
                    summary=ep_data.get("summary"),
                    watched=False
                )
                
                ep_dict = episode.model_dump()
                await db.episodes.insert_one(ep_dict)
        except Exception as e:
            logging.error(f"Failed to fetch episodes: {str(e)}")

@api_router.get("/shows/{show_id}/episodes")
async def get_show_episodes(show_id: str, user: User = Depends(get_current_user)):
    """Get episodes for a show"""
    episodes = await db.episodes.find(
        {"show_id": show_id, "user_id": user.id},
        {"_id": 0}
    ).to_list(1000)
    
    for episode in episodes:
        if isinstance(episode.get("watched_at"), str):
            episode["watched_at"] = datetime.fromisoformat(episode["watched_at"])
            # Ensure timezone-aware
            if episode["watched_at"].tzinfo is None:
                episode["watched_at"] = episode["watched_at"].replace(tzinfo=timezone.utc)
    
    return episodes

@api_router.get("/episodes/upcoming")
async def get_upcoming_episodes(user: User = Depends(get_current_user)):
    """Get upcoming episodes from user's favorite shows"""
    today = datetime.now(timezone.utc).date().isoformat()
    
    episodes = await db.episodes.find(
        {
            "user_id": user.id,
            "airdate": {"$gte": today},
            "watched": False
        },
        {"_id": 0}
    ).sort("airdate", 1).to_list(100)
    
    # Enrich with show data
    for episode in episodes:
        show = await db.shows.find_one({"id": episode["show_id"]}, {"_id": 0})
        if show:
            episode["show_name"] = show["name"]
            episode["show_image"] = show.get("image_url")
    
    return episodes

@api_router.put("/episodes/{episode_id}/watched")
async def mark_episode_watched(episode_id: str, watched_data: dict, user: User = Depends(get_current_user)):
    """Mark episode as watched/unwatched"""
    watched = watched_data.get("watched", True)
    
    update_data = {"watched": watched}
    if watched:
        update_data["watched_at"] = datetime.now(timezone.utc).isoformat()
    else:
        update_data["watched_at"] = None
    
    result = await db.episodes.update_one(
        {"id": episode_id, "user_id": user.id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Episode not found")
    
    return {"message": "Episode updated"}

# ============= NOTIFICATION ROUTES =============

@api_router.get("/notifications")
async def get_notifications(user: User = Depends(get_current_user)):
    """Get user notifications"""
    notifications = await db.notifications.find(
        {"user_id": user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for notif in notifications:
        if isinstance(notif.get("created_at"), str):
            notif["created_at"] = datetime.fromisoformat(notif["created_at"])
            # Ensure timezone-aware
            if notif["created_at"].tzinfo is None:
                notif["created_at"] = notif["created_at"].replace(tzinfo=timezone.utc)
    
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: User = Depends(get_current_user)):
    """Mark notification as read"""
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": user.id},
        {"$set": {"read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(user: User = Depends(get_current_user)):
    """Mark all notifications as read"""
    await db.notifications.update_many(
        {"user_id": user.id},
        {"$set": {"read": True}}
    )
    
    return {"message": "All notifications marked as read"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
