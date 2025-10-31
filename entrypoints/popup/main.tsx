// Popup UI - quick access and settings

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Sparkles, Settings, Info, Zap } from 'lucide-react';
import '../../style.css';

function Popup() {
  const [formsDetected, setFormsDetected] = useState(0);
  const [fieldsDetected, setFieldsDetected] = useState(0);

  useEffect(() => {
    // Get form context from active tab
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]?.id) {
        browser.tabs.sendMessage(tabs[0].id, {
          type: 'GET_FORM_CONTEXT',
          id: Date.now().toString()
        }).then((response) => {
          if (response?.success) {
            const context = response.data;
            setFormsDetected(context.forms.length);
            setFieldsDetected(
              context.forms.reduce((acc: number, f: any) => acc + f.fields.length, 0)
            );
          }
        }).catch(() => {
          // Tab not ready or no content script
        });
      }
    });
  }, []);

  const openChat = () => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]?.id) {
        browser.tabs.sendMessage(tabs[0].id, {
          type: 'COMMAND_TOGGLE_CHAT'
        });
        window.close();
      }
    });
  };

  return (
    <div className="w-80 p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
          <Sparkles className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">FormAgent</h1>
          <p className="text-xs text-gray-600">AI-powered form filling</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-blue-600">{formsDetected}</p>
            <p className="text-xs text-gray-600">Forms detected</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-600">{fieldsDetected}</p>
            <p className="text-xs text-gray-600">Fields found</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 mb-4">
        <button
          onClick={openChat}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
          <Zap size={18} />
          Open Chat (Ctrl+Shift+Space)
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2">
          <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900">
            <p className="font-medium mb-1">Quick Start:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Press Ctrl+Shift+Space</li>
              <li>Tell me how to fill the form</li>
              <li>Watch the magic happen!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">
          v1.0.0 - Lightning fast form filling
        </p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Popup />);
