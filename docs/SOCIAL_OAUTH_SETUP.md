# SocialFlow Official OAuth 2.0 Integration & Setup Guide

This guide provides step-by-step instructions to configure authentic developer credentials for all supported social networks in SocialFlow.

---

## Architecture Overview

SocialFlow strictly enforces **Official OAuth 2.0 Authorization Codes with PKCE (where supported)**:
1. **Developer Portal**: Create a developer app on each platform to obtain `CLIENT_ID` and `CLIENT_SECRET`.
2. **Environment Variables**: Add credentials to `.env.local` (local development) or Vercel Environment Variables (production).
3. **Official Redirection**: SocialFlow redirects the user to the platform's official OAuth consent screen.
4. **Token Exchange**: The platform returns an authorization code; the backend exchanges it for real access & refresh tokens.
5. **Hardware-Grade Cryptography**: Tokens are immediately encrypted using **AES-256-GCM** with authenticated checksums (`iv` + `authTag`) before database persistence. Plaintext tokens never touch the client browser or localStorage.
6. **Live Publishing**: When publishing, the server decrypts the token and calls the official platform REST APIs (Meta Graph API, X API v2, LinkedIn API v2, etc.).

---

## Standard Redirect URIs

Configure these exact redirect URIs in each respective developer portal:

| Platform | Development URI | Production URI (Replace `your-domain.vercel.app`) |
| :--- | :--- | :--- |
| **Meta (Instagram & Facebook)** | `http://localhost:3000/api/social-accounts/callback/facebook` | `https://your-domain.vercel.app/api/social-accounts/callback/facebook` |
| **Meta (Instagram Direct)** | `http://localhost:3000/api/social-accounts/callback/instagram` | `https://your-domain.vercel.app/api/social-accounts/callback/instagram` |
| **LinkedIn** | `http://localhost:3000/api/social-accounts/callback/linkedin` | `https://your-domain.vercel.app/api/social-accounts/callback/linkedin` |
| **X (Twitter)** | `http://localhost:3000/api/social-accounts/callback/x` | `https://your-domain.vercel.app/api/social-accounts/callback/x` |
| **Google / YouTube** | `http://localhost:3000/api/social-accounts/callback/youtube` | `https://your-domain.vercel.app/api/social-accounts/callback/youtube` |
| **TikTok** | `http://localhost:3000/api/social-accounts/callback/tiktok` | `https://your-domain.vercel.app/api/social-accounts/callback/tiktok` |
| **Pinterest** | `http://localhost:3000/api/social-accounts/callback/pinterest` | `https://your-domain.vercel.app/api/social-accounts/callback/pinterest` |
| **Threads** | `http://localhost:3000/api/social-accounts/callback/threads` | `https://your-domain.vercel.app/api/social-accounts/callback/threads` |

---

## 1. Meta (Instagram & Facebook)

