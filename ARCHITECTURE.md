# 🏗️ FormAgent Architecture

## Overview

FormAgent is built with a modern, modular architecture designed for speed, extensibility, and maintainability.

## Component Architecture

### 1. Content Scripts Layer

#### `content.ts` - Main Content Script
**Purpose**: Core form detection and manipulation logic

**Responsibilities**:
- Initialize form detector on page load
- Handle message passing from background/popup
- Coordinate form operations (fill, clear, validate)
- Bridge between page DOM and extension

**Lifecycle**:
```
Page Load → Initialize formDetector → Listen for messages → Handle operations
```

#### `floating-chat.content.tsx` - Chat UI Content Script
**Purpose**: Render the floating chat interface

**Responsibilities**:
- Mount React UI in shadow DOM
- Handle keyboard shortcuts
- Manage chat state
- Communicate with background for AI responses

**Key Features**:
- Shadow DOM isolation (no CSS conflicts)
- Draggable/minimizable UI
- Keyboard shortcut support (Ctrl+Shift+Space)

### 2. Background Service Worker

#### `background.ts`
**Purpose**: Central message router and context engine interface

**Responsibilities**:
- Route messages between components
- Handle keyboard command events
- Interface with context engine (AI/LLM)
- Manage extension lifecycle

**Message Flow**:
```
Content Script → Background → Context Engine → Background → Content Script
```

### 3. Popup UI

#### `popup/main.tsx`
**Purpose**: Quick access interface

**Features**:
- Display stats (forms/fields detected)
- Quick action buttons
- Settings access (future)

### 4. Core Utilities

#### `formDetector.ts` - Form Detection Engine
**Purpose**: Fast, accurate form and field detection

**Detection Strategy**:
1. **Explicit Forms**: Find all `<form>` elements
2. **Implicit Forms**: Find fields outside `<form>` tags (common in SPAs)
3. **Dynamic Detection**: Use MutationObserver for SPA compatibility

**Field Detection**:
- All input types (text, email, password, etc.)
- Textareas
- Select dropdowns
- Radio buttons
- Checkboxes

**Smart Label Detection**:
1. Explicit `<label for="...">`
2. Parent `<label>` wrapper
3. `aria-label` attribute
4. Previous sibling text
5. Fallback to name/id

**Performance Optimizations**:
- Single DOM traversal
- Cached results
- Throttled mutation observer

#### `formManipulator.ts` - Form Manipulation Engine
**Purpose**: CRUD operations on form fields

**Operations**:
- **Fill**: Set field values with proper event triggering
- **Clear**: Reset field values
- **Validate**: Check field validation rules
- **Focus**: Programmatically focus fields

**Event Triggering**:
To ensure compatibility with modern frameworks (React, Vue, Angular):
```typescript
'input'  → Trigger value change
'change' → Notify form of change
'blur'   → Trigger validation
'keyup'  → React-specific reactivity
```

**Visual Feedback**:
- Blue highlight animation on fill
- Smooth scroll to focused field

### 5. Type System

#### `form.ts` - Form Types
Core data structures:
- `FormField`: Represents a single form field
- `DetectedForm`: Represents a form with all its fields
- `FormContext`: Complete context of all forms on page
- `FillStrategy`: AI-generated fill instruction
- `ContextEngineRequest/Response`: AI interface

#### `messages.ts` - Message Types
Type-safe message passing:
- `Message` union type for all message types
- `MessageResponse` for async responses
- Request/response ID matching

## Data Flow

### Form Detection Flow
```
Page Load
    ↓
Initialize formDetector
    ↓
Scan DOM for forms
    ↓
Process each form
    ↓
Detect fields → Extract metadata → Store in Map
    ↓
Setup MutationObserver
    ↓
Listen for dynamic changes
```

### Form Fill Flow
```
User opens chat (Ctrl+Shift+Space)
    ↓
User types message: "Fill this form"
    ↓
floating-chat.content.tsx sends message to background
    ↓
background.ts calls context engine
    ↓
Context engine returns FillStrategy[]
    ↓
background.ts sends fill message to content.ts
    ↓
content.ts calls formManipulator.fillFields()
    ↓
formManipulator iterates strategies
    ↓
For each field:
  - Find element
  - Set value
  - Trigger events
  - Animate highlight
    ↓
Return success/failure counts
```

