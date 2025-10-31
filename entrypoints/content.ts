// Main content script - injected into every page

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',

  async main() {
    console.log('🚀 FormAgent initialized');

    // Import utilities
    const { formDetector } = await import('../utils/formDetector');
    const { formManipulator } = await import('../utils/formManipulator');

    // Initialize form detection
    formDetector.initialize((forms) => {
      console.log(`📝 Detected ${forms.length} forms with ${forms.reduce((acc, f) => acc + f.fields.length, 0)} fields`);
    });

    // Message handler
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      handleMessage(message).then(sendResponse);
      return true; // Async response
    });

    async function handleMessage(message: any) {
      const { type, id } = message;

      try {
        switch (type) {
          case 'GET_FORM_CONTEXT': {
            const context = formDetector.getContext();
            return { id, success: true, data: context };
          }

          case 'FILL_FIELDS': {
            const result = await formManipulator.fillFields(message.strategies);
            return { id, success: true, data: result };
          }

          case 'CLEAR_FIELD': {
            const result = formManipulator.clearField(message.fieldId);
            return { id, success: result, data: result };
          }

          case 'CLEAR_FORM': {
            formManipulator.clearForm(message.formId);
            return { id, success: true };
          }

          case 'FOCUS_FIELD': {
            formManipulator.focusField(message.fieldId);
            return { id, success: true };
          }

          case 'VALIDATE_FIELD': {
            const result = formManipulator.validateField(message.fieldId);
            return { id, success: true, data: result };
          }

          case 'READ_ALL_FIELDS': {
            const values = formManipulator.readAllFields();
            return { id, success: true, data: values };
          }

          case 'TOGGLE_CHAT': {
            // Will be handled by floating-chat content script
            window.postMessage({ type: 'FORM_AGENT_TOGGLE_CHAT' }, '*');
            return { id, success: true };
          }

          default:
            return { id, success: false, error: 'Unknown message type' };
        }
      } catch (error: any) {
        return { id, success: false, error: error.message };
      }
    }

    // Listen for keyboard shortcut
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'COMMAND_TOGGLE_CHAT') {
        window.postMessage({ type: 'FORM_AGENT_TOGGLE_CHAT' }, '*');
      }
    });

    console.log('✨ FormAgent ready - Press Ctrl+Shift+Space to open chat');
  },
});
