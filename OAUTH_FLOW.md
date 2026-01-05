# OAuth Authentication Flow

## Overview

This document describes the OAuth authentication flow implemented in the QN Office Management System.

## Flow Diagram

```
┌─────────┐         ┌──────────┐         ┌─────────┐         ┌──────────┐
│ Browser │         │ Frontend │         │ Backend │         │  Mezon   │
└────┬────┘         └────┬─────┘         └────┬────┘         └────┬─────┘
     │                   │                    │                    │
     │ 1. Click Login    │                    │                    │
     ├──────────────────>│                    │                    │
     │                   │                    │                    │
     │ 2. Redirect to    │                    │                    │
     │    /auth/login    │                    │                    │
     │                   ├───────────────────>│                    │
     │                   │                    │                    │
     │                   │ 3. Get OAuth URL   │                    │
     │                   │<───────────────────┤                    │
     │                   │                    │                    │
     │ 4. Redirect to Mezon OAuth             │                    │
     ├────────────────────────────────────────┼───────────────────>│
     │                   │                    │                    │
     │                   │                    │  5. User Login     │
     │                   │                    │    & Authorize     │
     │                   │                    │                    │
     │ 6. Redirect to /auth/callback?code=xxx&state=yyy            │
     │<───────────────────────────────────────┼────────────────────┤
     │                   │                    │                    │
     │ 7. POST /auth/exchange {code, state}   │                    │
     ├──────────────────>├───────────────────>│                    │
     │                   │                    │                    │
     │                   │                    │ 8. Exchange code   │
     │                   │                    │    for OAuth token │
     │                   │                    ├───────────────────>│
     │                   │                    │<───────────────────┤
     │                   │                    │                    │
     │                   │                    │ 9. Get user info   │
     │                   │                    ├───────────────────>│
     │                   │                    │<───────────────────┤
     │                   │                    │                    │
     │                   │                    │ 10. Upsert user    │
     │                   │                    │     by email &     │
     │                   │                    │     mezon_user_id  │
     │                   │                    │                    │
     │                   │                    │ 11. Generate JWT   │
     │                   │                    │                    │
     │                   │ 12. Set cookies    │                    │
     │                   │    (access_token,  │                    │
     │                   │     refresh_token) │                    │
     │                   │<───────────────────┤                    │
     │ 13. Success + User│                    │                    │
     │<──────────────────┤                    │                    │
     │                   │                    │                    │
     │ 14. Redirect to /dashboard             │                    │
     │                   │                    │                    │
```

## Detailed Steps

### 1. User Initiates Login

- User clicks "Login with Mezon" button on `/login` page
- Frontend calls `authApi.getLoginUrl()` which returns `http://localhost:4000/auth/login`
- Browser is redirected to backend `/auth/login` endpoint

### 2. Backend Redirects to OAuth Provider

- Backend `/auth/login` generates OAuth URL with:
  - `client_id`: From env `CLIENT_ID`
  - `redirect_uri`: `{FRONTEND_URL}/auth/callback`
  - `response_type`: `code`
  - `scope`: `openid offline`
  - `state`: Random UUID
- Backend redirects browser to Mezon OAuth authorization page

### 3. User Authorizes on Mezon

- User logs in to Mezon (if not already)
- User authorizes the application
- Mezon redirects back to `{FRONTEND_URL}/auth/callback?code=xxx&state=yyy`

### 4. Frontend Callback Handler

- `/auth/callback` page receives `code` and `state` parameters
- Frontend calls backend `POST /auth/exchange` with `{code, state}`
- Uses axios with `credentials: 'include'` for cookies

### 5. Backend Exchange Process

**AuthService.handleOAuthExchange()**:

1. **Exchange Code**: Call Mezon API to exchange authorization code for OAuth access token
2. **Get User Info**: Call Mezon API with OAuth token to get user profile
3. **Upsert User**:
   - Find user by `mezon_user_id`
   - If not exists, create new user with email and mezon_user_id
   - If exists, return existing user
4. **Generate JWT Tokens**:
   - Access token (15 minutes expiry)
   - Refresh token (7 days expiry)
5. **Return**: User and tokens

**AuthController.exchange()**:

1. Call `authService.handleOAuthExchange(code, state)`
2. Set HTTP-only cookies:
   - `access_token`: JWT access token
   - `refresh_token`: JWT refresh token
3. Return success response with user info

### 6. Frontend Handles Success

- Receives success response
- Cookies are automatically stored by browser
- Redirects to `/dashboard`

### 7. Dashboard Access

- Dashboard layout checks authentication via `useAuth()`
- `useAuth()` calls `GET /auth/profile` with cookies
- Backend validates JWT from cookies
- Returns user data if valid
- Frontend stores user in React context

## Token Refresh Flow

```
┌─────────┐         ┌──────────┐         ┌─────────┐
│ Browser │         │ Frontend │         │ Backend │
└────┬────┘         └────┬─────┘         └────┬────┘
     │                   │                    │
     │ 1. API Request    │                    │
     ├──────────────────>├───────────────────>│
     │                   │                    │
     │                   │ 2. 401 Unauthorized│
     │                   │<───────────────────┤
     │                   │                    │
     │                   │ 3. POST /auth/refresh (with cookies)
     │                   ├───────────────────>│
     │                   │                    │
     │                   │ 4. Verify refresh  │
     │                   │    token           │
     │                   │                    │
     │                   │ 5. Generate new    │
     │                   │    tokens          │
     │                   │                    │
     │                   │ 6. Set new cookies │
     │                   │<───────────────────┤
     │                   │                    │
     │                   │ 7. Retry original  │
     │                   │    request         │
     │                   ├───────────────────>│
     │                   │<───────────────────┤
     │ 8. Success        │                    │
     │<──────────────────┤                    │
```

## Security Features

1. **HTTP-Only Cookies**: Tokens stored in HTTP-only cookies, not accessible via JavaScript
2. **CORS Configuration**: Backend validates origin from `FRONTEND_URL`
3. **Secure Flag**: Cookies use Secure flag in production
4. **SameSite**: Cookies use SameSite=Lax for CSRF protection
5. **Token Expiry**: Access tokens expire after 15 minutes
6. **Refresh Rotation**: New refresh token issued on each refresh
7. **State Parameter**: Random state parameter prevents CSRF attacks

## Environment Variables

### Backend (.env)

```
OAUTH_URL=https://mezon.ai
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Cookie Configuration

```typescript
{
  httpOnly: true,      // Not accessible via JavaScript
  secure: production,  // HTTPS only in production
  sameSite: 'lax',    // CSRF protection
  domain: domain,      // Cookie domain
  path: '/',          // Available on all paths
  maxAge: 900000      // 15 minutes for access_token
  maxAge: 604800000   // 7 days for refresh_token
}
```

## API Endpoints

### Backend

- `GET /auth/login` - Redirects to OAuth provider
- `POST /auth/exchange` - Exchanges code for tokens, sets cookies
- `POST /auth/refresh` - Refreshes tokens using refresh_token cookie
- `GET /auth/profile` - Returns current user (requires auth)
- `POST /auth/logout` - Clears authentication cookies

### Frontend

- `/login` - Login page with "Login with Mezon" button
- `/auth/callback` - OAuth callback handler
- `/auth/error` - Error page for OAuth failures
- `/dashboard` - Protected dashboard (requires auth)

## Error Handling

1. **Missing Code/State**: Show error on callback page
2. **Invalid Code**: Backend returns 401, frontend shows error
3. **Network Errors**: Frontend catches and displays error message
4. **Token Expired**: Automatic refresh via axios interceptor
5. **Refresh Failed**: Redirect to login page
