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
