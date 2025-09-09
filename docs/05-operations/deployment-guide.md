# Deployment Guide

## 🚀 **Serverless Deployment with Vercel**

This guide covers the complete deployment process for PollRoom's serverless architecture.

## 📋 **Prerequisites**

### **Required Accounts**
- [Vercel Account](https://vercel.com) (free tier sufficient for MVP)
- [Supabase Account](https://supabase.com) (free tier sufficient for MVP)
- [GitHub Account](https://github.com) for source code management

### **Local Setup**
```bash
# Install Vercel CLI
npm i -g vercel

# Install Supabase CLI (optional, for local development)
npm i -g supabase
```

## 🔧 **Environment Configuration**

### **Required Environment Variables**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel KV Configuration
KV_URL=redis://your-kv-instance
KV_REST_API_URL=https://your-kv-rest-api
KV_REST_API_TOKEN=your-rest-api-token

# Application Configuration
NEXT_PUBLIC_APP_URL=https://pollroom.vercel.app
```

### **Setting Environment Variables**
```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add KV_URL
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
vercel env add NEXT_PUBLIC_APP_URL
```

## 🚀 **Deployment Process**

### **Automatic Deployment (Recommended)**

1. **Connect Repository to Vercel**
   ```bash
   # In your project directory
   vercel
   # Follow prompts to connect GitHub repository
   ```

2. **Configure Build Settings**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Deploy**
   ```bash
   # Push to main branch triggers automatic deployment
   git push origin main
   ```

### **Manual Deployment**
```bash
# Deploy from local machine
vercel --prod

# Or deploy specific branch
vercel --prod --target production
```

## 📊 **Deployment Validation**

### **Post-Deployment Checklist**
- [ ] Application loads without errors
- [ ] Database connections working
- [ ] Room creation functionality
- [ ] Poll creation and voting
- [ ] Real-time updates functioning
- [ ] Mobile responsiveness
- [ ] Environment variables configured
- [ ] Custom domain (if applicable)

### **Testing Deployment**
```bash
# Test API endpoints
curl https://your-app.vercel.app/api/health

# Test room creation
curl -X POST https://your-app.vercel.app/api/rooms/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Room"}'
```

## 🔄 **CI/CD Pipeline**

### **Automatic Workflow**
```yaml
# .github/workflows/deploy.yml (automatically configured by Vercel)
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

### **Preview Deployments**
- Every PR automatically gets a preview deployment
- Test features before merging to main
- Share preview URLs with stakeholders

## 🌐 **Custom Domain Setup**

### **Configure Custom Domain**
1. **In Vercel Dashboard**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: www (or subdomain)
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - Includes automatic renewal

## 📈 **Performance Optimization**

### **Build Optimization**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize bundle size
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ],
}

module.exports = nextConfig
```

### **Performance Monitoring**
```javascript
// Vercel Analytics integration
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

## 🔧 **Rollback Procedures**

### **Automatic Rollback**
```bash
# Rollback to previous deployment
vercel rollback https://your-deployment-url.vercel.app

# Or via dashboard
# Vercel Dashboard → Deployments → Select previous → Promote to Production
```

### **Emergency Rollback**
1. **Identify Last Good Deployment**
   - Check Vercel dashboard deployment history
   - Verify functionality with monitoring tools

2. **Immediate Rollback**
   - Use Vercel dashboard one-click rollback
   - Or CLI: `vercel rollback [deployment-url]`

3. **Validate Rollback**
   - Test critical functionality
   - Monitor error rates and performance

## 🚨 **Troubleshooting**

### **Common Deployment Issues**

#### **Build Failures**
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Package dependency conflicts

# Local debugging
npm run build
# Fix errors before deploying
```

#### **Runtime Errors**
```bash
# Check function logs in Vercel dashboard
# Common issues:
# - Database connection failures
# - Missing environment variables
# - API endpoint errors

# Test locally first
npm run dev
```

#### **Performance Issues**
```bash
# Monitor in Vercel Analytics
# Common causes:
# - Large bundle sizes
# - Unoptimized images
# - Inefficient database queries

# Use Vercel Speed Insights
npm install @vercel/speed-insights
```

## 📞 **Support Resources**

### **Vercel Support**
- [Documentation](https://vercel.com/docs)
- [Community Discord](https://vercel.com/discord)
- [Status Page](https://vercel-status.com)

### **Supabase Support**
- [Documentation](https://supabase.com/docs)
- [Community Discord](https://discord.supabase.com)
- [Status Page](https://status.supabase.com)

---

*Deployment guide optimized for serverless architecture with zero-downtime deployments*
