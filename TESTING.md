# Testing Guide for Personal VPN Chrome Extension

This guide will help you test the Personal VPN extension locally without needing a backend API.

## Quick Start (No Backend Required)

The extension includes a **mock mode** that allows you to test all features without setting up a backend server.

### Prerequisites

- Node.js 18+ installed
- pnpm installed (or npm)
- Google Chrome browser

### Step 1: Install Dependencies

```bash
# From the root of the project
pnpm install

# Or if you don't have pnpm:
npm install -g pnpm
pnpm install
```

### Step 2: Build the Extension

```bash
cd packages/chrome-extension
pnpm build
```

This will create a `dist/` folder with the built extension.

### Step 3: Load Extension in Chrome

1. Open Google Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Navigate to `packages/chrome-extension/dist/` and select it
6. The Personal VPN extension should now appear in your extensions

### Step 4: Pin and Test the Extension

1. Click the puzzle piece icon (Extensions) in Chrome toolbar
2. Find "Personal VPN" and click the pin icon
3. Click the Personal VPN icon to open the popup
4. You should see mock servers listed (US East, EU West, Asia Pacific)
5. Select a server and click "Connect to VPN"

## Mock Mode Features

When running without a backend, the extension operates in **mock mode**:

- ✅ Displays 3 mock servers with different load percentages
- ✅ Simulates connection/disconnection
- ✅ Shows all UI states (disconnected, connecting, connected, error)
- ✅ Stores connection state in Chrome storage
- ✅ Automatic authentication with mock tokens
- ⚠️ Proxy is set to localhost:8080 (won't route actual traffic without a proxy server)

## Development Mode with Hot Reload

For active development with instant updates:

```bash
cd packages/chrome-extension
pnpm dev
```

This starts Vite in watch mode. The extension will auto-rebuild on code changes.

**Note:** You'll need to click the refresh button in `chrome://extensions/` after each rebuild to see changes.

## Testing Scenarios

### 1. Test Connection Flow

1. **Disconnected State**: Open popup, should show "DISCONNECTED" status
2. **Select Server**: Choose a server from dropdown
3. **Connect**: Click "Connect to VPN" button
4. **Connecting State**: Should briefly show "CONNECTING" status
5. **Connected State**: Should show "CONNECTED" status with green indicator
6. **Badge**: Extension icon should show a green checkmark badge
7. **Disconnect**: Click "Disconnect" button
8. **Back to Disconnected**: Should return to initial state

### 2. Test Error Handling

1. **No Server Selected**: Click connect without selecting a server (should be disabled)
2. **Connection Error**: Watch console for error messages
3. **Error State**: Extension should handle errors gracefully

### 3. Test Settings Page

1. Right-click extension icon → "Options" OR click "Settings" in popup
2. Should open the settings/options page
3. Check that UI renders correctly

### 4. Test Persistence

1. Connect to a server
2. Close the popup
3. Reopen the popup
4. Connection state should be preserved
5. Close Chrome completely
6. Reopen Chrome and check extension
7. Connection state should still be preserved

### 5. Test Error Boundary

To test the error boundary is working:

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Manually throw an error to test error boundary handling

## Console Messages

When running in development mode, you'll see helpful console messages:

```
[Config] Environment configuration loaded
[API] Backend not available, using mock mode
[API Mock] User registered
[API Mock] Returning mock servers
[API Mock] Returning mock server config
```

These help you understand what the extension is doing.

## Testing with Real Backend

If you want to test with the actual backend API:

### 1. Setup Supabase

1. Create account at https://supabase.com
2. Create new project
3. Run the SQL migration from `packages/backend-api/supabase/migrations/001_initial_schema.sql`
4. Copy your Supabase URL and keys

### 2. Setup Backend

```bash
cd packages/backend-api
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# SUPABASE_URL=your-url
# SUPABASE_ANON_KEY=your-key
# SUPABASE_SERVICE_KEY=your-service-key
# JWT_SECRET=your-secret
```

### 3. Run Backend Locally

```bash
cd packages/backend-api
pnpm dev
```

This starts Vercel dev server on http://localhost:3000

### 4. Update Extension Config

```bash
cd packages/chrome-extension

# .env.local should already have:
VITE_API_BASE_URL=http://localhost:3000
VITE_ENVIRONMENT=development
```

### 5. Rebuild and Test

```bash
pnpm build
# Reload extension in Chrome
```

The extension will now use the real backend API instead of mock mode.

## Common Issues and Solutions

### Issue: Extension not loading

**Solution:**

- Check that you selected the `dist/` folder, not the `src/` folder
- Make sure the build completed successfully (check for errors)
- Try removing and re-adding the extension

### Issue: Changes not appearing

**Solution:**

- Click the refresh icon on the extension card in `chrome://extensions/`
- For service worker changes, you may need to reload Chrome
- Check if build command is actually running

### Issue: Mock mode not working

**Solution:**

- Check console for error messages
- Make sure `.env.local` has `VITE_ENVIRONMENT=development`
- Try rebuilding: `pnpm clean && pnpm build`

### Issue: Proxy not working

**Solution:**

- Mock mode sets proxy to `localhost:8080` which won't work without a proxy server
- This is expected in mock mode - it's for testing UI, not actual proxying
- For real proxying, you need to setup VPN servers or use the backend API

### Issue: TypeScript errors during build

**Solution:**

```bash
# Check TypeScript
pnpm type-check

# If you see errors, fix them or temporarily:
# Edit tsconfig.json and set "strict": false (not recommended for production)
```

### Issue: Build errors about missing modules

**Solution:**

```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules
pnpm install
pnpm build
```

## Debugging Tips

### 1. Service Worker Console

1. Go to `chrome://extensions/`
2. Find Personal VPN
3. Click "service worker" link (it's blue)
4. This opens DevTools for the background service worker
5. You can see all background logs here

### 2. Popup Console

1. Open the extension popup
2. Right-click anywhere in the popup
3. Select "Inspect"
4. DevTools opens for the popup
5. You can debug React components and see popup logs

### 3. Storage Inspection

1. Open service worker DevTools (see above)
2. Go to "Application" tab
3. Expand "Storage" → "Local Storage" → "chrome-extension://..."
4. You can see stored data (auth tokens, connection state, etc.)

### 4. Network Inspection

1. Open service worker or popup DevTools
2. Go to "Network" tab
3. You can see all API requests (or mock mode messages in console)

## Manual Testing Checklist

Before considering the extension complete, test:

- [ ] Extension loads without errors
- [ ] Popup UI renders correctly
- [ ] Can see server list (mock or real)
- [ ] Can select a server
- [ ] Connect button works
- [ ] Connection state changes correctly
- [ ] Badge updates correctly
- [ ] Disconnect button works
- [ ] Settings page opens and renders
- [ ] Error messages display correctly
- [ ] Connection state persists after closing popup
- [ ] Connection state persists after Chrome restart
- [ ] No console errors (except expected ones)
- [ ] Responsive UI (popup width is fixed, but content should fit)

## Performance Testing

Check that the extension performs well:

1. **Memory Usage:**
   - Open Chrome Task Manager (Shift+Esc)
   - Find "Extension: Personal VPN"
   - Memory should be < 50MB

2. **CPU Usage:**
   - Should be 0% when idle
   - Brief spike when connecting (< 1 second)

3. **Load Time:**
   - Popup should open instantly (< 100ms)
   - Server list should load quickly

## Security Testing

Before production release:

- [ ] Check that no sensitive data is logged to console in production mode
- [ ] Verify auth tokens are stored securely in Chrome storage
- [ ] Test that expired tokens are handled correctly
- [ ] Verify CSP (Content Security Policy) is working
- [ ] Test that external scripts cannot be injected

## Next Steps

Once local testing is complete:

1. **Setup Real VPN Servers** - Follow PRODUCTION_PLAN.md
2. **Deploy Backend** - Deploy API to Vercel
3. **Chrome Web Store** - Submit extension for review
4. **Monitoring** - Setup error tracking and analytics

## Getting Help

If you encounter issues:

1. Check console for error messages
2. Review this testing guide
3. Check PRODUCTION_PLAN.md for architecture details
4. Review docs/API.md for API documentation
5. Open an issue on GitHub

## Development Commands Reference

```bash
# Install dependencies
pnpm install

# Build for production
cd packages/chrome-extension && pnpm build

# Development mode (watch for changes)
cd packages/chrome-extension && pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format

# Clean builds
pnpm clean
```

---

**Happy Testing! 🚀**

Remember: The extension works in mock mode by default, so you can test everything without setting up a backend!
