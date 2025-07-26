# textcraft

A modern, customizable rich text editor component for React with Tailwind CSS styling.

## Features

- 📝 Full WYSIWYG editing experience
- 🎨 Modern UI with Tailwind CSS
- 🔧 Highly customizable toolbar
- 📱 Responsive design
- ⚡ Lightweight and performant
- 🎯 TypeScript support
- 📦 Easy to integrate

## Installation

```bash
npm install react-textcraft
# or
yarn add react-textcraft
# or
bun add react-textcraft
```

## Usage

```jsx
import React, { useState } from 'react';
import RichTextEditor from 'react-textcraft';

function App() {
  const [content, setContent] = useState('');

  return (
    <div className="p-4">
      <RichTextEditor
        initialContent="<p>Start typing...</p>"
        onChange={(html) => setContent(html)}
        placeholder="Write something amazing..."
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialContent` | string | `''` | Initial HTML content |
| `onChange` | function | `() => {}` | Callback when content changes |
| `className` | string | `''` | Additional CSS classes |
| `placeholder` | string | `'Start typing...'` | Placeholder text |
| `height` | string | `'24rem'` | Editor height |
| `showStatusBar` | boolean | `true` | Show word/character count |
| `showHTMLOutput` | boolean | `false` | Show HTML output (debug) |
| `toolbarConfig` | object | `{}` | Customize toolbar sections |

## Toolbar Configuration

```jsx
<RichTextEditor
  toolbarConfig={{
    undoRedo: true,
    fontSize: true,
    formatting: true,
    colors: true,
    alignment: true,
    lists: true,
    insert: true,
    blocks: true
  }}
/>
```

## Styling

The component uses Tailwind CSS classes. Make sure you have Tailwind CSS installed in your project:

```bash
npm install tailwindcss
```

## License

MIT © [faysal0x1](https://github.com/faysal0x1)
