#!/bin/bash

# Usage: ./create-package.sh [package-name] [author-name] [author-email]

set -e

# Default values
PACKAGE_NAME="${1:-prism-editor}"
AUTHOR_NAME="${2:-Your Name}"
AUTHOR_EMAIL="${3:-your.email@example.com}"
GITHUB_USERNAME="${4:-yourusername}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Creating Rich Text Editor Package: ${PACKAGE_NAME}${NC}"
echo -e "${YELLOW}Author: ${AUTHOR_NAME} <${AUTHOR_EMAIL}>${NC}"
echo ""

# Create directory structure
echo -e "${GREEN}📁 Creating directory structure...${NC}"
mkdir -p "${PACKAGE_NAME}"
cd "${PACKAGE_NAME}"
mkdir -p src dist examples

# Create package.json
echo -e "${GREEN}📝 Creating package.json...${NC}"
cat > package.json << EOF
{
  "name": "@${GITHUB_USERNAME}/${PACKAGE_NAME}",
  "version": "1.0.0",
  "description": "A modern, customizable rich text editor component for React with Tailwind CSS styling",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "prepare": "npm run build",
    "test": "echo \\"No tests specified\\" && exit 0"
  },
  "keywords": [
    "react",
    "rich-text-editor",
    "wysiwyg",
    "tailwind",
    "editor",
    "text-editor",
    "summernote",
    "contenteditable"
  ],
  "author": "${AUTHOR_NAME} <${AUTHOR_EMAIL}>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/${GITHUB_USERNAME}/${PACKAGE_NAME}.git"
  },
  "bugs": {
    "url": "https://github.com/${GITHUB_USERNAME}/${PACKAGE_NAME}/issues"
  },
  "homepage": "https://github.com/${GITHUB_USERNAME}/${PACKAGE_NAME}#readme",
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0",
    "lucide-react": ">=0.263.1"
  },
  "devDependencies": {
    "@babel/core": "^7.22.0",
    "@babel/preset-env": "^7.22.0",
    "@babel/preset-react": "^7.22.0",
    "@rollup/plugin-babel": "^6.0.3",
    "@rollup/plugin-commonjs": "^25.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-terser": "^0.4.3",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "rollup": "^3.25.0",
    "rollup-plugin-peer-deps-external": "^2.2.4",
    "rollup-plugin-postcss": "^4.0.2",
    "typescript": "^5.1.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
EOF

# Create src/index.js
echo -e "${GREEN}📝 Creating src/index.js...${NC}"
cat > src/index.js << 'EOF'
import RichTextEditor from './RichTextEditor';
import './styles.css';

export default RichTextEditor;
export { RichTextEditor };
EOF

# Create src/RichTextEditor.jsx
echo -e "${GREEN}📝 Creating src/RichTextEditor.jsx...${NC}"
cat > src/RichTextEditor.jsx << 'EOF'
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link, Image, Code, 
  Undo, Redo, Type, Palette, Quote
} from 'lucide-react';

