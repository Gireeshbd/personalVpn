# Personal VPN Chrome Extension - Production-Ready Development Plan

**Version**: 1.0
**Status**: Implementation Roadmap
**Date**: 2025-11-04
**Branch**: claude/readme-production-planning-011CUoQf3p2cdCfe8wgeZeRx

---

## Executive Summary

This document provides a comprehensive production-ready development plan for the Personal VPN Chrome Extension. It builds upon the initial project plan (README.md) and provides detailed technical specifications, implementation strategies, quality assurance processes, and operational procedures required for a production deployment.

**Key Objectives:**

- Transform the conceptual plan into production-ready code
- Establish robust development, testing, and deployment workflows
- Ensure security, scalability, and maintainability
- Maintain operational costs under $100/month
- Achieve 99%+ uptime and reliable performance

---

## Table of Contents

1. [Project Structure & Architecture](#1-project-structure--architecture)
2. [Development Environment Setup](#2-development-environment-setup)
3. [Technology Stack Details](#3-technology-stack-details)
4. [Chrome Extension Implementation](#4-chrome-extension-implementation)
5. [Backend API Implementation](#5-backend-api-implementation)
6. [VPN Infrastructure Setup](#6-vpn-infrastructure-setup)
7. [Security Implementation](#7-security-implementation)
8. [Testing Strategy](#8-testing-strategy)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Monitoring & Observability](#10-monitoring--observability)
11. [Deployment Strategy](#11-deployment-strategy)
12. [Documentation Requirements](#12-documentation-requirements)
13. [Production Readiness Checklist](#13-production-readiness-checklist)
14. [Operational Runbooks](#14-operational-runbooks)
15. [Sprint Planning](#15-sprint-planning)

---

## 1. Project Structure & Architecture

### 1.1 Monorepo Structure

```
personalVpn/
├── README.md                      # Project overview
├── PRODUCTION_PLAN.md            # This document
├── .github/
│   └── workflows/
│       ├── extension-ci.yml      # Chrome extension CI/CD
│       ├── backend-ci.yml        # Backend API CI/CD
│       └── infrastructure.yml     # Infrastructure deployment
├── packages/
│   ├── chrome-extension/
│   │   ├── manifest.json         # Manifest V3 configuration
│   │   ├── src/
│   │   │   ├── background/       # Service worker
│   │   │   ├── popup/            # Extension popup UI
│   │   │   ├── options/          # Settings page
│   │   │   ├── content/          # Content scripts (if needed)
│   │   │   ├── lib/              # Shared utilities
│   │   │   ├── api/              # API client
│   │   │   └── types/            # TypeScript definitions
│   │   ├── public/
│   │   │   ├── icons/            # Extension icons
│   │   │   └── assets/           # Static assets
│   │   ├── tests/
│   │   │   ├── unit/             # Unit tests
│   │   │   ├── integration/      # Integration tests
│   │   │   └── e2e/              # End-to-end tests
│   │   ├── webpack.config.js     # Build configuration
│   │   ├── tsconfig.json         # TypeScript config
│   │   └── package.json
│   │
│   ├── backend-api/
│   │   ├── api/                  # Serverless API endpoints
│   │   │   ├── auth/             # Authentication endpoints
│   │   │   ├── servers/          # Server list management
│   │   │   ├── users/            # User management
│   │   │   └── analytics/        # Usage analytics
│   │   ├── lib/
│   │   │   ├── db/               # Database utilities
│   │   │   ├── auth/             # Auth middleware
│   │   │   ├── validation/       # Input validation
│   │   │   └── utils/            # Shared utilities
│   │   ├── tests/
│   │   ├── supabase/
│   │   │   ├── migrations/       # Database migrations
│   │   │   └── schemas/          # Schema definitions
│   │   ├── vercel.json           # Vercel configuration
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── infrastructure/
│   │   ├── terraform/            # Infrastructure as Code
│   │   │   ├── oracle-cloud/    # Oracle Cloud setup
│   │   │   ├── vps-servers/     # VPS configurations
│   │   │   └── monitoring/      # Monitoring setup
│   │   ├── ansible/              # Configuration management
│   │   │   ├── playbooks/
│   │   │   ├── roles/
│   │   │   └── inventory/
│   │   ├── wireguard/            # WireGuard configs
│   │   │   ├── server-setup.sh
│   │   │   ├── client-gen.sh
│   │   │   └── templates/
│   │   └── monitoring/           # Monitoring configs
│   │       ├── netdata/
│   │       ├── uptime-kuma/
│   │       └── prometheus/
│   │
│   └── shared/
│       ├── types/                # Shared TypeScript types
│       ├── constants/            # Shared constants
│       └── utils/                # Shared utilities
├── docs/
│   ├── API.md                    # API documentation
│   ├── ARCHITECTURE.md           # Architecture diagrams
│   ├── DEPLOYMENT.md             # Deployment guide
│   ├── SECURITY.md               # Security documentation
│   ├── CONTRIBUTING.md           # Contribution guidelines
│   └── RUNBOOKS.md               # Operational runbooks
├── scripts/
│   ├── setup-dev.sh              # Dev environment setup
│   ├── deploy-extension.sh       # Extension deployment
│   ├── deploy-backend.sh         # Backend deployment
│   └── health-check.sh           # Health check script
├── .eslintrc.js                  # Linting configuration
├── .prettierrc                   # Code formatting
├── tsconfig.base.json            # Base TypeScript config
└── package.json                  # Root package.json

```

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CHROME EXTENSION                          │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Popup    │  │   Service    │  │   Options    │        │
│  │     UI     │◄─┤    Worker    ├─►│     Page     │        │
│  └────────────┘  └──────┬───────┘  └──────────────┘        │
│                          │                                   │
│                          │ Proxy Config                      │
│                          ▼                                   │
│                  ┌───────────────┐                           │
│                  │ Proxy Manager │                           │
│                  └───────┬───────┘                           │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           │ HTTPS/REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   CONTROL SERVER (Vercel)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │   Servers    │  │  Analytics   │      │
│  │     API      │  │     API      │  │     API      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                   │
│                           ▼                                   │
│                  ┌────────────────┐                           │
│                  │   Supabase     │                           │
│                  │   PostgreSQL   │                           │
│                  └────────────────┘                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  VPN Server │ │  VPN Server │ │  VPN Server │
    │   (US-East) │ │  (EU-West)  │ │  (Asia-SG)  │
    │             │ │             │ │             │
    │ WireGuard   │ │ WireGuard   │ │ WireGuard   │
    │ Oracle Free │ │ Contabo VPS │ │ Hetzner VPS │
    └─────────────┘ └─────────────┘ └─────────────┘
```

### 1.3 Data Flow Architecture

```
User Action (Connect) → Extension Popup
                          ↓
                   Service Worker
                          ↓
              Request Server List (API)
                          ↓
            Backend validates JWT token
                          ↓
         Return available servers + config
                          ↓
       Extension configures Chrome Proxy
                          ↓
        User traffic → Proxy → VPN Server
                          ↓
                  Internet (Proxied)
```

---

## 2. Development Environment Setup

### 2.1 Prerequisites

**Required Software:**

- Node.js 18+ LTS
- npm or pnpm (recommended for monorepo)
- Git
- Docker (for local testing)
- Chrome Browser (latest)
- VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin
  - Chrome Extension Development

**System Requirements:**

- OS: Linux, macOS, or Windows with WSL2
- RAM: 8GB minimum (16GB recommended)
- Storage: 10GB free space

### 2.2 Initial Setup Script

```bash
#!/bin/bash
# scripts/setup-dev.sh

echo "🚀 Setting up Personal VPN development environment..."

# Check Node.js version
required_version=18
current_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$current_version" -lt "$required_version" ]; then
    echo "❌ Node.js version $required_version or higher required"
    exit 1
fi

# Install pnpm if not installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup git hooks
echo "🪝 Setting up git hooks..."
pnpm husky install

# Copy environment variables
echo "📝 Setting up environment variables..."
if [ ! -f "packages/backend-api/.env.local" ]; then
    cp packages/backend-api/.env.example packages/backend-api/.env.local
    echo "⚠️  Please configure packages/backend-api/.env.local"
fi

if [ ! -f "packages/chrome-extension/.env.local" ]; then
    cp packages/chrome-extension/.env.example packages/chrome-extension/.env.local
    echo "⚠️  Please configure packages/chrome-extension/.env.local"
fi

echo "✅ Development environment setup complete!"
echo ""
echo "Next steps:"
echo "  1. Configure environment variables"
echo "  2. Run 'pnpm dev' to start development"
echo "  3. Read docs/CONTRIBUTING.md for development guidelines"
```

### 2.3 Environment Variables

**Chrome Extension (.env.local):**

```env
VITE_API_BASE_URL=https://api.personalvpn.dev
VITE_API_TIMEOUT=10000
VITE_ENVIRONMENT=development
VITE_SENTRY_DSN=
VITE_ANALYTICS_ENABLED=false
```

**Backend API (.env.local):**

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_KEY=xxxxx

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900000

# Monitoring
SENTRY_DSN=
LOG_LEVEL=debug

# Environment
NODE_ENV=development
```

---

## 3. Technology Stack Details

### 3.1 Chrome Extension Stack

| Category         | Technology   | Version | Justification                       |
| ---------------- | ------------ | ------- | ----------------------------------- |
| Framework        | React        | 18.x    | Component reusability, modern hooks |
| Build Tool       | Vite         | 5.x     | Fast HMR, modern ES modules         |
| Language         | TypeScript   | 5.x     | Type safety, better DX              |
| State Management | Zustand      | 4.x     | Lightweight, simple API             |
| HTTP Client      | Axios        | 1.x     | Interceptors, request cancellation  |
| UI Components    | Tailwind CSS | 3.x     | Utility-first, small bundle         |
| Icons            | Lucide React | 0.x     | Modern, lightweight icons           |
| Testing          | Jest + RTL   | Latest  | Standard testing solution           |
| E2E Testing      | Puppeteer    | Latest  | Chrome automation                   |

### 3.2 Backend API Stack

| Category      | Technology        | Version | Justification             |
| ------------- | ----------------- | ------- | ------------------------- |
| Runtime       | Node.js           | 18 LTS  | Serverless compatibility  |
| Platform      | Vercel            | Latest  | Free tier, edge network   |
| Language      | TypeScript        | 5.x     | Type safety               |
| Database      | Supabase          | Latest  | Free tier, PostgreSQL     |
| ORM           | Prisma            | 5.x     | Type-safe queries         |
| Validation    | Zod               | 3.x     | Runtime type validation   |
| Auth          | JWT               | Latest  | Stateless authentication  |
| API Framework | Vercel Serverless | Latest  | Native Vercel integration |
| Testing       | Jest + Supertest  | Latest  | API testing               |

### 3.3 Infrastructure Stack

| Category     | Technology  | Version   | Justification          |
| ------------ | ----------- | --------- | ---------------------- |
| VPN Protocol | WireGuard   | Latest    | Modern, fast, secure   |
| OS           | Ubuntu      | 22.04 LTS | Stability, support     |
| IaC          | Terraform   | 1.6+      | Infrastructure as code |
| Config Mgmt  | Ansible     | 2.14+     | Server provisioning    |
| Monitoring   | Netdata     | Latest    | Real-time metrics      |
| Uptime       | Uptime Kuma | Latest    | Self-hosted monitoring |
| Logging      | Loki        | Latest    | Log aggregation        |
| Firewall     | UFW         | Latest    | Simple firewall        |

---

## 4. Chrome Extension Implementation

### 4.1 Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "Personal VPN",
  "version": "1.0.0",
  "description": "Free, privacy-focused VPN for secure browsing",
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png"
    }
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "permissions": ["proxy", "storage", "alarms"],
  "host_permissions": ["https://api.personalvpn.dev/*"],
  "options_page": "options.html",
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### 4.2 Key Components Implementation

#### 4.2.1 Service Worker (Background Script)

**File**: `packages/chrome-extension/src/background/index.ts`

```typescript
import { ProxyManager } from './proxy-manager';
import { ApiClient } from '../api/client';
import { StorageManager } from '../lib/storage';
import { ConnectionManager } from './connection-manager';

class BackgroundService {
  private proxyManager: ProxyManager;
  private apiClient: ApiClient;
  private storage: StorageManager;
  private connectionManager: ConnectionManager;

  constructor() {
    this.storage = new StorageManager();
    this.apiClient = new ApiClient();
    this.proxyManager = new ProxyManager();
    this.connectionManager = new ConnectionManager(
      this.proxyManager,
      this.apiClient,
      this.storage
    );

    this.initialize();
  }

  private async initialize() {
    // Restore connection state on startup
    const state = await this.storage.getConnectionState();
    if (state.isConnected) {
      await this.connectionManager.reconnect();
    }

    // Setup listeners
    this.setupMessageListeners();
    this.setupAlarms();
  }

  private setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep channel open for async response
    });
  }

  private async handleMessage(message: any, sender: any, sendResponse: Function) {
    try {
      switch (message.type) {
        case 'CONNECT':
          const result = await this.connectionManager.connect(message.serverId);
          sendResponse({ success: true, data: result });
          break;

        case 'DISCONNECT':
          await this.connectionManager.disconnect();
          sendResponse({ success: true });
          break;

        case 'GET_STATUS':
          const status = await this.connectionManager.getStatus();
          sendResponse({ success: true, data: status });
          break;

        case 'GET_SERVERS':
          const servers = await this.apiClient.getServers();
          sendResponse({ success: true, data: servers });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  private setupAlarms() {
    // Health check every 5 minutes
    chrome.alarms.create('healthCheck', { periodInMinutes: 5 });

    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'healthCheck') {
        this.connectionManager.performHealthCheck();
      }
    });
  }
}

// Initialize background service
new BackgroundService();
```

#### 4.2.2 Proxy Manager

**File**: `packages/chrome-extension/src/background/proxy-manager.ts`

```typescript
import { ProxyConfig } from '../types';

export class ProxyManager {
  async setProxy(config: ProxyConfig): Promise<void> {
    const proxyConfig = {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: config.protocol, // 'http', 'https', 'socks5'
          host: config.host,
          port: config.port,
        },
        bypassList: ['localhost', '127.0.0.1', '<local>'],
      },
    };

    return new Promise((resolve, reject) => {
      chrome.proxy.settings.set({ value: proxyConfig, scope: 'regular' }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  async clearProxy(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.proxy.settings.clear({ scope: 'regular' }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  async getCurrentProxy(): Promise<any> {
    return new Promise((resolve) => {
      chrome.proxy.settings.get({ incognito: false }, (config) => {
        resolve(config);
      });
    });
  }
}
```

#### 4.2.3 Connection Manager

**File**: `packages/chrome-extension/src/background/connection-manager.ts`

```typescript
import { ProxyManager } from './proxy-manager';
import { ApiClient } from '../api/client';
import { StorageManager } from '../lib/storage';
import { ConnectionState, Server } from '../types';

export class ConnectionManager {
  private currentServer: Server | null = null;
  private connectionState: ConnectionState = 'disconnected';

  constructor(
    private proxyManager: ProxyManager,
    private apiClient: ApiClient,
    private storage: StorageManager
  ) {}

  async connect(serverId: string): Promise<ConnectionState> {
    try {
      this.connectionState = 'connecting';
      this.notifyStateChange();

      // Get server configuration from API
      const serverConfig = await this.apiClient.getServerConfig(serverId);

      // Set proxy
      await this.proxyManager.setProxy({
        protocol: serverConfig.protocol,
        host: serverConfig.host,
        port: serverConfig.port,
      });

      // Verify connection
      const isConnected = await this.verifyConnection();

      if (isConnected) {
        this.currentServer = serverConfig;
        this.connectionState = 'connected';
        await this.storage.setConnectionState({
          isConnected: true,
          serverId: serverId,
          connectedAt: Date.now(),
        });

        // Track connection analytics
        await this.apiClient.trackConnection(serverId);
      } else {
        throw new Error('Connection verification failed');
      }

      this.notifyStateChange();
      return this.connectionState;
    } catch (error) {
      this.connectionState = 'error';
      this.notifyStateChange();
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.proxyManager.clearProxy();
      this.currentServer = null;
      this.connectionState = 'disconnected';

      await this.storage.setConnectionState({
        isConnected: false,
        serverId: null,
        connectedAt: null,
      });

      this.notifyStateChange();
    } catch (error) {
      console.error('Disconnect error:', error);
      throw error;
    }
  }

  async reconnect(): Promise<void> {
    const state = await this.storage.getConnectionState();
    if (state.serverId) {
      await this.connect(state.serverId);
    }
  }

  async getStatus(): Promise<any> {
    return {
      state: this.connectionState,
      server: this.currentServer,
      timestamp: Date.now(),
    };
  }

  async performHealthCheck(): Promise<void> {
    if (this.connectionState === 'connected') {
      const isHealthy = await this.verifyConnection();
      if (!isHealthy) {
        console.warn('Health check failed, attempting reconnect...');
        await this.reconnect();
      }
    }
  }

  private async verifyConnection(): Promise<boolean> {
    try {
      // Check if we can reach our API through the proxy
      const response = await this.apiClient.ping();
      return response.success;
    } catch (error) {
      return false;
    }
  }

  private notifyStateChange(): void {
    // Send message to popup and other listeners
    chrome.runtime.sendMessage({
      type: 'CONNECTION_STATE_CHANGED',
      state: this.connectionState,
      server: this.currentServer,
    });

    // Update badge
    this.updateBadge();
  }

  private updateBadge(): void {
    const badgeConfig = {
      disconnected: { text: '', color: '#808080' },
      connecting: { text: '...', color: '#FFA500' },
      connected: { text: '✓', color: '#00AA00' },
      error: { text: '!', color: '#FF0000' },
    };

    const config = badgeConfig[this.connectionState];
    chrome.action.setBadgeText({ text: config.text });
    chrome.action.setBadgeBackgroundColor({ color: config.color });
  }
}
```

#### 4.2.4 Popup UI Component

**File**: `packages/chrome-extension/src/popup/App.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { ConnectionState, Server } from '../types';
import { sendMessage } from '../lib/messaging';

export const App: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
    setupListeners();
  }, []);

  const loadInitialData = async () => {
    try {
      const [statusResponse, serversResponse] = await Promise.all([
        sendMessage({ type: 'GET_STATUS' }),
        sendMessage({ type: 'GET_SERVERS' })
      ]);

      setConnectionState(statusResponse.data.state);
      setServers(serversResponse.data);

      if (statusResponse.data.server) {
        setSelectedServer(statusResponse.data.server.id);
      } else if (serversResponse.data.length > 0) {
        setSelectedServer(serversResponse.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const setupListeners = () => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'CONNECTION_STATE_CHANGED') {
        setConnectionState(message.state);
      }
    });
  };

  const handleConnect = async () => {
    if (!selectedServer) return;

    setLoading(true);
    try {
      await sendMessage({ type: 'CONNECT', serverId: selectedServer });
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await sendMessage({ type: 'DISCONNECT' });
    } catch (error) {
      console.error('Disconnect failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 p-4 bg-gray-50">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Personal VPN</h1>
        <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
          connectionState === 'connected' ? 'bg-green-100 text-green-800' :
          connectionState === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
          connectionState === 'error' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {connectionState.toUpperCase()}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Server
        </label>
        <select
          value={selectedServer || ''}
          onChange={(e) => setSelectedServer(e.target.value)}
          disabled={connectionState === 'connected' || loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          {servers.map((server) => (
            <option key={server.id} value={server.id}>
              {server.name} - {server.location}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {connectionState === 'disconnected' || connectionState === 'error' ? (
          <button
            onClick={handleConnect}
            disabled={loading || !selectedServer}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        )}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Settings
        </button>
      </div>
    </div>
  );
};
```

### 4.3 Build Configuration

**File**: `packages/chrome-extension/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        popup: 'popup.html',
        options: 'options.html',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
});
```

---

## 5. Backend API Implementation

### 5.1 Database Schema

**File**: `packages/backend-api/supabase/migrations/001_initial_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- VPN Servers table
CREATE TABLE vpn_servers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL,
  protocol VARCHAR(50) NOT NULL, -- 'socks5', 'http', 'https'
  capacity INTEGER NOT NULL DEFAULT 1000,
  current_load INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  health_status VARCHAR(50) DEFAULT 'healthy', -- 'healthy', 'degraded', 'down'
  last_health_check TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connections table (tracking active connections)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  server_id UUID REFERENCES vpn_servers(id) ON DELETE CASCADE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  bytes_sent BIGINT DEFAULT 0,
  bytes_received BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Usage analytics table
CREATE TABLE usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  server_id UUID REFERENCES vpn_servers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_bytes BIGINT DEFAULT 0,
  connection_count INTEGER DEFAULT 0,
  connection_duration INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, server_id, date)
);

-- Rate limiting table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Indexes
CREATE INDEX idx_users_anonymous_id ON users(anonymous_id);
CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connections_server_id ON connections(server_id);
CREATE INDEX idx_connections_active ON connections(is_active) WHERE is_active = true;
CREATE INDEX idx_usage_analytics_user_date ON usage_analytics(user_id, date);
CREATE INDEX idx_vpn_servers_active ON vpn_servers(is_active) WHERE is_active = true;

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_vpn_servers_updated_at BEFORE UPDATE ON vpn_servers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 API Endpoints

#### 5.2.1 Authentication API

**File**: `packages/backend-api/api/auth/register.ts`

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { supabase } from '../../lib/db/supabase';
import { generateJWT } from '../../lib/auth/jwt';
import { v4 as uuidv4 } from 'uuid';

const registerSchema = z.object({
  deviceId: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = registerSchema.parse(req.body);

    // Generate anonymous user ID
    const anonymousId = body.deviceId || uuidv4();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, anonymous_id')
      .eq('anonymous_id', anonymousId)
      .single();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;

      // Update last seen
      await supabase
        .from('users')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', userId);
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({ anonymous_id: anonymousId })
        .select()
        .single();

      if (error) throw error;
      userId = newUser.id;
    }

    // Generate JWT token
    const token = generateJWT({ userId, anonymousId });

    res.status(200).json({
      success: true,
      data: {
        token,
        userId,
        anonymousId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
```

#### 5.2.2 Servers API

**File**: `packages/backend-api/api/servers/list.ts`

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/db/supabase';
import { verifyAuth } from '../../lib/auth/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const user = await verifyAuth(req);

    // Get active servers with low load
    const { data: servers, error } = await supabase
      .from('vpn_servers')
      .select(
        'id, name, location, country_code, protocol, current_load, capacity, health_status'
      )
      .eq('is_active', true)
      .eq('health_status', 'healthy')
      .order('current_load', { ascending: true });

    if (error) throw error;

    // Calculate load percentage and filter
    const availableServers = servers
      .filter((server) => server.current_load / server.capacity < 0.9)
      .map((server) => ({
        id: server.id,
        name: server.name,
        location: server.location,
        countryCode: server.country_code,
        protocol: server.protocol,
        load: Math.round((server.current_load / server.capacity) * 100),
      }));

    res.status(200).json({
      success: true,
      data: availableServers,
    });
  } catch (error) {
    console.error('List servers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch servers',
    });
  }
}
```

**File**: `packages/backend-api/api/servers/config.ts`

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { supabase } from '../../lib/db/supabase';
import { verifyAuth } from '../../lib/auth/middleware';

const configSchema = z.object({
  serverId: z.string().uuid(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req);
    const { serverId } = configSchema.parse(req.body);

    // Get server configuration
    const { data: server, error } = await supabase
      .from('vpn_servers')
      .select('*')
      .eq('id', serverId)
      .eq('is_active', true)
      .single();

    if (error || !server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found',
      });
    }

    // Check server capacity
    if (server.current_load >= server.capacity) {
      return res.status(503).json({
        success: false,
        error: 'Server at capacity',
      });
    }

    // Increment server load
    await supabase
      .from('vpn_servers')
      .update({ current_load: server.current_load + 1 })
      .eq('id', serverId);

    // Create connection record
    await supabase.from('connections').insert({
      user_id: user.userId,
      server_id: serverId,
      is_active: true,
    });

    res.status(200).json({
      success: true,
      data: {
        id: server.id,
        name: server.name,
        host: server.host,
        port: server.port,
        protocol: server.protocol,
      },
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
```

### 5.3 Authentication Middleware

**File**: `packages/backend-api/lib/auth/middleware.ts`

```typescript
import { VercelRequest } from '@vercel/node';
import { verifyJWT } from './jwt';

export async function verifyAuth(req: VercelRequest): Promise<any> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyJWT(token);
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

**File**: `packages/backend-api/lib/auth/jwt.ts`

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

export function generateJWT(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyJWT(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}
```

---

## 6. VPN Infrastructure Setup

### 6.1 WireGuard Server Setup Script

**File**: `packages/infrastructure/wireguard/server-setup.sh`

```bash
#!/bin/bash
# WireGuard VPN Server Setup Script
# For Ubuntu 22.04 LTS

set -e

echo "🚀 Starting WireGuard VPN Server Setup..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root"
  exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install WireGuard
echo "📦 Installing WireGuard..."
apt install -y wireguard wireguard-tools

# Enable IP forwarding
echo "🔧 Enabling IP forwarding..."
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.all.forwarding=1" >> /etc/sysctl.conf
sysctl -p

# Generate server keys
echo "🔑 Generating server keys..."
cd /etc/wireguard
umask 077
wg genkey | tee server_private.key | wg pubkey > server_public.key

SERVER_PRIVATE_KEY=$(cat server_private.key)
SERVER_PUBLIC_KEY=$(cat server_public.key)

# Get server IP and network interface
SERVER_IP=$(ip -4 addr show $(ip route | grep default | awk '{print $5}') | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
NET_INTERFACE=$(ip route | grep default | awk '{print $5}')

# Create WireGuard configuration
echo "📝 Creating WireGuard configuration..."
cat > /etc/wireguard/wg0.conf <<EOF
[Interface]
Address = 10.8.0.1/24
ListenPort = 51820
PrivateKey = $SERVER_PRIVATE_KEY

# Port forwarding
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o $NET_INTERFACE -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o $NET_INTERFACE -j MASQUERADE
EOF

# Configure UFW firewall
echo "🔥 Configuring firewall..."
ufw allow 51820/udp
ufw allow OpenSSH
ufw --force enable

# Allow forwarding in UFW
sed -i 's/DEFAULT_FORWARD_POLICY="DROP"/DEFAULT_FORWARD_POLICY="ACCEPT"/' /etc/default/ufw

# Enable and start WireGuard
echo "🚀 Starting WireGuard..."
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

echo "✅ WireGuard VPN Server Setup Complete!"
echo ""
echo "Server Public Key: $SERVER_PUBLIC_KEY"
echo "Server IP: $SERVER_IP"
echo "Listen Port: 51820"
echo ""
echo "To add clients, use the client-gen.sh script"
```

### 6.2 SOCKS5 Proxy Setup (Alternative/Fallback)

**File**: `packages/infrastructure/proxy/socks5-setup.sh`

```bash
#!/bin/bash
# SOCKS5 Proxy Server Setup Script
# Using Dante SOCKS server

set -e

echo "🚀 Starting SOCKS5 Proxy Setup..."

# Install Dante
apt update
apt install -y dante-server

# Backup original config
cp /etc/danted.conf /etc/danted.conf.backup

# Get network interface
NET_INTERFACE=$(ip route | grep default | awk '{print $5}')

# Create Dante configuration
cat > /etc/danted.conf <<EOF
logoutput: syslog

# Internal network interface
internal: $NET_INTERFACE port = 1080

# External network interface
external: $NET_INTERFACE

# Authentication method
socksmethod: none

# Client rules
client pass {
    from: 0.0.0.0/0 to: 0.0.0.0/0
    log: error connect disconnect
}

# Server rules
socks pass {
    from: 0.0.0.0/0 to: 0.0.0.0/0
    protocol: tcp udp
    log: error connect disconnect
}
EOF

# Configure firewall
ufw allow 1080/tcp

# Restart Dante
systemctl restart danted
systemctl enable danted

echo "✅ SOCKS5 Proxy Setup Complete!"
echo "Proxy is listening on port 1080"
```

### 6.3 Terraform Configuration

**File**: `packages/infrastructure/terraform/main.tf`

```hcl
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

# Variables
variable "tenancy_ocid" {
  description = "Oracle Cloud Tenancy OCID"
  type        = string
}

variable "user_ocid" {
  description = "Oracle Cloud User OCID"
  type        = string
}

variable "fingerprint" {
  description = "API Key Fingerprint"
  type        = string
}

variable "private_key_path" {
  description = "Path to OCI API private key"
  type        = string
}

variable "region" {
  description = "Oracle Cloud Region"
  type        = string
  default     = "us-ashburn-1"
}

variable "ssh_public_key" {
  description = "SSH public key for instance access"
  type        = string
}

# Free tier instance (Always Free)
resource "oci_core_instance" "vpn_server" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.tenancy_ocid
  display_name        = "vpn-server-us-east"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = 2
    memory_in_gbs = 12
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    display_name     = "primary-vnic"
    assign_public_ip = true
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu_images.images[0].id
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(file("${path.module}/cloud-init.yaml"))
  }
}

# Data sources
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

data "oci_core_images" "ubuntu_images" {
  compartment_id           = var.tenancy_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# Network
resource "oci_core_vcn" "vpn_vcn" {
  cidr_block     = "10.0.0.0/16"
  compartment_id = var.tenancy_ocid
  display_name   = "vpn-vcn"
  dns_label      = "vpnvcn"
}

resource "oci_core_subnet" "public_subnet" {
  cidr_block        = "10.0.1.0/24"
  display_name      = "public-subnet"
  compartment_id    = var.tenancy_ocid
  vcn_id            = oci_core_vcn.vpn_vcn.id
  route_table_id    = oci_core_route_table.public_route_table.id
  security_list_ids = [oci_core_security_list.public_security_list.id]
  dhcp_options_id   = oci_core_vcn.vpn_vcn.default_dhcp_options_id
  dns_label         = "public"
}

resource "oci_core_internet_gateway" "internet_gateway" {
  compartment_id = var.tenancy_ocid
  display_name   = "internet-gateway"
  vcn_id         = oci_core_vcn.vpn_vcn.id
}

resource "oci_core_route_table" "public_route_table" {
  compartment_id = var.tenancy_ocid
  vcn_id         = oci_core_vcn.vpn_vcn.id
  display_name   = "public-route-table"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.internet_gateway.id
  }
}

resource "oci_core_security_list" "public_security_list" {
  compartment_id = var.tenancy_ocid
  vcn_id         = oci_core_vcn.vpn_vcn.id
  display_name   = "public-security-list"

  # Allow SSH
  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 22
      max = 22
    }
  }

  # Allow WireGuard
  ingress_security_rules {
    protocol = "17" # UDP
    source   = "0.0.0.0/0"
    udp_options {
      min = 51820
      max = 51820
    }
  }

  # Allow all outbound
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}

# Outputs
output "instance_public_ip" {
  value = oci_core_instance.vpn_server.public_ip
}

output "instance_id" {
  value = oci_core_instance.vpn_server.id
}
```

---

## 7. Security Implementation

### 7.1 Security Checklist

**Critical Security Measures:**

- [ ] **Extension Security**
  - [ ] Content Security Policy (CSP) properly configured
  - [ ] No eval() or inline scripts
  - [ ] Sensitive data encrypted in storage
  - [ ] Certificate pinning for API calls
  - [ ] Input validation on all user inputs
  - [ ] Secure random number generation

- [ ] **API Security**
  - [ ] JWT token authentication
  - [ ] Rate limiting per user/IP
  - [ ] Input validation using Zod
  - [ ] SQL injection prevention (Prisma/Supabase)
  - [ ] CORS properly configured
  - [ ] HTTPS only (TLS 1.3)
  - [ ] API request signing

- [ ] **Server Security**
  - [ ] Firewall rules (UFW) configured
  - [ ] SSH key-only authentication
  - [ ] Automatic security updates enabled
  - [ ] Fail2ban installed
  - [ ] Non-root user for services
  - [ ] SELinux/AppArmor enabled
  - [ ] Regular security audits

- [ ] **Data Security**
  - [ ] No-logs policy implemented
  - [ ] Minimal data retention
  - [ ] Encrypted database connections
  - [ ] Secure key management
  - [ ] Regular backups (encrypted)
  - [ ] GDPR compliance

### 7.2 Security Configuration Files

**File**: `packages/backend-api/lib/security/rate-limiter.ts`

```typescript
import { VercelRequest } from '@vercel/node';
import { supabase } from '../db/supabase';

const RATE_LIMITS = {
  '/api/auth/register': { requests: 5, window: 3600000 }, // 5 per hour
  '/api/servers/list': { requests: 100, window: 900000 }, // 100 per 15 min
  '/api/servers/config': { requests: 10, window: 600000 }, // 10 per 10 min
};

export async function checkRateLimit(
  req: VercelRequest,
  userId: string,
  endpoint: string
): Promise<boolean> {
  const limit = RATE_LIMITS[endpoint];
  if (!limit) return true;

  const { data: rateLimitRecord } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .single();

  const now = new Date();

  if (!rateLimitRecord) {
    // Create new rate limit record
    await supabase.from('rate_limits').insert({
      user_id: userId,
      endpoint,
      request_count: 1,
      window_start: now.toISOString(),
    });
    return true;
  }

  const windowStart = new Date(rateLimitRecord.window_start);
  const windowAge = now.getTime() - windowStart.getTime();

  if (windowAge > limit.window) {
    // Reset window
    await supabase
      .from('rate_limits')
      .update({
        request_count: 1,
        window_start: now.toISOString(),
      })
      .eq('id', rateLimitRecord.id);
    return true;
  }

  if (rateLimitRecord.request_count >= limit.requests) {
    return false; // Rate limit exceeded
  }

  // Increment count
  await supabase
    .from('rate_limits')
    .update({
      request_count: rateLimitRecord.request_count + 1,
    })
    .eq('id', rateLimitRecord.id);

  return true;
}
```

---

## 8. Testing Strategy

### 8.1 Testing Pyramid

```
         /\
        /  \          E2E Tests (10%)
       /----\         - Full user flows
      /      \        - Chrome extension in browser
     /--------\       Integration Tests (30%)
    /          \      - API endpoints
   /------------\     - Database operations
  /______________\    Unit Tests (60%)
                      - Pure functions
                      - Components
                      - Utilities
```

### 8.2 Unit Testing

**File**: `packages/chrome-extension/tests/unit/connection-manager.test.ts`

```typescript
import { ConnectionManager } from '../../src/background/connection-manager';
import { ProxyManager } from '../../src/background/proxy-manager';
import { ApiClient } from '../../src/api/client';
import { StorageManager } from '../../src/lib/storage';

jest.mock('../../src/background/proxy-manager');
jest.mock('../../src/api/client');
jest.mock('../../src/lib/storage');

describe('ConnectionManager', () => {
  let connectionManager: ConnectionManager;
  let mockProxyManager: jest.Mocked<ProxyManager>;
  let mockApiClient: jest.Mocked<ApiClient>;
  let mockStorage: jest.Mocked<StorageManager>;

  beforeEach(() => {
    mockProxyManager = new ProxyManager() as jest.Mocked<ProxyManager>;
    mockApiClient = new ApiClient() as jest.Mocked<ApiClient>;
    mockStorage = new StorageManager() as jest.Mocked<StorageManager>;

    connectionManager = new ConnectionManager(
      mockProxyManager,
      mockApiClient,
      mockStorage
    );
  });

  describe('connect', () => {
    it('should successfully connect to server', async () => {
      const serverId = 'server-123';
      const serverConfig = {
        id: serverId,
        protocol: 'socks5',
        host: '1.2.3.4',
        port: 1080,
      };

      mockApiClient.getServerConfig.mockResolvedValue(serverConfig);
      mockProxyManager.setProxy.mockResolvedValue();
      mockApiClient.ping.mockResolvedValue({ success: true });

      const result = await connectionManager.connect(serverId);

      expect(result).toBe('connected');
      expect(mockProxyManager.setProxy).toHaveBeenCalledWith({
        protocol: 'socks5',
        host: '1.2.3.4',
        port: 1080,
      });
      expect(mockStorage.setConnectionState).toHaveBeenCalledWith({
        isConnected: true,
        serverId,
        connectedAt: expect.any(Number),
      });
    });

    it('should handle connection failure', async () => {
      const serverId = 'server-123';
      mockApiClient.getServerConfig.mockRejectedValue(new Error('Server not found'));

      await expect(connectionManager.connect(serverId)).rejects.toThrow(
        'Server not found'
      );
    });
  });

  describe('disconnect', () => {
    it('should successfully disconnect', async () => {
      mockProxyManager.clearProxy.mockResolvedValue();

      await connectionManager.disconnect();

      expect(mockProxyManager.clearProxy).toHaveBeenCalled();
      expect(mockStorage.setConnectionState).toHaveBeenCalledWith({
        isConnected: false,
        serverId: null,
        connectedAt: null,
      });
    });
  });
});
```

### 8.3 Integration Testing

**File**: `packages/backend-api/tests/integration/servers.test.ts`

```typescript
import request from 'supertest';
import { app } from '../../app'; // Assuming we have an Express app
import { generateJWT } from '../../lib/auth/jwt';
import { supabase } from '../../lib/db/supabase';

describe('Servers API', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create test user
    const { data: user } = await supabase
      .from('users')
      .insert({ anonymous_id: 'test-user-123' })
      .select()
      .single();

    testUserId = user.id;
    authToken = generateJWT({ userId: testUserId, anonymousId: 'test-user-123' });

    // Insert test servers
    await supabase.from('vpn_servers').insert([
      {
        name: 'Test Server US',
        location: 'New York',
        country_code: 'US',
        host: '1.2.3.4',
        port: 1080,
        protocol: 'socks5',
        capacity: 1000,
        current_load: 100,
        is_active: true,
        health_status: 'healthy',
      },
    ]);
  });

  afterAll(async () => {
    // Cleanup
    await supabase.from('users').delete().eq('id', testUserId);
    await supabase.from('vpn_servers').delete().eq('name', 'Test Server US');
  });

  describe('GET /api/servers/list', () => {
    it('should return list of servers with valid auth', async () => {
      const response = await request(app)
        .get('/api/servers/list')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should reject request without auth token', async () => {
      const response = await request(app).get('/api/servers/list');

      expect(response.status).toBe(401);
    });
  });
});
```

### 8.4 E2E Testing

**File**: `packages/chrome-extension/tests/e2e/connection-flow.test.ts`

```typescript
import puppeteer from 'puppeteer';
import path from 'path';

describe('Connection Flow E2E', () => {
  let browser: puppeteer.Browser;
  let extensionId: string;

  beforeAll(async () => {
    // Load extension
    const extensionPath = path.resolve(__dirname, '../../dist');

    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    // Get extension ID
    const targets = await browser.targets();
    const extensionTarget = targets.find((target) => target.type() === 'service_worker');
    const serviceWorkerUrl = extensionTarget?.url() || '';
    extensionId = serviceWorkerUrl.split('/')[2];
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should complete full connection flow', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Wait for popup to load
    await page.waitForSelector('.connection-status');

    // Check initial state
    const initialStatus = await page.$eval('.connection-status', (el) => el.textContent);
    expect(initialStatus).toContain('DISCONNECTED');

    // Select server
    await page.select('select[name="server"]', 'server-1');

    // Click connect button
    await page.click('button.connect-btn');

    // Wait for connection
    await page.waitForSelector('.connection-status:contains("CONNECTED")', {
      timeout: 10000,
    });

    // Verify connected state
    const connectedStatus = await page.$eval(
      '.connection-status',
      (el) => el.textContent
    );
    expect(connectedStatus).toContain('CONNECTED');

    // Disconnect
    await page.click('button.disconnect-btn');

    // Verify disconnected
    await page.waitForSelector('.connection-status:contains("DISCONNECTED")');
  }, 30000);
});
```

---

## 9. CI/CD Pipeline

### 9.1 GitHub Actions - Extension CI

**File**: `.github/workflows/extension-ci.yml`

```yaml
name: Chrome Extension CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'packages/chrome-extension/**'
  pull_request:
    branches: [main]
    paths:
      - 'packages/chrome-extension/**'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: cd packages/chrome-extension && pnpm lint

      - name: Type check
        run: cd packages/chrome-extension && pnpm type-check

      - name: Run tests
        run: cd packages/chrome-extension && pnpm test

      - name: Build extension
        run: cd packages/chrome-extension && pnpm build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: extension-build
          path: packages/chrome-extension/dist/

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: extension-build
          path: dist/

      - name: Create release package
        run: cd dist && zip -r ../extension.zip .

      - name: Upload to Chrome Web Store
        uses: mnao305/chrome-extension-upload@v4
        with:
          file-path: extension.zip
          extension-id: ${{ secrets.CHROME_EXTENSION_ID }}
          client-id: ${{ secrets.CHROME_CLIENT_ID }}
          client-secret: ${{ secrets.CHROME_CLIENT_SECRET }}
          refresh-token: ${{ secrets.CHROME_REFRESH_TOKEN }}
```

### 9.2 GitHub Actions - Backend CI

**File**: `.github/workflows/backend-ci.yml`

```yaml
name: Backend API CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'packages/backend-api/**'
  pull_request:
    branches: [main]
    paths:
      - 'packages/backend-api/**'

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: cd packages/backend-api && pnpm lint

      - name: Type check
        run: cd packages/backend-api && pnpm type-check

      - name: Run migrations
        run: cd packages/backend-api && pnpm db:migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Run tests
        run: cd packages/backend-api && pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          JWT_SECRET: test-secret

      - name: Run integration tests
        run: cd packages/backend-api && pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          JWT_SECRET: test-secret

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: packages/backend-api
```

---

## 10. Monitoring & Observability

### 10.1 Monitoring Stack

**Components:**

1. **Netdata** - Real-time server metrics
2. **Uptime Kuma** - Uptime monitoring
3. **Sentry** - Error tracking
4. **Custom Dashboard** - Aggregated metrics

### 10.2 Health Check Endpoint

**File**: `packages/backend-api/api/health.ts`

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/db/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check database connection
    const { data, error } = await supabase.from('vpn_servers').select('count').limit(1);

    if (error) throw error;

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        api: 'ok',
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}
```

### 10.3 Server Monitoring Script

**File**: `packages/infrastructure/monitoring/health-monitor.sh`

```bash
#!/bin/bash
# Server Health Monitoring Script

WEBHOOK_URL="${ALERT_WEBHOOK_URL}"
SERVERS=("server1.example.com" "server2.example.com")

check_server() {
    local server=$1

    # Check WireGuard status
    if ! systemctl is-active --quiet wg-quick@wg0; then
        send_alert "WireGuard is down on $server"
        return 1
    fi

    # Check CPU usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        send_alert "High CPU usage on $server: ${cpu_usage}%"
    fi

    # Check memory usage
    mem_usage=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
    if (( $(echo "$mem_usage > 90" | bc -l) )); then
        send_alert "High memory usage on $server: ${mem_usage}%"
    fi

    # Check disk usage
    disk_usage=$(df -h / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    if [ "$disk_usage" -gt 85 ]; then
        send_alert "High disk usage on $server: ${disk_usage}%"
    fi

    return 0
}

send_alert() {
    local message=$1
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"🚨 ALERT: $message\"}"
}

# Main loop
for server in "${SERVERS[@]}"; do
    check_server "$server"
done
```

---

## 11. Deployment Strategy

### 11.1 Deployment Environments

| Environment | Purpose           | Branch     | Auto-Deploy         |
| ----------- | ----------------- | ---------- | ------------------- |
| Development | Local development | feature/\* | No                  |
| Staging     | Testing & QA      | develop    | Yes                 |
| Production  | Live users        | main       | Yes (with approval) |

### 11.2 Deployment Checklist

**Pre-Deployment:**

- [ ] All tests passing
- [ ] Code review approved
- [ ] Security scan completed
- [ ] Performance tested
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Rollback plan prepared

**Deployment:**

- [ ] Deploy backend API first
- [ ] Run database migrations
- [ ] Verify API health endpoints
- [ ] Deploy Chrome extension
- [ ] Smoke test critical paths
- [ ] Monitor error rates

**Post-Deployment:**

- [ ] Verify all services healthy
- [ ] Check error tracking dashboard
- [ ] Monitor user connections
- [ ] Review server metrics
- [ ] Document any issues

### 11.3 Rollback Procedure

```bash
#!/bin/bash
# Rollback script

echo "🔄 Starting rollback procedure..."

# Rollback Vercel deployment
vercel rollback --token=$VERCEL_TOKEN

# Revert database migrations if needed
cd packages/backend-api
pnpm db:migrate:rollback

# Notify team
curl -X POST $WEBHOOK_URL \
  -d '{"text": "⚠️ Production rollback completed"}'

echo "✅ Rollback complete"
```

---

## 12. Documentation Requirements

### 12.1 Required Documentation

**Technical Documentation:**

- [ ] API documentation (OpenAPI/Swagger)
- [ ] Architecture diagrams
- [ ] Database schema documentation
- [ ] Infrastructure setup guides
- [ ] Development environment setup
- [ ] Testing guidelines
- [ ] Deployment procedures
- [ ] Runbooks for common issues

**User Documentation:**

- [ ] User guide (how to use extension)
- [ ] FAQ
- [ ] Troubleshooting guide
- [ ] Privacy policy
- [ ] Terms of service

**Legal Documentation:**

- [ ] Privacy policy
- [ ] Terms of service
- [ ] Acceptable use policy
- [ ] Data retention policy
- [ ] GDPR compliance documentation

---

## 13. Production Readiness Checklist

### 13.1 Chrome Extension

- [ ] **Code Quality**
  - [ ] ESLint configured and passing
  - [ ] Prettier configured
  - [ ] TypeScript strict mode enabled
  - [ ] No console.log in production
  - [ ] Error handling implemented

- [ ] **Testing**
  - [ ] Unit tests (>80% coverage)
  - [ ] Integration tests
  - [ ] E2E tests
  - [ ] Manual testing completed

- [ ] **Security**
  - [ ] CSP configured
  - [ ] No sensitive data in code
  - [ ] Secure storage implementation
  - [ ] Input validation

- [ ] **Performance**
  - [ ] Bundle size optimized (<1MB)
  - [ ] Lazy loading implemented
  - [ ] Memory leaks checked

- [ ] **UI/UX**
  - [ ] Responsive design
  - [ ] Accessibility (WCAG 2.1 AA)
  - [ ] Error messages user-friendly
  - [ ] Loading states

- [ ] **Chrome Web Store**
  - [ ] Manifest V3 compliant
  - [ ] Icons all sizes (16,32,48,128)
  - [ ] Store listing prepared
  - [ ] Screenshots ready
  - [ ] Privacy policy linked

### 13.2 Backend API

- [ ] **Code Quality**
  - [ ] Linting passing
  - [ ] Type checking passing
  - [ ] Code review completed

- [ ] **Testing**
  - [ ] Unit tests (>80% coverage)
  - [ ] Integration tests
  - [ ] Load testing completed

- [ ] **Security**
  - [ ] Authentication implemented
  - [ ] Rate limiting configured
  - [ ] Input validation
  - [ ] SQL injection protected
  - [ ] HTTPS only

- [ ] **Database**
  - [ ] Migrations tested
  - [ ] Indexes optimized
  - [ ] Backup strategy
  - [ ] Connection pooling

- [ ] **Monitoring**
  - [ ] Health endpoints
  - [ ] Error tracking (Sentry)
  - [ ] Logging configured
  - [ ] Alerts set up

- [ ] **Documentation**
  - [ ] API documentation
  - [ ] README complete
  - [ ] Deployment guide

### 13.3 Infrastructure

- [ ] **VPN Servers**
  - [ ] WireGuard configured
  - [ ] Firewall rules set
  - [ ] SSH hardened
  - [ ] Auto-updates enabled

- [ ] **Monitoring**
  - [ ] Netdata installed
  - [ ] Uptime Kuma configured
  - [ ] Alert webhooks set

- [ ] **Backups**
  - [ ] Database backup automated
  - [ ] Config backups
  - [ ] Restore tested

- [ ] **Disaster Recovery**
  - [ ] Runbooks created
  - [ ] Rollback procedures
  - [ ] Incident response plan

---

## 14. Operational Runbooks

### 14.1 Incident Response

**High User Load:**

```
1. Check current server loads
2. If >80%, enable rate limiting
3. Scale up if budget allows
4. Communicate with users if degraded
5. Monitor for recovery
```

**Server Down:**

```
1. Check server health monitoring
2. SSH into server and check logs
3. Restart WireGuard if needed
4. If unresponsive, mark server as down in DB
5. Redirect users to alternative servers
6. Investigate root cause
7. Post-mortem after resolution
```

**API Errors:**

```
1. Check Sentry dashboard
2. Review error logs
3. Check Vercel deployment status
4. If critical, rollback deployment
5. Fix issue and redeploy
6. Monitor error rates
```

### 14.2 Regular Maintenance

**Weekly:**

- [ ] Review server metrics
- [ ] Check error logs
- [ ] Review user feedback
- [ ] Update dependencies (patch)

**Monthly:**

- [ ] Security updates
- [ ] Review costs
- [ ] Backup verification
- [ ] Performance analysis
- [ ] Capacity planning

**Quarterly:**

- [ ] Security audit
- [ ] Infrastructure review
- [ ] Documentation update
- [ ] Disaster recovery test

---

## 15. Sprint Planning

### Sprint 1: Foundation (Week 1-2)

**Goals:**

- Set up development environment
- Initialize project structure
- Configure CI/CD pipelines

**Tasks:**

- [ ] Create monorepo structure
- [ ] Setup GitHub repository
- [ ] Configure development environment
- [ ] Setup CI/CD workflows
- [ ] Initialize backend API skeleton
- [ ] Initialize Chrome extension skeleton
- [ ] Setup Supabase database
- [ ] Create initial database schema

**Deliverables:**

- Working development environment
- CI/CD pipelines functional
- Basic project structure

### Sprint 2: Backend API (Week 3-4)

**Goals:**

- Implement core backend functionality
- Database operations working
- API endpoints functional

**Tasks:**

- [ ] Implement authentication API
- [ ] Implement servers API
- [ ] Implement rate limiting
- [ ] Write API tests
- [ ] Setup error tracking
- [ ] Deploy to Vercel staging

**Deliverables:**

- Functional backend API
- API documentation
- Tests passing

### Sprint 3: Chrome Extension Core (Week 5-6)

**Goals:**

- Core extension functionality
- Connection management working
- Basic UI complete

**Tasks:**

- [ ] Implement service worker
- [ ] Implement proxy manager
- [ ] Implement connection manager
- [ ] Create popup UI
- [ ] Integrate with backend API
- [ ] Write extension tests

**Deliverables:**

- Working Chrome extension
- Can connect/disconnect
- Server selection working

### Sprint 4: Infrastructure (Week 7-8)

**Goals:**

- VPN servers deployed
- Monitoring set up
- Infrastructure as code

**Tasks:**

- [ ] Setup Oracle Cloud server
- [ ] Install WireGuard
- [ ] Setup additional VPS servers
- [ ] Configure Terraform
- [ ] Setup monitoring (Netdata, Uptime Kuma)
- [ ] Create health monitoring scripts
- [ ] Document server setup

**Deliverables:**

- 3 VPN servers operational
- Monitoring dashboard live
- Infrastructure documented

### Sprint 5: Testing & Security (Week 9-10)

**Goals:**

- Comprehensive testing complete
- Security hardened
- Performance optimized

**Tasks:**

- [ ] Complete unit tests
- [ ] Complete integration tests
- [ ] Complete E2E tests
- [ ] Security audit
- [ ] Performance testing
- [ ] Load testing
- [ ] Fix identified issues

**Deliverables:**

- Test coverage >80%
- Security audit passed
- Performance benchmarks met

### Sprint 6: Polish & Documentation (Week 11-12)

**Goals:**

- UI/UX polished
- Documentation complete
- Production ready

**Tasks:**

- [ ] UI/UX improvements
- [ ] Write user documentation
- [ ] Write developer documentation
- [ ] Create privacy policy
- [ ] Create terms of service
- [ ] Prepare Chrome Web Store listing
- [ ] Final security review

**Deliverables:**

- Polished user interface
- Complete documentation
- Legal documents ready

### Sprint 7: Launch (Week 13-14)

**Goals:**

- Deploy to production
- Submit to Chrome Web Store
- Monitor launch

**Tasks:**

- [ ] Deploy backend to production
- [ ] Deploy VPN infrastructure
- [ ] Build production extension
- [ ] Submit to Chrome Web Store
- [ ] Setup production monitoring
- [ ] Launch communication
- [ ] Monitor for issues

**Deliverables:**

- Live in Chrome Web Store
- Production systems operational
- Launch successful

### Sprint 8: Post-Launch (Week 15-16)

**Goals:**

- Stabilize production
- Gather user feedback
- Fix critical issues

**Tasks:**

- [ ] Monitor error rates
- [ ] Review user feedback
- [ ] Fix critical bugs
- [ ] Optimize based on metrics
- [ ] Document lessons learned
- [ ] Plan next features

**Deliverables:**

- Stable production system
- User feedback incorporated
- Future roadmap

---

## 16. Success Metrics & KPIs

### 16.1 Technical Metrics

| Metric                  | Target     | Critical Threshold |
| ----------------------- | ---------- | ------------------ |
| API Response Time       | <200ms p95 | >500ms             |
| Extension Load Time     | <1s        | >3s                |
| Server Uptime           | 99.5%      | <98%               |
| Error Rate              | <0.1%      | >1%                |
| Connection Success Rate | >95%       | <90%               |
| Test Coverage           | >80%       | <70%               |

### 16.2 Business Metrics

| Metric              | Target (3 months) | Measurement        |
| ------------------- | ----------------- | ------------------ |
| Active Users        | 500-1000          | DAU/MAU            |
| User Retention      | >70%              | 30-day retention   |
| Cost per User       | <$0.10            | Monthly cost / MAU |
| Chrome Store Rating | >4.0 stars        | User reviews       |
| Support Tickets     | <5% of users      | Ticket volume      |

### 16.3 Operational Metrics

| Metric                 | Target   | Alert Threshold |
| ---------------------- | -------- | --------------- |
| Monthly Cost           | <$80     | >$90            |
| Bandwidth per Server   | <5TB     | >4.5TB          |
| CPU Usage              | <60% avg | >80%            |
| Memory Usage           | <70% avg | >85%            |
| Disk Usage             | <70%     | >80%            |
| Incident Response Time | <30min   | >1hr            |

---

## 17. Risk Management

### 17.1 Technical Risks

| Risk                       | Impact   | Likelihood | Mitigation                         | Contingency               |
| -------------------------- | -------- | ---------- | ---------------------------------- | ------------------------- |
| Chrome Web Store rejection | High     | Low        | Follow guidelines strictly         | Iterate based on feedback |
| Server overload            | High     | Medium     | Rate limiting, capacity monitoring | Add servers quickly       |
| Security breach            | Critical | Low        | Security audits, best practices    | Incident response plan    |
| API rate limiting issues   | Medium   | Medium     | Proper rate limit design           | Fallback mechanisms       |
| Extension bugs             | Medium   | Medium     | Comprehensive testing              | Quick rollback capability |

### 17.2 Business Risks

| Risk                   | Impact | Likelihood | Mitigation                     | Contingency                    |
| ---------------------- | ------ | ---------- | ------------------------------ | ------------------------------ |
| Cost overrun           | High   | Medium     | Budget alerts, monitoring      | Reduce capacity or add revenue |
| User abuse             | Medium | High       | Rate limiting, fair use policy | Ban system, premium tier       |
| Poor adoption          | Medium | Medium     | Good UX, marketing             | Improve based on feedback      |
| Legal issues           | High   | Low        | Legal review, clear ToS        | Consult lawyer                 |
| Provider ToS violation | High   | Low        | Review all provider policies   | Alternative providers ready    |

---

## 18. Future Enhancements (Post-Launch)

### Phase 2 Features (Months 3-6)

- [ ] Firefox extension port
- [ ] Split tunneling
- [ ] Kill switch feature
- [ ] Connection auto-reconnect improvements
- [ ] More server locations
- [ ] Custom DNS settings

### Phase 3 Features (Months 6-12)

- [ ] Mobile app (Android)
- [ ] Desktop applications
- [ ] Advanced analytics dashboard
- [ ] Team/Family plans
- [ ] Custom server configurations
- [ ] API for third-party integrations

### Sustainability Features

- [ ] Optional premium tier
- [ ] Donation system
- [ ] Referral program
- [ ] Corporate sponsorships

---

## 19. Conclusion & Next Steps

### 19.1 Implementation Priority

**Immediate (Sprint 1-2):**

1. Setup development environment
2. Initialize project structure
3. Setup CI/CD
4. Start backend API development

**Short-term (Sprint 3-5):**

1. Complete backend API
2. Develop Chrome extension
3. Deploy infrastructure
4. Comprehensive testing

**Medium-term (Sprint 6-8):**

1. Polish and documentation
2. Launch preparation
3. Production deployment
4. Post-launch stabilization

### 19.2 Key Success Factors

1. **Budget Management**: Strict cost monitoring and optimization
2. **Security First**: No compromise on security and privacy
3. **User Experience**: Simple, reliable, fast
4. **Quality**: Comprehensive testing before launch
5. **Monitoring**: Proactive issue detection and resolution
6. **Documentation**: Clear docs for users and developers
7. **Community**: Responsive to user feedback

### 19.3 Getting Started

**First Actions:**

```bash
# 1. Setup development environment
git clone <repository>
cd personalVpn
./scripts/setup-dev.sh

# 2. Create feature branch
git checkout -b feature/initial-setup

# 3. Start development
pnpm dev

# 4. Read documentation
cat docs/CONTRIBUTING.md
```

---

## Appendix

### A. Useful Commands

```bash
# Development
pnpm dev                    # Start all dev servers
pnpm build                  # Build all packages
pnpm test                   # Run all tests
pnpm lint                   # Lint all code

# Extension specific
cd packages/chrome-extension
pnpm dev                    # Start extension dev
pnpm build                  # Build extension
pnpm test                   # Test extension

# Backend specific
cd packages/backend-api
pnpm dev                    # Start API dev
pnpm db:migrate            # Run migrations
pnpm test                   # Test API

# Infrastructure
cd packages/infrastructure
terraform plan              # Plan infrastructure
terraform apply             # Apply infrastructure
ansible-playbook setup.yml  # Run Ansible playbook
```

### B. Environment Variables Reference

See individual package `.env.example` files for complete environment variable documentation.

### C. Troubleshooting Guide

Common issues and solutions will be documented in `docs/TROUBLESHOOTING.md`.

---

**Document Maintained By**: Development Team
**Last Updated**: 2025-11-04
**Next Review**: After Sprint 1 completion

---

**Ready to build? Let's get started! 🚀**
