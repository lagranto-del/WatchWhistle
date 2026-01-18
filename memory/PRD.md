# WatchWhistle - Product Requirements Document

## Original Problem Statement
Build a full-stack application named "WatchWhistle" that notifies users of new episodes for their favorite TV shows. The app must be submitted to the Apple App Store.

## Target Users
- TV show enthusiasts who want to track when new episodes air
- Users who manage multiple shows across different networks/streaming services

## Core Requirements
- **Data Source:** TV Maze API
- **Authentication:** Google Social Login + Apple Sign In (for iOS)
- **Core Features:**
  - Search for TV shows and add them to a favorites list
  - View upcoming shows and episodes
  - Mark episodes as watched, with an "undo" feature
  - Receive in-app notifications for new episodes
  - Rate shows
  - Preview App mode for reviewers
- **Design:** Red-themed UI with movie theater background
- **Platform:** Native iOS app via Capacitor, mobile-responsive web

## Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** React
- **Database:** MongoDB
- **Native Wrapper:** Capacitor.js for iOS
- **Authentication:** Emergent Google Social Login + Apple Sign In

## Key Database Collections
- `users` - User profiles
- `user_sessions` - Authentication sessions
- `shows` - User's favorite shows
- `episodes` - Episodes for tracked shows
- `notifications` - New episode notifications

## API Endpoints
- `POST /api/auth/session` - Google login session exchange
- `POST /api/auth/apple-signin` - Apple Sign In authentication
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `DELETE /api/users/me` - Delete user account (Apple requirement)
- `GET /api/shows/search` - Search TV shows
- `POST /api/shows/favorites` - Add show to favorites
- `GET /api/shows/favorites` - Get favorite shows
- `DELETE /api/shows/favorites/{id}` - Remove favorite
- `GET /api/episodes/upcoming` - Get upcoming episodes
- `PUT /api/episodes/{id}/watched` - Mark episode watched
- `GET /api/notifications` - Get notifications

---

## Implementation Status

### Completed Features ✅
- [x] Core app functionality (search, favorites, episodes, notifications)
- [x] Google Social Login via Safari View Controller
- [x] Apple Sign In integration
- [x] iPad responsiveness fix for Browser popup
- [x] Account Deletion feature (Apple requirement 5.1.1(v))
- [x] Preview App button for reviewers
- [x] Red-themed theater UI
- [x] Production deployment

### App Store Submission History
- **Rejection 1:** "Too similar to web browsing experience"
- **Rejection 2:** Blank screen bug on test devices
- **Rejection 3:** External browser for Google login (fixed with Safari View Controller)
- **Rejection 4:** Development artifacts in app icon
- **Rejection 5 (Jan 2026):** iPad buttons unresponsive - FIXED
- **Current:** Resubmitted with fixes (Jan 18, 2026)

### Fixes Applied (Jan 18, 2026)
1. iPad Browser popup now uses explicit width/height for proper display
2. Restored all 3 buttons: Google, Apple, Preview App
3. Added Account Deletion in user dropdown menu
4. iOS deployment target updated to 16.0
5. Clean Xcode build with updated Podfile

---

## Pending/Future Tasks

### P1 - High Priority
- [ ] Wait for Apple review feedback
- [ ] Monitor for any new rejection issues

### P2 - Enhancements
- [ ] Redesign UI to feel more "native" (grid of poster icons)
- [ ] Push notifications for new episodes
- [ ] Widget support

### P3 - Backlog
- [ ] Social features (share watchlists)
- [ ] Multiple user profiles
- [ ] Streaming service availability info

---

## Key Configuration

### Bundle ID
`com.tillywatchwhistle`

### Important Files
- `/app/frontend/capacitor.config.json` - Capacitor config
- `/app/frontend/ios/App/App.xcworkspace` - Xcode project
- `/app/frontend/src/pages/LandingPage.js` - Login page with 3 buttons
- `/app/frontend/src/pages/Dashboard.js` - Main dashboard with account deletion
- `/app/backend/server.py` - All backend endpoints

### Xcode Settings
- Deployment Target: iOS 16.0
- Signing: Manual with Distribution profile
- Capabilities: Sign In with Apple enabled