const RichTextEditor = ({ 
  initialContent = '',
  onChange = () => {},
  className = '',
  placeholder = 'Start typing...',
  height = '24rem',
  showStatusBar = true,
  showHTMLOutput = false,
  toolbarConfig = {}
}) => {
  const [content, setContent] = useState(initialContent);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const editorRef = useRef(null);

  const defaultToolbarConfig = {
    undoRedo: true,
    fontSize: true,
    formatting: true,
    colors: true,
    alignment: true,
    lists: true,
    insert: true,
    blocks: true
  };

  const toolbar = { ...defaultToolbarConfig, ...toolbarConfig };

  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
      setContent(initialContent);
    }
  }, [initialContent]);

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const link = document.createElement('a');
        link.href = linkUrl;
        link.textContent = linkText;
        link.className = 'text-blue-600 hover:text-blue-800 underline';
        
        range.insertNode(link);
        range.setStartAfter(link);
        range.setEndAfter(link);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      setLinkUrl('');
      setLinkText('');
      setShowLinkModal(false);
      handleContentChange();
    }
  };

  const ToolbarButton = ({ onClick, children, title, active = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rte-toolbar-btn ${active ? 'rte-toolbar-btn-active' : ''}`}
    >
      {children}
    </button>
  );

  const ToolbarSeparator = () => <div className="rte-toolbar-separator"></div>;

  return (
    <div className={`rte-container ${className}`}>
      <div className="rte-editor-wrapper">
        {/* Toolbar */}
        <div className="rte-toolbar">
          <div className="rte-toolbar-content">
            {/* Undo/Redo */}
            {toolbar.undoRedo && (
              <>
                <ToolbarButton onClick={() => executeCommand('undo')} title="Undo">
                  <Undo size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => executeCommand('redo')} title="Redo">
                  <Redo size={16} />
                </ToolbarButton>
                <ToolbarSeparator />
              </>
            )}
            
            {/* Font Styling */}
            {toolbar.fontSize && (
              <select 
                className="rte-select"
                onChange={(e) => executeCommand('fontSize', e.target.value)}
                defaultValue="3"
              >
                <option value="1">8pt</option>
                <option value="2">10pt</option>
                <option value="3">12pt</option>
                <option value="4">14pt</option>
                <option value="5">18pt</option>
                <option value="6">24pt</option>
                <option value="7">36pt</option>
              </select>
            )}
            
            {toolbar.formatting && (
              <>
                <ToolbarButton onClick={() => executeCommand('bold')} title="Bold">
                  <Bold size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => executeCommand('italic')} title="Italic">
                  <Italic size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => executeCommand('underline')} title="Underline">
                  <Underline size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => executeCommand('strikethrough')} title="Strikethrough">
                  <Strikethrough size={16} />
                </ToolbarButton>
                <ToolbarSeparator />
              </>
            )}
            
            {/* Colors */}
            {toolbar.colors && (
              <>
                <div className="rte-color-picker">
                  <Palette size={16} className="mr-1" />
                  <input
                    type="color"
                    onChange={(e) => executeCommand('foreColor', e.target.value)}
                    className="rte-color-input"
                    title="Text Color"
                  />
                </div>
                <ToolbarSeparator />
              </>
            )}
            
            {/* Alignment */}
            {toolbar.alignment && (
              <>
                <ToolbarButton onClick={() => executeCommand('justifyLeft')} title="Align Left">
                  <AlignLeft size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => executeCommand('justifyCenter')} title="Align Center">
                  <AlignCenter size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => executeCommand('justifyRight')} title="Align Right">
                  <AlignRight size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => executeCommand('justifyFull')} title="Justify">
                  <AlignJustify size={16} />
                </ToolbarButton>
                <ToolbarSeparator />
              </>
            )}
            
            {/* Lists */}
            {toolbar.lists && (
              <>
                <ToolbarButton onClick={() => executeCommand('insertUnorderedList')} title="Bullet List">
                  <List size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => executeCommand('insertOrderedList')} title="Numbered List">
                  <ListOrdered size={16} />
                </ToolbarButton>
                <ToolbarSeparator />
              </>
            )}
            
            {/* Insert Elements */}
            {toolbar.insert && (
              <>
                <ToolbarButton onClick={() => setShowLinkModal(true)} title="Insert Link">
                  <Link size={16} />
                </ToolbarButton>
                <ToolbarButton 
                  onClick={() => {
                    const url = prompt('Enter image URL:');
                    if (url) executeCommand('insertImage', url);
                  }} 
                  title="Insert Image"
                >
                  <Image size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => executeCommand('formatBlock', 'blockquote')} title="Quote">
                  <Quote size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => executeCommand('formatBlock', 'pre')} title="Code Block">
                  <Code size={16} />
                </ToolbarButton>
                <ToolbarSeparator />
              </>
            )}
            
            {/* Format Options */}
            {toolbar.blocks && (
              <select 
                className="rte-select"
                onChange={(e) => executeCommand('formatBlock', e.target.value)}
                defaultValue=""
              >
                <option value="">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
                <option value="p">Paragraph</option>
              </select>
            )}
          </div>
        </div>
        
        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="rte-editor"
          style={{ minHeight: height }}
          placeholder={placeholder}
          suppressContentEditableWarning={true}
        />
        
        {/* Status Bar */}
        {showStatusBar && (
          <div className="rte-status-bar">
            <div className="rte-status-content">
              <span>Characters: {content.replace(/<[^>]*>/g, '').length}</span>
              <span>Words: {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Link Modal */}
      {showLinkModal && (
        <div className="rte-modal-overlay">
          <div className="rte-modal">
            <h3 className="rte-modal-title">Insert Link</h3>
            <div className="rte-modal-content">
              <div className="rte-form-group">
                <label className="rte-label">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="rte-input"
                  placeholder="Enter link text"
                />
              </div>
              <div className="rte-form-group">
                <label className="rte-label">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="rte-input"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="rte-modal-actions">
              <button
                onClick={() => setShowLinkModal(false)}
                className="rte-btn rte-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="rte-btn rte-btn-primary"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* HTML Output */}
      {showHTMLOutput && (
        <div className="rte-html-output">
          <h3 className="rte-html-output-title">HTML Output:</h3>
          <pre className="rte-html-output-content">{content}</pre>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
EOF

# Create src/styles.css
echo -e "${GREEN}📝 Creating src/styles.css...${NC}"
cat > src/styles.css << 'EOF'
.rte-container {
  @apply max-w-4xl mx-auto;
}

.rte-editor-wrapper {
  @apply border border-gray-300 rounded-lg shadow-sm;
}

.rte-toolbar {
  @apply border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg;
}

.rte-toolbar-content {
  @apply flex flex-wrap items-center gap-1;
}

.rte-toolbar-btn {
  @apply p-2 rounded hover:bg-gray-100 transition-colors;
}

.rte-toolbar-btn-active {
  @apply bg-gray-200;
}

.rte-toolbar-separator {
  @apply w-px h-6 bg-gray-300 mx-1;
}

.rte-select {
  @apply px-2 py-1 border border-gray-300 rounded text-sm;
}

.rte-color-picker {
  @apply flex items-center;
}

.rte-color-input {
  @apply w-8 h-8 border border-gray-300 rounded cursor-pointer;
}

.rte-editor {
  @apply p-4 focus:outline-none prose prose-sm max-w-none;
  line-height: 1.6;
  font-family: system-ui, -apple-system, sans-serif;
}

.rte-editor:empty:before {
  content: attr(placeholder);
  @apply text-gray-400;
}

.rte-status-bar {
  @apply border-t border-gray-200 px-4 py-2 bg-gray-50 rounded-b-lg;
}

.rte-status-content {
  @apply flex justify-between items-center text-sm text-gray-600;
}

.rte-modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.rte-modal {
  @apply bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4;
}

.rte-modal-title {
  @apply text-lg font-semibold mb-4;
}

.rte-modal-content {
  @apply space-y-4;
}

.rte-form-group {
  @apply space-y-1;
}

.rte-label {
  @apply block text-sm font-medium text-gray-700;
}

.rte-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.rte-modal-actions {
  @apply flex justify-end space-x-3 mt-6;
}

.rte-btn {
  @apply px-4 py-2 rounded-md;
}

.rte-btn-secondary {
  @apply text-gray-600 border border-gray-300 hover:bg-gray-50;
}

.rte-btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.rte-html-output {
  @apply mt-6 p-4 bg-gray-100 rounded-lg;
}

.rte-html-output-title {
  @apply text-sm font-semibold text-gray-700 mb-2;
}

.rte-html-output-content {
  @apply text-xs text-gray-600 whitespace-pre-wrap break-all;
}
EOF

# Create rollup.config.js
echo -e "${GREEN}📝 Creating rollup.config.js...${NC}"
cat > rollup.config.js << 'EOF'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    }),
    postcss({
      extract: true,
      minimize: true,
    }),
    terser(),
  ],
  external: ['react', 'react-dom', 'lucide-react'],
};
EOF

# Create README.md
echo -e "${GREEN}📝 Creating README.md...${NC}"
cat > README.md << EOF
# ${PACKAGE_NAME}

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

\`\`\`bash
npm install @${GITHUB_USERNAME}/${PACKAGE_NAME}
# or
yarn add @${GITHUB_USERNAME}/${PACKAGE_NAME}
\`\`\`

## Usage

\`\`\`jsx
import React, { useState } from 'react';
import RichTextEditor from '@${GITHUB_USERNAME}/${PACKAGE_NAME}';

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
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`initialContent\` | string | \`''\` | Initial HTML content |
| \`onChange\` | function | \`() => {}\` | Callback when content changes |
| \`className\` | string | \`''\` | Additional CSS classes |
| \`placeholder\` | string | \`'Start typing...'\` | Placeholder text |
| \`height\` | string | \`'24rem'\` | Editor height |
| \`showStatusBar\` | boolean | \`true\` | Show word/character count |
| \`showHTMLOutput\` | boolean | \`false\` | Show HTML output (debug) |
| \`toolbarConfig\` | object | \`{}\` | Customize toolbar sections |

## Toolbar Configuration

\`\`\`jsx
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
\`\`\`

## Styling

The component uses Tailwind CSS classes. Make sure you have Tailwind CSS installed in your project:

\`\`\`bash
npm install tailwindcss
\`\`\`

## License

MIT © [${AUTHOR_NAME}](https://github.com/${GITHUB_USERNAME})
EOF

# Create LICENSE
echo -e "${GREEN}📝 Creating LICENSE...${NC}"
cat > LICENSE << EOF
MIT License

Copyright (c) $(date +%Y) ${AUTHOR_NAME}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Create .gitignore
echo -e "${GREEN}📝 Creating .gitignore...${NC}"
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
*.log

# Coverage directory used by tools like istanbul
coverage/

# Temporary files
.tmp/
temp/
EOF

# Create .npmignore
echo -e "${GREEN}📝 Creating .npmignore...${NC}"
cat > .npmignore << 'EOF'
# Source files
src/
examples/

# Build configuration
rollup.config.js
.babelrc
babel.config.js

# Development files
*.log
.DS_Store
.env
coverage/
.git/
.github/

# IDE files
.vscode/
.idea/

# Testing
test/
tests/
__tests__/
*.test.js
*.spec.js

# Documentation (keep README.md)
docs/
EOF

# Create example usage file
echo -e "${GREEN}📝 Creating examples/basic-usage.html...${NC}"
cat > examples/basic-usage.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${PACKAGE_NAME} - Basic Usage Example</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js"></script>
</head>
<body class="bg-gray-100 p-8">
    <div id="root"></div>
    
    <script type="text/babel">
        const { useState } = React;
        
        // This would normally be: import RichTextEditor from '@${GITHUB_USERNAME}/${PACKAGE_NAME}';
        // For demo purposes, you'd need to build the package first
        
        function App() {
            const [content, setContent] = useState('<p>Welcome to the rich text editor!</p>');
            
            return (
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-center">
                        ${PACKAGE_NAME} Demo
                    </h1>
                    
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Basic Usage</h2>
                        {/* <RichTextEditor 
                            initialContent={content}
                            onChange={setContent}
                            placeholder="Start writing..."
                        /> */}
                        <p className="text-gray-600 mt-4">
                            Install the package and import RichTextEditor to see it in action!
                        </p>
                    </div>
                    
                    <div className="mt-8 bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm">
                        <pre>npm install @${GITHUB_USERNAME}/${PACKAGE_NAME}</pre>
                    </div>
                </div>
            );
        }
        
        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>
EOF

# Create .babelrc
echo -e "${GREEN}📝 Creating .babelrc...${NC}"
cat > .babelrc << 'EOF'
{
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "node": "current"
      }
    }],
    ["@babel/preset-react", {
      "runtime": "automatic"
    }]
  ]
}
EOF

# Make the script executable and create a setup script
echo -e "${GREEN}📝 Creating setup.sh...${NC}"
cat > setup.sh << 'EOF'
#!/bin/bash

# Setup script for the rich text editor package
echo "🔧 Setting up the development environment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the package
echo "🏗️  Building the package..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Test the build: npm run build"
echo "2. Publish to npm: npm publish --access public"
echo "3. Create a git repository and push your code"
echo ""
echo "Happy coding! 🚀"
EOF

chmod +x setup.sh

# Final output
echo ""
echo -e "${GREEN}✅ Package created successfully!${NC}"
echo -e "${BLUE}📁 Directory: ${PACKAGE_NAME}${NC}"
echo -e "${YELLOW}📦 Package: @${GITHUB_USERNAME}/${PACKAGE_NAME}${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. ${GREEN}cd ${PACKAGE_NAME}${NC}"
echo -e "  2. ${GREEN}./setup.sh${NC}  (or run npm install && npm run build)"
echo -e "  3. ${GREEN}npm publish --access public${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Update package.json with your actual GitHub username and details${NC}"
echo -e "${YELLOW}💡 Tip: Make sure the package name is available on npm${NC}"
echo ""
echo -e "${GREEN}🎉 Happy coding!${NC}"
EOF