### Developer Portal
- URL: [https://developers.facebook.com/](https://developers.facebook.com/)

### Setup Steps
1. Navigate to **My Apps** > **Create App**.
2. Select App Type: **Business** (required for Instagram Content Publishing and Facebook Pages).
3. Add Products to your app:
   - **Instagram Graph API**
   - **Facebook Login for Business**
4. Under **Facebook Login > Settings**:
   - Add your Redirect URIs in **Valid OAuth Redirect URIs**.
5. In **App Settings > Basic**:
   - Copy **App ID** and **App Secret**.
6. Set in `.env.local` or Vercel:
   ```env
   META_APP_ID="your_meta_app_id"
   META_APP_SECRET="your_meta_app_secret"
   META_REDIRECT_URI="https://your-domain.vercel.app/api/social-accounts/callback/facebook"
   ```

### Scopes Requested
- Facebook Pages: `pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content`
- Instagram: `instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights`

---

## 2. X (Twitter)

### Developer Portal
- URL: [https://developer.x.com/](https://developer.x.com/)

### Setup Steps
1. Navigate to **Projects & Apps** > Select or create an App.
2. Under **User Authentication Settings**:
   - Click **Set up** or **Edit**.
   - App permissions: **Read and write and Direct message**.
   - Type of App: **Web App, Automated App or Bot**.
   - Callback URI: `https://your-domain.vercel.app/api/social-accounts/callback/x`
   - Website URL: `https://your-domain.vercel.app`
3. Under **Keys and Tokens**:
   - In the **OAuth 2.0 Client ID and Client Secret** section, copy both values.
4. Set in `.env.local` or Vercel:
   ```env
   X_CLIENT_ID="your_x_client_id"
   X_CLIENT_SECRET="your_x_client_secret"
   X_REDIRECT_URI="https://your-domain.vercel.app/api/social-accounts/callback/x"
   ```

### Scopes Requested
- `tweet.read,tweet.write,users.read,offline.access`

---

## 3. LinkedIn

### Developer Portal
- URL: [https://www.linkedin.com/developers/](https://www.linkedin.com/developers/)

### Setup Steps
1. Click **Create App**.
2. Associate a LinkedIn Page with the app.
3. Under the **Products** tab, request access to:
   - **Share on LinkedIn**
   - **Sign In with LinkedIn using OpenID Connect**
4. Under the **Auth** tab:
   - Copy **Client ID** and **Client Secret**.
   - In **Authorized redirect URLs for your app**, add:
     `https://your-domain.vercel.app/api/social-accounts/callback/linkedin`
5. Set in `.env.local` or Vercel:
   ```env
   LINKEDIN_CLIENT_ID="your_linkedin_client_id"
   LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret"
   LINKEDIN_REDIRECT_URI="https://your-domain.vercel.app/api/social-accounts/callback/linkedin"
   ```

### Scopes Requested
- `openid,profile,w_member_social`

---

## 4. Google / YouTube

### Developer Portal
- URL: [https://console.cloud.google.com/](https://console.cloud.google.com/)

### Setup Steps
1. Create a new Google Cloud project or select an existing one.
2. Go to **APIs & Services > Library**, search for **YouTube Data API v3**, and click **Enable**.
3. Go to **APIs & Services > OAuth consent screen**:
   - Choose User Type: **External**.
   - Fill in App Name, Support Email, and Developer Email.
   - Add scopes: `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtube.readonly`.
4. Go to **APIs & Services > Credentials**:
   - Click **Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - Authorized redirect URIs: `https://your-domain.vercel.app/api/social-accounts/callback/youtube`
   - Copy **Client ID** and **Client Secret**.
5. Set in `.env.local` or Vercel:
   ```env
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   GOOGLE_REDIRECT_URI="https://your-domain.vercel.app/api/social-accounts/callback/youtube"
   ```

---

## 5. Pinterest

### Developer Portal
- URL: [https://developers.pinterest.com/](https://developers.pinterest.com/)

### Setup Steps
1. Create a Pinterest Business account and navigate to the Developer Portal.
2. Click **Create App**.
3. In **App Details**, note your **App ID** and **App Secret**.
4. In **Redirect URIs**, add:
   `https://your-domain.vercel.app/api/social-accounts/callback/pinterest`
5. Set in `.env.local` or Vercel:
   ```env
   PINTEREST_APP_ID="your_pinterest_app_id"
   PINTEREST_APP_SECRET="your_pinterest_app_secret"
   PINTEREST_REDIRECT_URI="https://your-domain.vercel.app/api/social-accounts/callback/pinterest"
   ```

### Scopes Requested
- `boards:read,pins:read,pins:write,user_accounts:read`

---

## 6. TikTok

### Developer Portal
- URL: [https://developers.tiktok.com/](https://developers.tiktok.com/)

### Setup Steps
1. Register as a developer and click **Manage Apps > Add an App**.
2. Select **Login Kit** and **Content Posting API**.
3. Add your Redirect URI:
   `https://your-domain.vercel.app/api/social-accounts/callback/tiktok`
4. Copy **Client Key** and **Client Secret**.
5. Set in `.env.local` or Vercel:
   ```env
   TIKTOK_CLIENT_KEY="your_tiktok_client_key"
   TIKTOK_CLIENT_SECRET="your_tiktok_client_secret"
   TIKTOK_REDIRECT_URI="https://your-domain.vercel.app/api/social-accounts/callback/tiktok"
   ```

---

## 7. Threads

### Developer Portal
- URL: [https://developers.facebook.com/](https://developers.facebook.com/)

### Setup Steps
1. In the Meta for Developers console, create or select an app with access to **Threads API**.
2. Set Redirect URI:
   `https://your-domain.vercel.app/api/social-accounts/callback/threads`
3. Set in `.env.local` or Vercel:
   ```env
   THREADS_APP_ID="your_threads_app_id"
   THREADS_APP_SECRET="your_threads_app_secret"
   THREADS_REDIRECT_URI="https://your-domain.vercel.app/api/social-accounts/callback/threads"
   ```

---

## Security Verification Checklist

- [x] **No Plaintext Tokens**: Tokens are encrypted using AES-256-GCM before database write.
- [x] **No Secrets in Frontend**: `CLIENT_SECRET` is never passed to client-side bundles or `NEXT_PUBLIC_` variables.
- [x] **CSRF State Validation**: OAuth state tokens are signed cryptographically and verified on callback.
- [x] **No Mock Connections**: Accounts can only be created as `CONNECTED` through successful OAuth code exchange.
- [x] **Real Error Reporting**: Platforms returning errors (e.g. invalid scopes or expired tokens) report clear, actionable status codes.
