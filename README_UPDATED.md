# Personal VPN Chrome Extension

> A free, privacy-focused VPN Chrome extension with secure proxy services - designed to keep operational costs under $100/month.

![Status](https://img.shields.io/badge/status-ready--to--test-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🔒 **Privacy First**: No-logs policy, anonymous authentication
- 🌍 **Multiple Servers**: Choose from servers in US, EU, and Asia
- ⚡ **Fast & Lightweight**: Modern architecture with minimal overhead
- 🔄 **Auto-Reconnect**: Intelligent reconnection on failures
- 📊 **Real-time Status**: Connection state, server load indicators
- 🛡️ **Secure**: JWT authentication, encrypted storage
- 🎨 **Modern UI**: Beautiful interface built with React and Tailwind CSS
- 🧪 **Mock Mode**: Test without backend (perfect for development)

## 🚀 Quick Start (Testing)

### Prerequisites

- Node.js 18+
- pnpm (or npm)
- Google Chrome

### Installation

```bash
# Clone the repository
cd personalVpn

# Install dependencies
pnpm install

# Build the extension
cd packages/chrome-extension
pnpm build
```

### Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select `packages/chrome-extension/dist/` folder
5. Pin the extension to your toolbar

### Test It!

The extension works in **mock mode** by default - no backend needed!

1. Click the Personal VPN icon
2. Select a mock server (US East, EU West, or Asia Pacific)
3. Click "Connect to VPN"
4. Watch the connection state change!

🎉 **It's that easy!**

For detailed testing instructions, see **[TESTING.md](./TESTING.md)**

## 📁 Project Structure

```
personalVpn/
├── packages/
│   ├── chrome-extension/    # Chrome extension (React + TypeScript)
│   ├── backend-api/          # Serverless API (Vercel + Supabase)
│   ├── infrastructure/       # Infrastructure as code (Terraform, Ansible)
│   └── shared/               # Shared types and constants
├── docs/                     # Documentation
├── scripts/                  # Development scripts
├── PRODUCTION_PLAN.md        # 16-week development roadmap
└── TESTING.md                # Comprehensive testing guide
```

## 🛠️ Tech Stack

### Frontend (Chrome Extension)
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool with HMR
- **Tailwind CSS 3** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend (API)
- **Vercel** - Serverless platform
- **Supabase** - PostgreSQL database
- **JWT** - Authentication
- **Zod** - Input validation

### Infrastructure
- **WireGuard** - VPN protocol
- **Terraform** - Infrastructure as code
- **Ansible** - Configuration management
- **Oracle Cloud** - Free tier VPS

## 🎯 Development

### Development Mode

```bash
# Start extension in watch mode
cd packages/chrome-extension
pnpm dev

# Start backend API locally
cd packages/backend-api
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Mock Mode

The extension includes mock mode for development without a backend:

- **Automatic**: Enabled when API is unavailable
- **Mock Servers**: 3 test servers with different load percentages
- **Mock Authentication**: Generates test tokens automatically
- **Full UI**: All features work (except actual proxying)

Perfect for testing UI, connection flows, and state management!

## 🔒 Security Features

- ✅ **No-logs Policy**: We don't track browsing activity
- ✅ **Anonymous Auth**: No personal data required
- ✅ **JWT Tokens**: Secure stateless authentication
- ✅ **Rate Limiting**: Prevents abuse
- ✅ **Input Validation**: All API inputs validated with Zod
- ✅ **CSP**: Content Security Policy enforced
- ✅ **Encrypted Storage**: Chrome storage API with encryption
- ✅ **Error Boundaries**: Graceful error handling

## 📊 Cost Breakdown

**Estimated Monthly Cost:** $20-60

| Service | Provider | Cost | Notes |
|---------|----------|------|-------|
| VPN Server (US) | Oracle Cloud Free Tier | $0 | 2 AMD EPYC cores, 12GB RAM |
| VPN Server (EU) | Contabo VPS S | $5-10 | 4 cores, 8GB RAM |
| VPN Server (Asia) | Hetzner CX21 | $5-10 | 2 cores, 4GB RAM |
| Backend API | Vercel Free Tier | $0 | Serverless functions |
| Database | Supabase Free Tier | $0 | PostgreSQL |
| Domain + SSL | Cloudflare | $1/month | Amortized annual cost |
| Bandwidth | Pay-as-you-go | $10-40 | Variable based on usage |

**Total: $20-60/month** ✅ (Well under $100 target!)

## 🧪 Testing

### Unit Tests

```bash
cd packages/chrome-extension
pnpm test
```

### Integration Tests

```bash
cd packages/backend-api
pnpm test
```

### Manual Testing

See **[TESTING.md](./TESTING.md)** for comprehensive testing checklist.

### Testing Coverage

- ✅ Connection flow (connect/disconnect)
- ✅ Server selection
- ✅ State persistence
- ✅ Error handling
- ✅ Mock mode
- ✅ Storage management
- ✅ API client
- ✅ Error boundaries

## 📚 Documentation

- **[PRODUCTION_PLAN.md](./PRODUCTION_PLAN.md)** - Complete development roadmap (16 weeks)
- **[TESTING.md](./TESTING.md)** - Testing guide and checklist
- **[docs/API.md](./docs/API.md)** - API documentation
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide
- **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)** - Contribution guidelines

## 🐛 Known Issues & Limitations

### Current Limitations

1. **Mock Mode Proxy**: In mock mode, proxy is set to `localhost:8080` which won't route actual traffic (UI testing only)
2. **Icons**: Using placeholder icons (need to create proper branded icons)
3. **Backend Required**: For actual VPN functionality, backend API and VPN servers must be deployed
4. **Testing**: E2E tests not yet implemented (manual testing required)

### Security Considerations

1. **JWT Secret**: Change `JWT_SECRET` in production (currently using test value)
2. **Rate Limiting**: Review and adjust rate limits based on usage
3. **CORS**: Configure CORS properly for production API URL
4. **Environment Variables**: Set proper production values

## 🚧 Roadmap

### ✅ Phase 1: Foundation (Complete)
- [x] Monorepo structure
- [x] Chrome extension with UI
- [x] Backend API endpoints
- [x] Database schema
- [x] Mock mode for testing
- [x] CI/CD workflows
- [x] Documentation

### 🔄 Phase 2: Testing & Security (In Progress)
- [x] Error boundaries
- [x] Environment validation
- [x] Mock mode
- [ ] Unit test coverage (>80%)
- [ ] Integration tests
- [ ] Security audit
- [ ] Performance testing

### ⏳ Phase 3: Infrastructure (Planned)
- [ ] Deploy backend to Vercel
- [ ] Setup Supabase database
- [ ] Deploy VPN servers (Oracle Cloud + budget VPS)
- [ ] Configure WireGuard
- [ ] Setup monitoring (Netdata, Uptime Kuma)

### ⏳ Phase 4: Launch (Planned)
- [ ] Replace placeholder icons with branded icons
- [ ] Create Chrome Web Store listing
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Submit for Chrome Web Store review
- [ ] Public beta testing

### ⏳ Phase 5: Post-Launch (Future)
- [ ] Firefox extension port
- [ ] Split tunneling feature
- [ ] Kill switch implementation
- [ ] Additional server locations
- [ ] Premium tier (optional)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) first.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 Commands Reference

```bash
# Root commands
pnpm install          # Install all dependencies
pnpm dev              # Start all dev servers
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm type-check       # Check TypeScript
pnpm clean            # Clean all builds

# Extension specific
cd packages/chrome-extension
pnpm dev              # Watch mode with HMR
pnpm build            # Production build
pnpm test             # Run tests
pnpm lint             # Lint code

# Backend specific
cd packages/backend-api
pnpm dev              # Start Vercel dev server
pnpm deploy           # Deploy to Vercel
pnpm test             # Run API tests
```

## 🎓 Learning Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [WireGuard Official Docs](https://www.wireguard.com/)
- [Vercel Serverless Functions](https://vercel.com/docs/serverless-functions/introduction)
- [Supabase Documentation](https://supabase.com/docs)

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/Gireeshbd/personalVpn/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Gireeshbd/personalVpn/discussions)

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Icons by [Lucide](https://lucide.dev/)
- Inspired by privacy-focused VPN solutions

---

## 🎯 Next Steps

### For Testing:
1. Read **[TESTING.md](./TESTING.md)**
2. Build the extension (`pnpm build`)
3. Load it in Chrome
4. Test with mock servers
5. Report any issues

### For Production Deployment:
1. Read **[PRODUCTION_PLAN.md](./PRODUCTION_PLAN.md)**
2. Setup Supabase database
3. Deploy backend to Vercel
4. Deploy VPN servers
5. Configure environment variables
6. Replace placeholder icons
7. Submit to Chrome Web Store

### For Development:
1. Read **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)**
2. Setup development environment
3. Pick an issue or feature
4. Write tests
5. Submit a PR

---

**Ready to test? See [TESTING.md](./TESTING.md) for a complete testing guide!**

**Questions? Open an issue or discussion on GitHub!**
