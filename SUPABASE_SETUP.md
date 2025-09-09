# Supabase Setup Guide for PollRoom

This guide will help you set up the Supabase database for PollRoom.

## 🚀 Step 1: Create Supabase Project

1. **Go to [Supabase](https://supabase.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Fill in project details**:
   - **Name**: `pollroom-mvp`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is perfect for MVP

5. **Wait for project creation** (2-3 minutes)

## 🔧 Step 2: Get Project Credentials

Once your project is ready:

1. **Go to Settings → API**
2. **Copy the following values**:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

## 🗄️ Step 3: Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy the contents** of `supabase/migrations/001_initial_schema.sql`
3. **Paste and run** the SQL script
4. **Verify tables created**:
   - Go to Table Editor
   - You should see: `rooms`, `polls`, `votes`

## 🌱 Step 4: Add Sample Data (Optional)

1. **Go to SQL Editor** again
2. **Copy the contents** of `supabase/seed.sql`
3. **Paste and run** the SQL script
4. **Verify data inserted** in Table Editor

## ⚙️ Step 5: Configure Environment Variables

1. **Copy `.env.example` to `.env.local`**:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** with your Supabase credentials:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## 🧪 Step 6: Test Database Connection

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the database connection**:
   ```bash
   curl http://localhost:3000/api/test-db
   ```

3. **Expected response**:
   ```json
   {
     "success": true,
     "message": "Database connection and schema validation successful",
     "timestamp": "2024-12-09T...",
     "results": {
       "connection": { "success": true },
       "schema": { "success": true, "tables": {...} }
     }
   }
   ```

## 🔄 Step 7: Enable Real-time (Important!)

1. **Go to Database → Replication** in Supabase dashboard
2. **Enable real-time** for all tables:
   - `rooms` ✅
   - `polls` ✅  
   - `votes` ✅

## ✅ Validation Checklist

- [ ] Supabase project created
- [ ] Database schema applied successfully
- [ ] Environment variables configured
- [ ] Database connection test passes
- [ ] Real-time enabled for all tables
- [ ] Sample data inserted (optional)

## 🚨 Troubleshooting

### Connection Issues
- **Check environment variables** are correctly set
- **Verify project URL** doesn't have trailing slash
- **Ensure project is not paused** (free tier limitation)

### Schema Issues
- **Check SQL script** ran without errors
- **Verify tables exist** in Table Editor
- **Check RLS policies** are enabled

### Real-time Issues
- **Enable replication** for all tables
- **Check browser console** for WebSocket errors
- **Verify RLS policies** allow read access

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Discord Community**: https://discord.supabase.com
- **GitHub Issues**: Create an issue in this repository

---

**Next Step**: Once database is set up, we'll move to POL-7 (Vercel KV configuration)
