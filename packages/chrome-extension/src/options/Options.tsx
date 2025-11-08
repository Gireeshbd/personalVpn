import React from 'react';
import { Settings, Shield, Info } from 'lucide-react';

export const Options: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Personal VPN Settings</h1>
          </div>
          <p className="text-gray-600">
            Configure your VPN preferences and view usage statistics
          </p>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Auto-connect on startup</label>
                <p className="text-sm text-gray-500">
                  Automatically connect to last used server when browser starts
                </p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Show notifications</label>
                <p className="text-sm text-gray-500">
                  Display connection status notifications
                </p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
                defaultChecked
              />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">About</h2>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Version:</strong> 1.0.0
            </p>
            <p>
              <strong>Privacy Policy:</strong>{' '}
              <a href="#" className="text-blue-600 hover:underline">
                View Privacy Policy
              </a>
            </p>
            <p>
              <strong>Terms of Service:</strong>{' '}
              <a href="#" className="text-blue-600 hover:underline">
                View Terms
              </a>
            </p>
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500">
                Personal VPN is a free, privacy-focused VPN service. We don&apos;t log your
                browsing activity or sell your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
