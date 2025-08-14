# 🚀 CinCon AI - Environment Configuration Guide

## 📋 Overview
This guide will help you set up all the necessary environment variables for your CinCon AI project to work properly.

## 🔧 Setup Instructions

### 1. Create Environment File
Create a `.env.local` file in your project root:

```bash
# Windows
copy .env.example .env.local

# Mac/Linux
cp .env.example .env.local
```

### 2. Required Environment Variables

#### 🌟 **Essential for Basic Functionality**

```bash
# Google Gemini AI API (Required for AI chat)
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models

# Supabase Database (Required for user management & community)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# TMDB API (Required for movie search)
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_API_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

#### 🔐 **Security & Authentication**

```bash
# JWT & Session Security
VITE_JWT_SECRET=your_super_secret_jwt_key_here
VITE_SESSION_SECRET=your_session_secret_here
VITE_SESSION_MAX_AGE=86400000

# CORS Settings
VITE_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

#### 📁 **File Upload & Storage**

```bash
# File Upload Configuration
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Pixeldrain for file hosting (optional)
VITE_PIXELDRAIN_API_KEY=your_pixeldrain_api_key_here
VITE_PIXELDRAIN_API_URL=https://pixeldrain.com/api
```

#### ⚙️ **Application Settings**

```bash
# App Configuration
VITE_APP_NAME=CinCon AI
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_VOICE_RECORDING=true
VITE_ENABLE_IMAGE_UPLOAD=true
VITE_ENABLE_COMMUNITY_CHAT=true
VITE_ENABLE_GAMING=true
VITE_ENABLE_MOVIE_SEARCH=true

# Performance Limits
VITE_MAX_MESSAGE_LENGTH=5000
VITE_MAX_MESSAGES_PER_CONVERSATION=100
VITE_RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

#### 🛠️ **Development & Debug**

```bash
# Debug Configuration
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_HOT_RELOAD=true
VITE_ENABLE_DEV_TOOLS=true
```

#### 📊 **Analytics & Monitoring**

```bash
# Google Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Sentry Error Tracking
VITE_SENTRY_DSN=https://your-sentry-dsn-here
VITE_SENTRY_ENVIRONMENT=development
```

## 🔑 How to Get API Keys

### 1. **Google Gemini AI API**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. **Supabase Database**
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy the Project URL and anon key

### 3. **TMDB API**
1. Go to [The Movie Database](https://www.themoviedb.org/settings/api)
2. Create an account
3. Request an API key
4. Wait for approval (usually instant)

### 4. **Pixeldrain API** (Optional)
1. Go to [Pixeldrain](https://pixeldrain.com)
2. Create an account
3. Go to API settings
4. Generate an API key

## 📝 Complete .env.local Example

```bash
# =============================================================================
# CinCon AI - Environment Configuration
# =============================================================================

# AI & API Keys
VITE_GEMINI_API_KEY=AIzaSyC_YourActualKeyHere123456789
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models

# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YourActualKeyHere

# TMDB API
VITE_TMDB_API_KEY=1234567890abcdef1234567890abcdef
VITE_TMDB_API_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# Security
VITE_JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
VITE_SESSION_SECRET=another_secret_key_for_sessions
VITE_SESSION_MAX_AGE=86400000

# CORS
VITE_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174

# File Upload
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# App Settings
VITE_APP_NAME=CinCon AI
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_VOICE_RECORDING=true
VITE_ENABLE_IMAGE_UPLOAD=true
VITE_ENABLE_COMMUNITY_CHAT=true
VITE_ENABLE_GAMING=true
VITE_ENABLE_MOVIE_SEARCH=true

# Development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_HOT_RELOAD=true
VITE_ENABLE_DEV_TOOLS=true

# Performance
VITE_MAX_MESSAGE_LENGTH=5000
VITE_MAX_MESSAGES_PER_CONVERSATION=100
VITE_RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

## ⚠️ Important Security Notes

1. **Never commit `.env.local` to version control**
2. **Keep your API keys secure and private**
3. **Rotate API keys regularly**
4. **Use different keys for development, staging, and production**
5. **Monitor API usage to avoid unexpected charges**

## 🚀 Quick Start

1. Copy the example above to `.env.local`
2. Replace all placeholder values with your actual API keys
3. Restart your development server
4. Test the application

## 🔍 Troubleshooting

### Common Issues:

1. **"API key not found" errors**
   - Check that your `.env.local` file exists
   - Verify API keys are correct
   - Restart the development server

2. **CORS errors**
   - Update `VITE_ALLOWED_ORIGINS` with your domain
   - Check Supabase CORS settings

3. **Database connection issues**
   - Verify Supabase URL and keys
   - Check if your Supabase project is active

4. **File upload not working**
   - Check file size limits
   - Verify allowed file types
   - Check Pixeldrain API key if using

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Check API key permissions and quotas
4. Review the troubleshooting section above

---

**Happy coding with CinCon AI! 🎉**
