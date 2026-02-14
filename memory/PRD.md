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
  - Sign In with Apple (iOS only) - fails gracefully with helpful message
  - Demo Account login for reviewers (PRIMARY testing method)
- **Core Features:**
  - Search for TV shows and add to favorites
  - View upcoming episodes
  - Mark episodes as watched
  - In-app notifications for new episodes
  - Rate shows
  - Account deletion (Apple requirement)
- **Design:** Red-themed UI with movie theater background
- **Platform:** Native Capacitor app for iOS (iPhone + iPad), mobile-responsive

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
- Hosted on Emergent preview server

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

## App Store Submission History

### Build 14 - February 6, 2026 (Current)
- Fixed CORS configuration for mobile apps
- Added App Transport Security settings
- Tested on iPad Air 11-inch (Apple's test device)
- Demo Account working on all devices

### Build 13 - January 30, 2026
- Rejected: Network Error on Apple's test devices
- Issue: CORS was set to `*` with credentials (not allowed)

### Previous Builds
- Multiple rejections due to login flow issues
- Apple reviewers couldn't test app functionality

## What's Been Implemented

### February 6, 2026
- ✅ Fixed CORS (specific origins instead of *)
- ✅ Added App Transport Security to Info.plist
- ✅ Updated Capacitor config for network navigation
- ✅ Tested on iPad Air 11-inch simulator
- ✅ Submitted Build 14

### January 30, 2026
- ✅ Fixed Node.js version issues (nvm, Node 20 LTS)
- ✅ Resolved npm dependency conflicts
- ✅ Implemented localStorage token auth for Capacitor
- ✅ Demo Account button working
- ✅ Apple Sign In button with graceful error handling
- ✅ Visible Sign Out button on Dashboard

## Known Issues / Future Work
- Sign In with Apple needs full backend implementation
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
- CORS origins: capacitor://localhost, ionic://localhost, file://, etc.
- Token stored in localStorage for native app auth
- App Transport Security allows arbitrary loads

## App Store Review Notes Template
```
Demo Account tested and working on iPad Air 11-inch. 
Tap the green "Try Demo Account" button for instant access to all features. 
No login required.
```
