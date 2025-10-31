# 🚀 FormAgent - Lightning-Fast AI Form Filler

> A blazingly fast Chrome extension that fills forms with AI-powered, context-aware intelligence. Built with modern web technologies for maximum performance.

## 🎯 Vision

FormAgent is your personal "Cursor for form filling" - a context-aware assistant that:
- Detects forms instantly on any page
- Generates high-quality content you never need to correct
- Provides a floating chat interface for real-time interaction
- Operates at lightning speed with sub-second response times

## ✨ Features

### Core Capabilities
- ⚡ **Instant Form Detection** - Automatically detects all forms and fields (explicit and implicit)
- 🎨 **Smart Field Manipulation** - CRUD operations on any form field type
- 💬 **Floating Chat Interface** - "Cursor-style" chat window for contextual assistance
- ⌨️ **Keyboard Shortcut** - `Ctrl+Shift+Space` (Mac: `Cmd+Shift+Space`) to toggle chat
- 🧠 **Context Engine Ready** - Placeholder for your AI brain integration
- 🎭 **Shadow DOM Isolation** - No CSS conflicts with host pages
- 🔄 **Dynamic Form Support** - Watches for forms added after page load

### Supported Field Types
- Text inputs (text, email, password, tel, url, number)
- Date/time inputs
- Textareas
- Select dropdowns
- Radio buttons
- Checkboxes
- And more...

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Chrome Extension                    │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
   │ Content │        │Floating │        │Background│
   │ Script  │        │  Chat   │        │ Worker  │
   └────┬────┘        └────┬────┘        └────┬────┘
        │                   │                   │
        │              React UI                 │
        │              Shadow DOM               │
        │                                       │
   ┌────▼────────────────────────────────┐    │
   │      Form Detection Engine          │    │
   │  - Fast DOM scanning                │    │
   │  - Mutation observer                │    │
   │  - Smart label detection            │    │
   └─────────────────────────────────────┘    │
                                               │
   ┌────▼────────────────────────────────┐    │
   │    Form Manipulation Engine         │    │
   │  - Field value setting              │    │
   │  - Event triggering                 │    │
   │  - Validation                       │    │
   └─────────────────────────────────────┘    │
                                               │
        ┌──────────────────────────────────────▼──┐
        │      Context Engine Interface           │
        │  (Placeholder for your AI brain)        │
        └─────────────────────────────────────────┘
```

## 📁 Project Structure

```
form-filler/
├── entrypoints/
│   ├── content.ts              # Main content script (form detection & manipulation)
│   ├── floating-chat.content.tsx # Floating chat UI content script
│   ├── background.ts            # Background service worker
│   └── popup/
│       ├── index.html           # Popup HTML
│       └── main.tsx             # Popup React app
├── components/
│   └── FloatingChat.tsx         # Floating chat component
├── utils/
│   ├── formDetector.ts          # Form detection engine
│   └── formManipulator.ts       # Form manipulation engine
├── types/
│   ├── form.ts                  # Form-related types
│   └── messages.ts              # Message passing types
├── wxt.config.ts                # WXT configuration
├── tailwind.config.js           # Tailwind CSS config
└── tsconfig.json                # TypeScript config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Chrome browser (or Firefox for cross-browser testing)

### Installation

```bash
# Install dependencies
npm install

# Run postinstall to prepare WXT
npm run postinstall
```

### Development

```bash
# Start development server (Chrome)
npm run dev

# Start development server (Firefox)
npm run dev:firefox
```

This will:
1. Build the extension in development mode
2. Open Chrome with the extension loaded
3. Watch for changes and hot-reload

### Loading the Extension Manually

1. Build the extension:
   ```bash
   npm run build
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (top right)

4. Click "Load unpacked"

5. Select the `.output/chrome-mv3` directory

### Production Build

```bash
# Build for Chrome
npm run build

# Build for Firefox
npm run build:firefox

# Create distributable zip
npm run zip
```

## 🎮 Usage

### For Users

1. **Open any page with a form**
2. **Press `Ctrl+Shift+Space`** (or `Cmd+Shift+Space` on Mac)
3. **Chat with FormAgent**:
   - "Fill this form with my usual information"
   - "Answer that question about my background in a professional tone"
   - "Make the email sound more formal"
4. **Watch the magic happen** - fields fill automatically!

### For Developers

#### Detecting Forms

```typescript
import { formDetector } from './utils/formDetector';

// Initialize detector
formDetector.initialize((forms) => {
  console.log(`Detected ${forms.length} forms`);
});

// Get current context
const context = formDetector.getContext();
console.log(context.forms); // Array of DetectedForm
```

#### Manipulating Fields

```typescript
import { formManipulator } from './utils/formManipulator';

