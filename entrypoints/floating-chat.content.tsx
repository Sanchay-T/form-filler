// Floating chat content script - renders the chat UI

import ReactDOM from 'react-dom/client';
import { FloatingChat } from '../components/FloatingChat';
import '../style.css';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    // Create shadow root for isolation
    const ui = await createShadowRootUi(ctx, {
      name: 'form-agent-floating-chat',
      position: 'inline',
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);

        let isVisible = false;

        const render = () => {
          if (isVisible) {
            root.render(
              <FloatingChat
                onClose={() => {
                  isVisible = false;
                  render();
                }}
                onSendMessage={handleSendMessage}
              />
            );
          } else {
            root.render(null);
          }
        };

        // Listen for toggle events
        window.addEventListener('message', (event) => {
          if (event.data.type === 'FORM_AGENT_TOGGLE_CHAT') {
            isVisible = !isVisible;
            render();
          }
        });

        // Initial render (hidden)
        render();

        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();

    async function handleSendMessage(message: string) {
      console.log('User message:', message);

      // Get current form context
      const response = await browser.runtime.sendMessage({
        type: 'CONTEXT_ENGINE_REQUEST',
        id: Date.now().toString(),
        request: {
          formContext: await getFormContext(),
          userInput: message
        }
      });

      console.log('Context engine response:', response);
    }

    async function getFormContext() {
      return new Promise((resolve) => {
        browser.runtime.sendMessage(
          { type: 'GET_FORM_CONTEXT', id: Date.now().toString() },
          (response) => {
            resolve(response.data);
          }
        );
      });
    }
  },
});
