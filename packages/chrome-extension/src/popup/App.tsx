import React, { useEffect, useState } from 'react';
import type { ConnectionState, Server } from '@shared/types';
import { sendMessage } from '../lib/messaging';
import { Shield, Server as ServerIcon, Wifi, WifiOff, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
    setupListeners();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusResponse, serversResponse] = await Promise.all([
        sendMessage({ type: 'GET_STATUS' }),
        sendMessage({ type: 'GET_SERVERS' }),
      ]);

      if (statusResponse.success && statusResponse.data) {
        setConnectionState(statusResponse.data.state);
        if (statusResponse.data.server) {
          setSelectedServer(statusResponse.data.server.id);
        }
      }

      if (serversResponse.success && serversResponse.data) {
        setServers(serversResponse.data);
        if (!selectedServer && serversResponse.data.length > 0) {
          setSelectedServer(serversResponse.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
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
    setError(null);

    try {
      const response = await sendMessage({
        type: 'CONNECT',
        serverId: selectedServer,
      });

      if (!response.success) {
        setError(response.error || 'Failed to connect');
      }
    } catch (err) {
      setError('Connection failed');
      console.error('Connection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await sendMessage({ type: 'DISCONNECT' });

      if (!response.success) {
        setError(response.error || 'Failed to disconnect');
      }
    } catch (err) {
      setError('Disconnect failed');
      console.error('Disconnect failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="w-5 h-5" />;
      case 'connecting':
        return <Wifi className="w-5 h-5 animate-pulse" />;
      case 'error':
        return <WifiOff className="w-5 h-5" />;
      default:
        return <WifiOff className="w-5 h-5" />;
    }
  };

  const isConnected = connectionState === 'connected';
  const isDisabled = loading || connectionState === 'connecting';

  return (
    <div className="w-80 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[400px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-6 h-6" />
          <h1 className="text-xl font-bold">Personal VPN</h1>
        </div>
        <div className={`flex items-center justify-center gap-2 ${getStatusColor()} bg-white rounded-full px-4 py-2`}>
          {getStatusIcon()}
          <span className="font-semibold text-sm uppercase">
            {connectionState}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Server Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <ServerIcon className="w-4 h-4" />
            Select Server Location
          </label>
          <select
            value={selectedServer || ''}
            onChange={(e) => setSelectedServer(e.target.value)}
            disabled={isConnected || isDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {servers.length === 0 ? (
              <option value="">Loading servers...</option>
            ) : (
              servers.map((server) => (
                <option key={server.id} value={server.id}>
                  {server.name} - {server.location} ({server.load}% load)
                </option>
              ))
            )}
          </select>
        </div>

        {/* Connection Button */}
        <div className="space-y-2">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isDisabled || !selectedServer}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect to VPN'
              )}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              disabled={isDisabled}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>🔒 Privacy First:</strong> We don't log your browsing activity.
            Your connection is secure and encrypted.
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Settings
          </button>
          <span className="text-gray-400">•</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // Open help page
            }}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Help
          </a>
        </div>
      </div>
    </div>
  );
};
