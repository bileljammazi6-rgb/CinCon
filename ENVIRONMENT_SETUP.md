# 🌟 **Environment Setup Guide**

> **Complete setup guide for CineFlix AI platform**

## 🚀 **Quick Start**

1. **Copy the template**
```bash
cp .env.example .env.local
```

2. **Fill in your API keys**
3. **Start the development server**

## 🔑 **Required API Keys**

### **1. Google Gemini AI** ⭐ **REQUIRED**
- **Purpose**: AI chat, movie analysis, game scenarios, smart suggestions
- **Get Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Cost**: Free tier available (generous limits)
- **Setup**: 
  1. Visit Google AI Studio
  2. Sign in with Google account
  3. Create new API key
  4. Copy the key to your `.env.local`

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### **2. TMDB API** ⭐ **REQUIRED**
- **Purpose**: Movie data, posters, ratings, search
- **Get Key**: [TMDB Settings](https://www.themoviedb.org/settings/api)
- **Cost**: Free
- **Setup**:
  1. Create TMDB account
  2. Go to Settings > API
  3. Request API key
  4. Wait for approval (usually instant)
  5. Copy the key to your `.env.local`

```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

### **3. Supabase** ⭐ **OPTIONAL** (for advanced features)
- **Purpose**: User authentication, real-time chat, database
- **Get Key**: [Supabase](https://supabase.com)
- **Cost**: Free tier available
- **Setup**:
  1. Create Supabase account
  2. Create new project
  3. Go to Settings > API
  4. Copy URL and anon key

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 **Environment File Structure**

Create a `.env.local` file in your project root:

```env
# ========================================
# 🌟 CINEFLIX AI - ENVIRONMENT VARIABLES
# ========================================

# 🔑 REQUIRED API KEYS
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_TMDB_API_KEY=your_tmdb_api_key_here

# 🗄️ OPTIONAL - SUPABASE (for advanced features)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ⚙️ APP CONFIGURATION (optional)
VITE_APP_NAME=CineFlix AI
VITE_APP_ENVIRONMENT=development
VITE_APP_VERSION=1.0.0

# 🎬 TMDB CONFIGURATION (optional)
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
VITE_TMDB_API_URL=https://api.themoviedb.org/3

# 🤖 GEMINI CONFIGURATION (optional)
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models
```

## 🔧 **Setup by Feature**

### **🎮 Gaming Features**
- **Required**: Google Gemini AI
- **Features**: AI game scenarios, adaptive difficulty, quiz generation
- **Setup**: Just add `VITE_GEMINI_API_KEY`

### **🤖 AI Chat**
- **Required**: Google Gemini AI
- **Features**: Conversational AI, image analysis, voice recording
- **Setup**: Just add `VITE_GEMINI_API_KEY`

### **🎬 Movie Features**
- **Required**: TMDB API
- **Features**: Movie search, posters, ratings, metadata
- **Setup**: Just add `VITE_TMDB_API_KEY`

### **👥 Community Features**
- **Required**: Supabase
- **Features**: User accounts, real-time chat, leaderboards
- **Setup**: Add Supabase URL and anon key

## 🚨 **Troubleshooting**

### **"Missing VITE_GEMINI_API_KEY" Error**
```bash
# Check if .env.local exists
ls -la .env.local

# Verify the key is set
cat .env.local | grep GEMINI

# Restart the dev server
npm run dev
```

### **"TMDB API Error"**
```bash
# Verify TMDB key
curl "https://api.themoviedb.org/3/movie/popular?api_key=YOUR_KEY"

# Check rate limits
# TMDB allows 1000 requests per day for free
```

### **"Supabase Connection Failed"**
```bash
# Verify Supabase URL format
# Should be: https://yourproject.supabase.co

# Check if project is active
# Go to Supabase dashboard
```

## 🔒 **Security Best Practices**

### **Never Commit API Keys**
```bash
# Add to .gitignore
echo ".env.local" >> .gitignore
echo ".env" >> .gitignore

# Verify it's ignored
git status
```

### **Use Environment Variables**
```typescript
// ✅ Good
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// ❌ Bad - Never hardcode
const apiKey = "sk-1234567890abcdef";
```

### **API Key Rotation**
- Rotate keys regularly
- Use different keys for development/production
- Monitor API usage

## 🌍 **Production Deployment**

### **Netlify**
1. Add environment variables in Netlify dashboard
2. Deploy with `npm run build`
3. Environment variables are automatically available

### **Vercel**
1. Add environment variables in Vercel dashboard
2. Deploy with `npm run build`
3. Variables are prefixed with `VITE_`

### **Docker**
```dockerfile
# Build with environment variables
docker build --build-arg VITE_GEMINI_API_KEY=$GEMINI_KEY .

# Or use docker-compose
environment:
  - VITE_GEMINI_API_KEY=${GEMINI_KEY}
```

## 📊 **API Usage Monitoring**

### **Google Gemini AI**
- **Free Tier**: 15 requests per minute
- **Paid**: $0.0005 per 1K characters input, $0.0015 per 1K characters output
- **Monitor**: [Google AI Studio](https://makersuite.google.com/app/apikey)

### **TMDB API**
- **Free Tier**: 1,000 requests per day
- **Monitor**: [TMDB Account](https://www.themoviedb.org/settings/api)

### **Supabase**
- **Free Tier**: 50,000 monthly active users, 500MB database
- **Monitor**: [Supabase Dashboard](https://supabase.com/dashboard)

## 🆘 **Need Help?**

### **Common Issues**
1. **API key not working**: Check if key is copied correctly
2. **Rate limit exceeded**: Wait or upgrade plan
3. **CORS errors**: Check API configuration
4. **Build errors**: Verify environment variable names

### **Support Resources**
- **GitHub Issues**: [Report bugs here](https://github.com/your-repo/issues)
- **Discussions**: [Get help here](https://github.com/your-repo/discussions)
- **Documentation**: [Read the docs](https://your-docs-url.com)

---

**🎯 Pro Tip**: Start with just the Gemini AI key to test basic features, then add others as needed!

**Happy coding! 🚀**
