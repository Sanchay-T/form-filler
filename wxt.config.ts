import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'FormAgent - AI Form Filler',
    description: 'Lightning-fast, context-aware form filling with AI assistance',
    version: '1.0.0',
    permissions: [
      'activeTab',
      'storage',
      'scripting'
    ],
    host_permissions: [
      '<all_urls>'
    ],
    commands: {
      'toggle-chat': {
        suggested_key: {
          default: 'Ctrl+Shift+Space',
          mac: 'Command+Shift+Space'
        },
        description: 'Toggle floating chat window'
      }
    }
  }
});