### Message Passing Architecture
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Content    │◄───────►│  Background  │◄───────►│    Popup     │
│   Script     │         │   Worker     │         │      UI      │
└──────────────┘         └──────────────┘         └──────────────┘
       ↕                        ↕
       │                        │
       │                  Context Engine
       │                   (External AI)
       │
   Page DOM
```

## Performance Optimizations

### 1. Lazy Loading
- Content scripts load only on page access
- Floating chat mounts only when opened
- React components lazy-loaded

### 2. Shadow DOM
- CSS isolation prevents conflicts
- No style recalculation of host page
- Sandboxed execution

### 3. Efficient DOM Operations
- Single traversal for detection
- Cached element references
- Batched field fills with micro-delays

### 4. Debouncing/Throttling
- MutationObserver throttled to 250ms
- Form detection debounced
- Message queueing

### 5. Vite Build Optimization
- Tree-shaking unused code
- Code splitting by entry point
- Minification and compression

## Security Considerations

### 1. Content Script Isolation
- Runs in isolated world
- No access to page JavaScript variables
- Communicates via messages only

### 2. Message Validation
- Type-safe message passing
- Input validation on all messages
- Error boundaries

### 3. Permissions
- `activeTab`: Only access active tab
- `storage`: Local storage only
- `scripting`: Required for dynamic injection

### 4. Context Engine
- No sensitive data stored
- HTTPS-only API calls (when implemented)
- User consent for data sharing

## Extension Manifest (v3)

```json
{
  "manifest_version": 3,
  "name": "FormAgent",
  "permissions": [
    "activeTab",    // Access current tab
    "storage",      // Local storage
    "scripting"     // Dynamic script injection
  ],
  "host_permissions": [
    "<all_urls>"    // Work on all websites
  ],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js", "floating-chat.content.js"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html"
  },
  "commands": {
    "toggle-chat": {
      "suggested_key": {
        "default": "Ctrl+Shift+Space"
      }
    }
  }
}
```

## Future Enhancements

### Phase 1 (Current)
- ✅ Form detection
- ✅ Field manipulation
- ✅ Floating chat UI
- ✅ Message passing
- ✅ Context engine interface (placeholder)

### Phase 2 (Next)
- [ ] Context engine integration (LLM)
- [ ] User profile system
- [ ] Field history/caching
- [ ] Advanced validation

### Phase 3 (Future)
- [ ] Multi-tab coordination
- [ ] Cloud sync
- [ ] Form templates
- [ ] Analytics dashboard
- [ ] Browser extension API v4 migration

## Development Workflow

### Local Development
```bash
npm run dev  # Start dev server with hot reload
```

### Testing
```bash
# Manual testing checklist:
1. Test on various websites (forms, SPAs, etc.)
2. Test keyboard shortcut
3. Test form fill operations
4. Test chat UI (drag, minimize, etc.)
5. Test dynamic forms (React/Vue apps)
```

### Building for Production
```bash
npm run build  # Build optimized extension
npm run zip    # Create distributable zip
```

### Debugging
- Use Chrome DevTools on content script
- Use "Inspect views: background page" for background worker
- Use React DevTools in shadow root
- Console logs prefixed with 🚀/📝/✨ for easy filtering

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Explicit types for public APIs
- Interfaces for data structures
- Type unions for messages

### React
- Functional components only
- Hooks for state management
- Props interfaces defined
- No prop drilling (use context if needed)

### Naming Conventions
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase
- Files: kebab-case

## Troubleshooting

### Common Issues

**Issue**: Extension not loading
- **Solution**: Run `npm run postinstall` after install

**Issue**: Forms not detected
- **Solution**: Check console for errors, ensure content script injected

**Issue**: Chat not opening
- **Solution**: Check keyboard shortcut conflict, verify message passing

**Issue**: Fields not filling
- **Solution**: Check if field is in shadow DOM, verify event triggering

**Issue**: Build errors
- **Solution**: Clear node_modules, reinstall dependencies

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Update documentation
6. Submit PR with clear description

**Key Areas for Contribution**:
- Context engine implementations
- Field detection improvements
- UI/UX enhancements
- Performance optimizations
- Bug fixes

---

**Architecture Version**: 1.0.0
**Last Updated**: 2025
**Framework**: WXT + React + TypeScript
