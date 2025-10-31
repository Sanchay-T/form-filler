// Background service worker - handles context engine and message routing

export default defineBackground(() => {
  console.log('🔧 FormAgent background service initialized');

  // Listen for keyboard commands
  browser.commands.onCommand.addListener((command) => {
    if (command === 'toggle-chat') {
      // Send message to active tab
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs[0]?.id) {
          browser.tabs.sendMessage(tabs[0].id, {
            type: 'COMMAND_TOGGLE_CHAT'
          });
        }
      });
    }
  });

  // Handle messages from content scripts
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleBackgroundMessage(message).then(sendResponse);
    return true; // Async response
  });

  async function handleBackgroundMessage(message: any) {
    const { type, id } = message;

    switch (type) {
      case 'CONTEXT_ENGINE_REQUEST': {
        // This is where the actual context engine will be integrated
        // For now, return a placeholder response
        const response = await callContextEngine(message.request);
        return { id, success: true, data: response };
      }

      default:
        // Forward to content script
        return { id, success: true };
    }
  }

  async function callContextEngine(request: any) {
    // TODO: Integrate actual context engine here
    // This is just a placeholder that returns mock data

    console.log('📤 Context Engine Request:', request);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock response - generate strategies for each field
    const strategies = request.formContext.forms.flatMap((form: any) =>
      form.fields.slice(0, 3).map((field: any) => ({
        fieldId: field.id,
        value: `Generated content for ${field.label || field.name}`,
        confidence: 0.95
      }))
    );

    return {
      strategies,
      explanation: 'This is a placeholder response. Integrate your context engine here.'
    };
  }

  // Listen for installation
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
      console.log('🎉 FormAgent installed successfully!');
    }
  });
});