// Fill a single field
formManipulator.fillField('field-id', 'value');

// Fill multiple fields
const strategies = [
  { fieldId: 'field-1', value: 'John Doe', confidence: 0.95 },
  { fieldId: 'field-2', value: 'john@example.com', confidence: 0.98 }
];
await formManipulator.fillFields(strategies);

// Clear a field
formManipulator.clearField('field-id');

// Validate a field
const result = formManipulator.validateField('field-id');
if (!result.valid) {
  console.error(result.error);
}
```

#### Integrating Your Context Engine

The context engine interface is in `entrypoints/background.ts`:

```typescript
async function callContextEngine(request: ContextEngineRequest) {
  // TODO: Replace this with your actual AI/LLM integration

  const response = await fetch('YOUR_API_ENDPOINT', {
    method: 'POST',
    body: JSON.stringify({
      formContext: request.formContext,
      userInput: request.userInput
    })
  });

  const data = await response.json();

  return {
    strategies: data.strategies, // Array of FillStrategy
    explanation: data.explanation
  };
}
```

## 🧩 Key Components

### FormDetector (`utils/formDetector.ts`)
- Scans DOM for forms (explicit `<form>` tags and implicit field groups)
- Detects field types, labels, placeholders, validation rules
- Uses MutationObserver for dynamic forms
- Smart label detection (explicit labels, parent labels, aria-labels)

### FormManipulator (`utils/formManipulator.ts`)
- Sets field values for all input types
- Triggers proper events (input, change, blur, keyup)
- Handles React/Vue reactivity
- Field validation
- Visual feedback (highlighting)

### FloatingChat (`components/FloatingChat.tsx`)
- Draggable, minimizable chat window
- Shadow DOM for style isolation
- Keyboard shortcut support
- Real-time message handling

### Message Passing (`types/messages.ts`)
- Type-safe communication between components
- Async request/response pattern
- Message routing through background worker

## 🎨 Customization

### Styling

Edit `style.css` and `tailwind.config.js` to customize the look and feel.

### Keyboard Shortcut

Edit `wxt.config.ts`:

```typescript
commands: {
  'toggle-chat': {
    suggested_key: {
      default: 'Ctrl+Shift+Space',
      mac: 'Command+Shift+Space'
    }
  }
}
```

### Field Detection Logic

Customize `formDetector.ts` to handle specific site patterns or custom form implementations.

## 🔧 Tech Stack

- **Framework**: [WXT](https://wxt.dev/) - Modern extension framework (Vite-based)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **State**: Zustand (ready to use)
- **Build**: Vite (ultra-fast HMR)

## 🚧 Roadmap

- [ ] **Context Engine Integration** - Connect your AI/LLM
- [ ] **User Profiles** - Save and manage form-filling profiles
- [ ] **Field History** - Remember previous inputs
- [ ] **Multi-language Support** - i18n
- [ ] **Advanced Validation** - Custom validation rules
- [ ] **Form Templates** - Pre-defined form patterns
- [ ] **Analytics** - Usage tracking and insights
- [ ] **Cloud Sync** - Sync settings across devices

## 🤝 Contributing

This is a skeleton ready for your brain! The core infrastructure is built for speed and extensibility. Focus on:

1. **Context Engine**: Integrate your AI model in `background.ts`
2. **User Experience**: Enhance the chat interface with rich interactions
3. **Field Intelligence**: Add smarter field type detection
4. **Content Generation**: Build specialized generators for different field types

## 📝 License

ISC

## 💡 Tips for Integration

### Context Engine Best Practices

1. **Batch Requests**: Group multiple fields into a single AI request for speed
2. **Confidence Scores**: Use the confidence field to highlight uncertain fills
3. **Progressive Enhancement**: Fill high-confidence fields first, ask user for low-confidence ones
4. **Context Building**: Send page metadata (title, URL, existing field values) to your AI
5. **Caching**: Cache common responses (e.g., name, email) for instant fills

### Performance Tips

1. **Lazy Loading**: Content scripts and chat UI load only when needed
2. **Shadow DOM**: Prevents style conflicts and improves performance
3. **Debouncing**: Form detection is optimized with mutation observer throttling
4. **Event Batching**: Multiple field fills are batched with small delays for smooth UX

## 🐛 Known Limitations

- File inputs cannot be filled programmatically (browser security)
- Some heavily customized form libraries may need special handling
- iframes require separate content script injection

## 📞 Support

For issues, questions, or contributions, open an issue on GitHub.

---

**Built with ⚡ by developers, for developers**

Ready to add your brain to this lightning-fast body? Let's make form filling magical! 🎩✨