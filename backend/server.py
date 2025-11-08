from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request, Cookie
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
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
    
    return User(**user_doc)

# ============= AUTH ROUTES =============

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
