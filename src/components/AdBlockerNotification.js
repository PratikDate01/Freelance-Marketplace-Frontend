import React, { useState } from 'react';
import { X, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

const AdBlockerNotification = ({ onDismiss, onRetry }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const adBlockerInstructions = {
    'uBlock Origin': [
      'Click the uBlock Origin icon in your browser toolbar',
      'Click the power button to disable it for this site',
      'Refresh the page'
    ],
    'AdBlock Plus': [
      'Click the AdBlock Plus icon in your browser toolbar',
      'Click "Enabled on this site" to disable it',
      'Refresh the page'
    ],
    'AdBlock': [
      'Click the AdBlock icon in your browser toolbar',
      'Select "Don\'t run on this site"',
      'Refresh the page'
    ],
    'Ghostery': [
      'Click the Ghostery icon in your browser toolbar',
      'Toggle off "Enhanced Ad Blocking"',
      'Refresh the page'
    ]
  };

  return (
    <div className="fixed top-4 right-4 max-w-md bg-white border border-yellow-200 rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Payment Service Blocked
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              An ad blocker is preventing the payment form from loading. Please disable it to continue.
            </p>
            
            <div className="flex gap-2 mb-3">
              <button
                onClick={onRetry}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
              >
                <RefreshCw size={14} />
                Retry
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
              >
                {isExpanded ? 'Hide' : 'Show'} Instructions
              </button>
            </div>

            {isExpanded && (
              <div className="border-t pt-3 mt-3">
                <h4 className="font-medium text-gray-900 mb-2">How to disable ad blockers:</h4>
                <div className="space-y-3">
                  {Object.entries(adBlockerInstructions).map(([blocker, steps]) => (
                    <div key={blocker} className="text-sm">
                      <h5 className="font-medium text-gray-800 mb-1">{blocker}:</h5>
                      <ol className="list-decimal list-inside text-gray-600 space-y-0.5 ml-2">
                        {steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                  <strong>Note:</strong> You can re-enable your ad blocker after completing the payment.
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdBlockerNotification;