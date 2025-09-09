# Vercel KV Setup Guide

This guide will help you set up Vercel KV (Redis) for session management and rate limiting in the PollRoom application.

## Prerequisites

- Vercel account
- Project deployed to Vercel (or local development setup)

## Step 1: Create Vercel KV Database

### Option A: Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis)
6. Choose a name for your database (e.g., `pollroom-kv`)
7. Select a region close to your users
8. Click **Create**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Create KV database
vercel kv create pollroom-kv
```

## Step 2: Get Connection Details

After creating the KV database, you'll need to get the connection details:

1. In the Vercel Dashboard, go to your project
2. Navigate to **Storage** → **KV** → Your database
3. Click on **Settings** or **Connection Details**
4. Copy the following values:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_URL` (optional, for direct Redis connection)

## Step 3: Configure Environment Variables

### For Local Development

1. Create or update your `.env.local` file:

```bash
# Vercel KV Configuration
KV_URL=your_vercel_kv_url
KV_REST_API_URL=your_vercel_kv_rest_api_url
KV_REST_API_TOKEN=your_vercel_kv_rest_api_token
```

2. Replace the placeholder values with your actual KV credentials

### For Production (Vercel)

1. In Vercel Dashboard, go to your project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_URL` (optional)

## Step 4: Test the Configuration

### Test KV Connection

```bash
# Test the KV connection
curl http://localhost:3000/api/test-kv
```

Expected response:
```json
{
  "success": true,
  "message": "KV connection and session management test successful",
  "results": {
    "kvConnection": { "success": true },
    "sessionManagement": { "success": true },
    "rateLimiting": { "success": true }
  }
}
```

### Test Environment Validation

```bash
# Validate environment configuration
curl http://localhost:3000/api/validate-env
```

Expected response:
```json
{
  "success": true,
  "validation": {
    "isValid": true,
    "errors": [],
    "warnings": []
  }
}
```

## Step 5: Verify Session Management

The application includes built-in session management utilities:

### SessionManager Class

```typescript
import { SessionManager } from '@/lib/kv';

// Create a session
await SessionManager.createSession('session-id', {
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});

// Get session data
const session = await SessionManager.getSession('session-id');

// Update session activity
await SessionManager.updateSessionActivity('session-id');

// Delete session
await SessionManager.deleteSession('session-id');
```

### RateLimiter Class

```typescript
import { RateLimiter } from '@/lib/kv';

// Check rate limit
const result = await RateLimiter.checkRateLimit('user-ip', 60, 60);
// 60 requests per 60 seconds

if (!result.allowed) {
  // Handle rate limit exceeded
}
```

## Troubleshooting

### Common Issues

1. **"KV connection test failed"**
   - Verify your `KV_REST_API_URL` and `KV_REST_API_TOKEN` are correct
   - Check that the KV database is active in Vercel Dashboard

2. **"Environment validation failed"**
   - Ensure all required environment variables are set
   - Check that values don't contain placeholder text

3. **"Rate limit check failed"**
   - This is usually a non-critical error - the system will fail open
   - Check KV connection and credentials

### Debug Commands

```bash
# Check environment variables
curl http://localhost:3000/api/validate-env

# Test KV operations
curl -X POST http://localhost:3000/api/test-kv \
  -H "Content-Type: application/json" \
  -d '{"action": "create_session", "data": {"test": true}}'

# Test rate limiting
curl -X POST http://localhost:3000/api/test-kv \
  -H "Content-Type: application/json" \
  -d '{"action": "rate_limit_test", "data": {"maxRequests": 5, "windowSeconds": 60}}'
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Rate Limiting**: Configure appropriate limits for your use case
3. **Session TTL**: Sessions expire after 24 hours by default
4. **IP Tracking**: IP addresses are logged for rate limiting and security

## Next Steps

Once KV is configured:

1. ✅ Session management is ready for anonymous users
2. ✅ Rate limiting is active for API protection
3. ✅ Ready to implement room and poll management APIs
4. ✅ Environment validation ensures proper configuration

## Support

If you encounter issues:

1. Check the [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
2. Verify your Vercel project settings
3. Test with the provided API endpoints
4. Check the application logs for detailed error messages
