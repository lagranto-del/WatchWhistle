# WatchWhistle - Product Requirements Document

## Original Problem Statement
Build a full-stack application named "WatchWhistle" that notifies users of new episodes for their favorite TV shows. The primary goal is to get the application approved for submission to the Apple App Store.

## Current Status
- **Multiple Apple rejections** addressed
- **Railway backend** deployed for reliable access
- **MongoDB Atlas** database configured
- **Demo Account** working for testing
- **Apple Sign In** implemented (configuration may need debugging)
- **Google Sign In removed** per Apple feedback

## User Personas
- TV show enthusiasts who want to track multiple shows
- Users who want notifications when new episodes air
- Apple App Store reviewers (Demo Account for testing)

## Core Requirements
- **Data Source:** TV Maze API
- **Authentication:** 
  - Sign In with Apple (iOS native)
  - Demo Account login for reviewers
- **Core Features:**
  - Search for TV shows and add to favorites
  - View upcoming episodes
  - Mark episodes as watched
  - In-app notifications for new episodes
  - Rate shows
  - Account deletion (Apple requirement)
- **Design:** Red-themed UI with movie theater background
- **Platform:** Native Capacitor app for iOS (iPhone + iPad)

## Technical Architecture

### Frontend
- React 19
- Capacitor for iOS native app
- @capacitor-community/apple-sign-in for Apple Sign In
- Axios for API calls

### Backend (Railway)
- FastAPI (Python)
- URL: https://watchwhistle-production.up.railway.app
- Endpoints prefixed with /api

### Database (MongoDB Atlas)
- Free tier (M0)
- URL: mongodb+srv://watchwhistle:***@cluster0.etd3ykq.mongodb.net/

### Key Files
- `/app/frontend/src/pages/LandingPage.js` - Login buttons (Apple, Demo)
- `/app/frontend/src/pages/Dashboard.js` - Main app view with shows
- `/app/frontend/src/pages/SearchShows.js` - Search functionality
- `/app/backend/server.py` - API endpoints

### Key API Endpoints
- `POST /api/auth/demo` - Demo account login
- `POST /api/auth/apple` - Apple Sign In verification
- `DELETE /api/users/me` - Account deletion
- `GET /api/shows/favorites` - Get user's favorite shows
- `GET /api/episodes/upcoming` - Get upcoming episodes

## App Store Submission History

### Latest Submission (March 2026)
- Removed Google Sign In (Apple complained about external browser)
- Added Sign In with Apple (native)
- Demo Account working
- Railway backend deployed

### Previous Rejections
- Network errors (Emergent preview server not accessible from Apple)
- Apple Sign In not working
- Google Sign In using external browser

## Environment Configuration

### Railway Environment Variables
- `MONGO_URL`: MongoDB Atlas connection string
- `DB_NAME`: watchwhistle
- `CORS_ORIGINS`: capacitor://localhost,https://watchwhistle-production.up.railway.app,...

### Frontend .env
- `REACT_APP_BACKEND_URL`: https://watchwhistle-production.up.railway.app

## Known Issues
- Apple Sign In shows error 1000 on simulator (expected - simulators don't fully support it)
- Apple Sign In may need additional configuration if it fails on Apple's review devices

## Database Schema
- **users:** User profiles (id, email, name, picture, created_at)
- **favorites:** User's favorite shows (user_id, show_id)
- **watched_episodes:** Tracked episodes (user_id, episode_id)
- **notifications:** New episode notifications (user_id)
- **user_sessions:** Authentication sessions

## Review Notes for Apple
```
Testing Instructions:

This app requires an active internet connection.

Recommended testing method: Tap the green "Try Demo Account" button for instant access to all features without requiring sign-in.

Sign in with Apple: Available for users who prefer to use their Apple ID.

Features to test:
- Search and add TV shows to your watchlist
- View upcoming episodes
- Mark episodes as watched
- Rate shows
- Sign out (X button, top right)

Backend hosted on Railway (watchwhistle-production.up.railway.app).
```
