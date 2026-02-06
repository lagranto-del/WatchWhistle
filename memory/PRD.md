# WatchWhistle - Product Requirements Document

## Original Problem Statement
Build a full-stack application named "WatchWhistle" that notifies users of new episodes for their favorite TV shows. The primary goal is to get the application approved for submission to the Apple App Store.

## User Personas
- TV show enthusiasts who want to track multiple shows
- Users who want notifications when new episodes air
- Apple App Store reviewers (need easy testing path)

## Core Requirements
- **Data Source:** TV Maze API
- **Authentication:** 
  - Emergent-based Google social login
  - Sign In with Apple (iOS only)
  - Demo Account login for reviewers
- **Core Features:**
  - Search for TV shows and add to favorites
  - View upcoming episodes
  - Mark episodes as watched
  - In-app notifications for new episodes
  - Rate shows
  - Account deletion (Apple requirement)
- **Design:** Red-themed UI with movie theater background
- **Platform:** Native Capacitor app for iOS, mobile-responsive

## Technical Architecture

### Frontend
- React 19
- Capacitor for iOS native app
- Tailwind CSS
- Lucide React icons
- Axios for API calls

### Backend
- FastAPI (Python)
- MongoDB database

### Key Files
- `/app/frontend/src/pages/LandingPage.js` - Login buttons (Google, Apple, Demo)
- `/app/frontend/src/pages/Dashboard.js` - Main app view with shows
- `/app/frontend/src/pages/SearchShows.js` - Search functionality
- `/app/backend/server.py` - API endpoints

### Key API Endpoints
- `POST /api/auth/demo` - Demo account login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/apple-signin` - Apple Sign In
- `DELETE /api/users/me` - Account deletion
- `GET /api/shows/favorites` - Get user's favorite shows
- `GET /api/episodes/upcoming` - Get upcoming episodes

## What's Been Implemented

### January 30, 2026
- ✅ Fixed Node.js version issues (nvm, Node 20 LTS)
- ✅ Resolved npm dependency conflicts
- ✅ Fixed CORS for native iOS app
- ✅ Implemented localStorage token auth for Capacitor
- ✅ Demo Account button working
- ✅ Apple Sign In button persistence (localStorage detection)
- ✅ Visible Sign Out button on Dashboard
- ✅ Fresh iOS project build
- ✅ App submitted to Apple App Store

### Previous Work
- Demo login endpoint (`/api/auth/demo`)
- Account deletion feature
- Google OAuth integration
- TV Maze API integration
- Episode tracking and notifications

## App Store Submission Status
- **Version:** 4.0
- **Status:** Waiting for Review (submitted Jan 30, 2026)
- **Key reviewer note:** "Try Demo Account" button for easy testing

## Known Issues / Future Work
- Sign In with Apple needs full implementation
- UI could be more "native" feeling
- Push notifications not yet implemented

## Database Schema
- **users:** User profiles
- **favorites:** User's favorite shows (user_id, show_id)
- **watched_episodes:** Tracked episodes (user_id, episode_id)
- **notifications:** New episode notifications (user_id)
- **user_sessions:** Authentication sessions

## Environment Setup Notes
- Node.js 20+ required (use nvm)
- `.npmrc` with `legacy-peer-deps=true` for dependency resolution
- CORS origins include `capacitor://localhost` for iOS app
- Token stored in localStorage for native app auth
