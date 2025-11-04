# Deployment Guide

This guide covers deploying the Personal VPN application to production.

## Prerequisites

- Node.js 18+ installed
- pnpm installed
- Vercel account
- Supabase account
- Oracle Cloud account (for free tier VPS)

## Backend API Deployment

### 1. Setup Supabase

1. Create a new Supabase project at https://supabase.com
2. Note your project URL and API keys
3. Run the database migration:
   ```bash
   cd packages/backend-api
   # Copy the SQL from supabase/migrations/001_initial_schema.sql
   # Run it in the Supabase SQL editor
   ```

### 2. Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd packages/backend-api
   vercel --prod
   ```

4. Set environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `JWT_SECRET`

## Chrome Extension Deployment

### 1. Build Extension

```bash
cd packages/chrome-extension
pnpm build
```

### 2. Create Extension Package

```bash
cd dist
zip -r ../extension.zip .
```

### 3. Submit to Chrome Web Store

1. Go to https://chrome.google.com/webstore/devconsole
2. Create a new item
3. Upload the extension.zip file
4. Fill in all required information
5. Submit for review

## VPN Infrastructure Deployment

See `PRODUCTION_PLAN.md` section 6 for detailed infrastructure setup.

### Quick Start

1. Setup Oracle Cloud free tier VPS
2. Install WireGuard:
   ```bash
   ./packages/infrastructure/wireguard/server-setup.sh
   ```

3. Configure monitoring:
   ```bash
   # Install Netdata
   # Install Uptime Kuma
   ```

## Post-Deployment

1. Verify all services are running
2. Test the extension with production API
3. Monitor error tracking dashboard
4. Check server metrics

## Rollback Procedure

If issues occur in production:

```bash
# Rollback Vercel deployment
vercel rollback

# Revert database if needed
# Apply rollback migration
```

## Monitoring

- Backend API: Vercel Analytics
- Errors: Sentry (if configured)
- Servers: Netdata + Uptime Kuma
- Usage: Supabase Analytics

## Support

For deployment issues, check:
1. Environment variables are set correctly
2. Database migrations have run
3. API endpoints are accessible
4. CORS is configured properly
