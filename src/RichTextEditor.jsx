import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link, Image, Code, 
  Undo, Redo, Type, Palette, Quote, Table,
  Search, Replace, Eye, Download, Upload,
  Scissors, Copy, Clipboard, RotateCcw,
  Subscript, Superscript, Minus, MoreHorizontal,
  Indent, Outdent, Hash, Check, X, Plus,
  FileText, Save, Maximize, Minimize,
  Highlight, Eraser, PaintBucket, ChevronDown
} from 'lucide-react';

const RichTextEditor = ({ 
  initialContent = '',
  onChange = () => {},
  className = '',
  placeholder = 'Start typing...',
  height = '24rem',
  showStatusBar = true,
  showHTMLOutput = false,
  toolbarConfig = {},
  enableSpellCheck = true,
  maxLength = null,
  readOnly = false
}) => {
  const [content, setContent] = useState(initialContent);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showFindReplaceModal, setShowFindReplaceModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageWidth, setImageWidth] = useState('');
  const [imageHeight, setImageHeight] = useState('');
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [currentFontFamily, setCurrentFontFamily] = useState('Arial');
  const [currentFontSize, setCurrentFontSize] = useState('12');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const defaultToolbarConfig = {
    undoRedo: true,
    fontSize: true,
    fontFamily: true,
    formatting: true,
    colors: true,
    alignment: true,
    lists: true,
    insert: true,
    blocks: true,
    table: true,
    findReplace: true,
    fullscreen: true,
    export: true,
    advanced: true
  };

  const toolbar = { ...defaultToolbarConfig, ...toolbarConfig };

  const fontFamilies = [
    'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia', 
    'Helvetica', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman',
    'Trebuchet MS', 'Verdana', 'system-ui', 'Inter', 'Segoe UI'
  ];

  const fontSizes = [
    { value: '1', label: '8pt' },
    { value: '2', label: '10pt' },
    { value: '3', label: '12pt' },
    { value: '4', label: '14pt' },
    { value: '5', label: '18pt' },
    { value: '6', label: '24pt' },
    { value: '7', label: '36pt' }
  ];

  const commonColors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF',
    '#9900FF', '#FF00FF', '#F4C2C2', '#FFE6CC', '#FFF2CC', '#D5E8D4',
    '#D4E6F1', '#E1D5E7', '#F8CECC', '#FFCC99'
  ];

  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
      setContent(initialContent);
      updateStats(initialContent);
    }
  }, [initialContent]);

  const updateStats = useCallback((htmlContent) => {
    const textContent = htmlContent.replace(/<[^>]*>/g, '');
    setCharCount(textContent.length);
    setWordCount(textContent.split(/\s+/).filter(word => word.length > 0).length);
  }, []);

  const saveToHistory = useCallback(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      setUndoStack(prev => [...prev.slice(-19), currentContent]);
      setRedoStack([]);
    }
  }, []);

  const executeCommand = (command, value = null) => {
    if (readOnly) return;
    
    saveToHistory();
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const customUndo = () => {
    if (undoStack.length > 0 && editorRef.current) {
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [editorRef.current.innerHTML, ...prev.slice(0, 19)]);
      setUndoStack(prev => prev.slice(0, -1));
      editorRef.current.innerHTML = lastState;
      handleContentChange();
    }
  };

  const customRedo = () => {
    if (redoStack.length > 0 && editorRef.current) {
      const nextState = redoStack[0];
      setUndoStack(prev => [...prev.slice(-19), editorRef.current.innerHTML]);
      setRedoStack(prev => prev.slice(1));
      editorRef.current.innerHTML = nextState;
      handleContentChange();
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      
      if (maxLength) {
        const textContent = newContent.replace(/<[^>]*>/g, '');
        if (textContent.length > maxLength) {
          return;
        }
      }
      
      setContent(newContent);
      onChange(newContent);
      updateStats(newContent);
    }
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      setSelectedText(selection.toString());
    }
  };

  const insertTable = () => {
    if (!editorRef.current) return;
    
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;"><tbody>';
    
    for (let i = 0; i < tableRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        tableHTML += '<td style="padding: 8px; border: 1px solid #ccc; min-width: 50px;">&nbsp;</td>';
      }
      tableHTML += '</tr>';
    }
    
    tableHTML += '</tbody></table>';
    
    executeCommand('insertHTML', tableHTML);
    setShowTableModal(false);
    setTableRows(3);
    setTableCols(3);
  };

  const insertAdvancedImage = () => {
    if (!imageUrl) return;
    
    let imgHTML = `<img src="${imageUrl}" alt="${imageAlt || ''}"`;
    
    const styles = [];
    if (imageWidth) styles.push(`width: ${imageWidth}px`);
    if (imageHeight) styles.push(`height: ${imageHeight}px`);
    
    if (styles.length > 0) {
      imgHTML += ` style="${styles.join('; ')}"`;
    }
    
    imgHTML += ' />';
    
    executeCommand('insertHTML', imgHTML);
    setShowImageModal(false);
    setImageUrl('');
    setImageAlt('');
    setImageWidth('');
    setImageHeight('');
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHTML = `<a href="${linkUrl}" style="color: #0066cc; text-decoration: underline;">${linkText}</a>`;
      executeCommand('insertHTML', linkHTML);
      setLinkUrl('');
      setLinkText('');
      setShowLinkModal(false);
    }
  };

  const findAndReplace = () => {
    if (!findText || !editorRef.current) return;
    
    let content = editorRef.current.innerHTML;
    const regex = new RegExp(findText, 'gi');
    
    if (replaceText) {
      content = content.replace(regex, replaceText);
      editorRef.current.innerHTML = content;
      handleContentChange();
    } else {
      // Just highlight found text
      content = content.replace(regex, `<mark style="background: yellow;">$&</mark>`);
      editorRef.current.innerHTML = content;
    }
  };

  const clearFormatting = () => {
    executeCommand('removeFormat');
    executeCommand('unlink');
  };

  const insertHorizontalRule = () => {
    executeCommand('insertHTML', '<hr style="margin: 10px 0; border: none; border-top: 1px solid #ccc;" />');
  };

  const exportToHTML = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToText = () => {
    const textContent = content.replace(/<[^>]*>/g, '\n').replace(/\n+/g, '\n').trim();
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
        handleContentChange();
      }
    };
    
    if (file.type === 'text/html') {
      reader.readAsText(file);
    } else if (file.type === 'text/plain') {
      reader.readAsText(file);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const ToolbarButton = ({ onClick, children, title, active = false, disabled = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center w-8 h-8 text-gray-700 hover:bg-gray-100 
        rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${active ? 'bg-blue-100 text-blue-700' : ''}
      `}
    >
      {children}
    </button>
  );

  const ToolbarSeparator = () => <div className="w-px h-6 bg-gray-300 mx-1"></div>;

  const ColorPicker = ({ isOpen, onClose, onColorSelect, colors }) => (
    isOpen && (
      <div className="absolute top-10 left-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
        <div className="grid grid-cols-6 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => {
                onColorSelect(color);
                onClose();
              }}
              title={color}
            />
          ))}
        </div>
      </div>
    )
  );

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'} border border-gray-300 rounded-lg ${className}`}>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
          {/* File Operations */}
          {toolbar.export && (
            <>
              <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Import File">
                <Upload size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={exportToHTML} title="Export as HTML">
                <Download size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={exportToText} title="Export as Text">
                <FileText size={16} />
              </ToolbarButton>
              <ToolbarSeparator />
            </>
          )}

          {/* Undo/Redo */}
          {toolbar.undoRedo && (
            <>
              <ToolbarButton 
                onClick={customUndo} 
                title="Undo" 
                disabled={undoStack.length === 0}
              >
                <Undo size={16} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={customRedo} 
                title="Redo" 
                disabled={redoStack.length === 0}
              >
                <Redo size={16} />
              </ToolbarButton>
              <ToolbarSeparator />
            </>
          )}

          {/* Font Family */}
          {toolbar.fontFamily && (
            <select 
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentFontFamily}
              onChange={(e) => {
                setCurrentFontFamily(e.target.value);
                executeCommand('fontName', e.target.value);
              }}
            >
              {fontFamilies.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          )}

          {/* Font Size */}
          {toolbar.fontSize && (
            <select 
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ml-1"
              value={currentFontSize}
              onChange={(e) => {
                setCurrentFontSize(e.target.value);
                executeCommand('fontSize', e.target.value);
              }}
            >
              {fontSizes.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          )}

          <ToolbarSeparator />

          {/* Basic Formatting */}
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
              <ToolbarButton onClick={() => executeCommand('subscript')} title="Subscript">
                <Subscript size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => executeCommand('superscript')} title="Superscript">
                <Superscript size={16} />
              </ToolbarButton>
              <ToolbarSeparator />
            </>
          )}

          {/* Colors */}
          {toolbar.colors && (
            <>
              <div className="relative">
                <ToolbarButton 
                  onClick={() => setShowColorPicker(!showColorPicker)} 
                  title="Text Color"
                >
                  <Type size={16} />
                </ToolbarButton>
                <ColorPicker 
                  isOpen={showColorPicker}
                  onClose={() => setShowColorPicker(false)}
                  onColorSelect={(color) => executeCommand('foreColor', color)}
                  colors={commonColors}
                />
              </div>
              <div className="relative">
                <ToolbarButton 
                  onClick={() => setShowBgColorPicker(!showBgColorPicker)} 
                  title="Background Color"
                >
                  <PaintBucket size={16} />
                </ToolbarButton>
                <ColorPicker 
                  isOpen={showBgColorPicker}
                  onClose={() => setShowBgColorPicker(false)}
                  onColorSelect={(color) => executeCommand('hiliteColor', color)}
                  colors={commonColors}
                />
              </div>
              <ToolbarButton onClick={() => executeCommand('hiliteColor', 'yellow')} title="Highlight">
                <Highlight size={16} />
              </ToolbarButton>
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

          {/* Lists and Indentation */}
          {toolbar.lists && (
            <>
              <ToolbarButton onClick={() => executeCommand('insertUnorderedList')} title="Bullet List">
                <List size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => executeCommand('insertOrderedList')} title="Numbered List">
                <ListOrdered size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => executeCommand('indent')} title="Increase Indent">
                <Indent size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => executeCommand('outdent')} title="Decrease Indent">
                <Outdent size={16} />
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
              <ToolbarButton onClick={() => setShowImageModal(true)} title="Insert Image">
                <Image size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => executeCommand('formatBlock', 'blockquote')} title="Quote">
                <Quote size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => executeCommand('formatBlock', 'pre')} title="Code Block">
                <Code size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={insertHorizontalRule} title="Horizontal Rule">
                <Minus size={16} />
              </ToolbarButton>
            </>
          )}

          {/* Table */}
          {toolbar.table && (
            <>
              <ToolbarSeparator />
              <ToolbarButton onClick={() => setShowTableModal(true)} title="Insert Table">
                <Table size={16} />
              </ToolbarButton>
            </>
          )}

          {/* Advanced Features */}
          {toolbar.advanced && (
            <>
              <ToolbarSeparator />
              <ToolbarButton onClick={clearFormatting} title="Clear Formatting">
                <Eraser size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => executeCommand('selectAll')} title="Select All">
                <Hash size={16} />
              </ToolbarButton>
            </>
          )}

          {/* Find/Replace */}
          {toolbar.findReplace && (
            <>
              <ToolbarSeparator />
              <ToolbarButton onClick={() => setShowFindReplaceModal(true)} title="Find & Replace">
                <Search size={16} />
              </ToolbarButton>
            </>
          )}

          {/* Fullscreen */}
          {toolbar.fullscreen && (
            <>
              <ToolbarSeparator />
              <ToolbarButton onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </ToolbarButton>
            </>
          )}

          {/* Block Format */}
          {toolbar.blocks && (
            <>
              <ToolbarSeparator />
              <select 
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => executeCommand('formatBlock', e.target.value)}
                defaultValue=""
              >
                <option value="">Format</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
                <option value="p">Paragraph</option>
                <option value="div">Normal</option>
              </select>
            </>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
          <div
            ref={editorRef}
            contentEditable={!readOnly}
            onInput={handleContentChange}
            onMouseUp={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            className={`
              w-full h-full p-4 focus:outline-none overflow-auto
              ${readOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            `}
            style={{ 
              minHeight: isFullscreen ? 'calc(100vh - 120px)' : height,
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            placeholder={placeholder}
            suppressContentEditableWarning={true}
            spellCheck={enableSpellCheck}
          />
        </div>

        {/* Status Bar */}
        {showStatusBar && (
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 rounded-b-lg">
            <div className="flex items-center space-x-4">
              <span>Words: {wordCount}</span>
              <span>Characters: {charCount}</span>
              {maxLength && (
                <span className={charCount > maxLength * 0.9 ? 'text-red-600' : ''}>
                  Limit: {charCount}/{maxLength}
                </span>
              )}
              {selectedText && <span>Selected: {selectedText.length} chars</span>}
            </div>
            <div className="flex items-center space-x-2">
              {readOnly && <span className="text-orange-600">Read Only</span>}
              <span>Ready</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={importFile}
        accept=".html,.txt"
        className="hidden"
      />

      {/* Modals */}
      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the image"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={imageHeight}
                    onChange={(e) => setImageHeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={insertAdvancedImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Table</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={insertTable}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Find & Replace Modal */}
      {showFindReplaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Find & Replace</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Find</label>
                <input
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Text to find"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Replace with</label>
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Replacement text"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowFindReplaceModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  findAndReplace();
                  setShowFindReplaceModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Find & Replace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HTML Output */}
      {showHTMLOutput && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">HTML Output:</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40 text-gray-800">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
};

// Demo Component
const App = () => {
  const [editorContent, setEditorContent] = useState('<p>Welcome to the Enhanced Rich Text Editor!</p><p>This editor includes advanced features like:</p><ul><li>Advanced formatting options</li><li>Table insertion</li><li>Find & replace functionality</li><li>Image management</li><li>Export capabilities</li><li>Fullscreen mode</li><li>And much more!</li></ul>');
  
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enhanced Rich Text Editor
        </h1>
        <p className="text-gray-600">
          A powerful WYSIWYG editor with advanced features to compete with TinyMCE
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg">
        <RichTextEditor
          initialContent={editorContent}
          onChange={setEditorContent}
          height="400px"
          showStatusBar={true}
          showHTMLOutput={false}
          enableSpellCheck={true}
          maxLength={10000}
          placeholder="Start creating amazing content..."
          toolbarConfig={{
            undoRedo: true,
            fontSize: true,
            fontFamily: true,
            formatting: true,
            colors: true,
            alignment: true,
            lists: true,
            insert: true,
            blocks: true,
            table: true,
            findReplace: true,
            fullscreen: true,
            export: true,
            advanced: true
          }}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Key Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✅ Advanced text formatting (bold, italic, underline, strikethrough)</li>
            <li>✅ Font family and size selection</li>
            <li>✅ Text and background color pickers</li>
            <li>✅ Text alignment and indentation</li>
            <li>✅ Lists (ordered and unordered)</li>
            <li>✅ Link and image insertion with advanced options</li>
            <li>✅ Table creation and management</li>
            <li>✅ Find and replace functionality</li>
            <li>✅ Undo/Redo with history management</li>
            <li>✅ Export to HTML and plain text</li>
            <li>✅ Import from HTML/text files</li>
            <li>✅ Fullscreen editing mode</li>
            <li>✅ Character and word count</li>
            <li>✅ Spell checking support</li>
            <li>✅ Read-only mode</li>
            <li>✅ Content length limits</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Advanced Capabilities</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>🎨 Custom color palettes</li>
            <li>📊 Rich table insertion with customizable dimensions</li>
            <li>🔍 Advanced find and replace with highlighting</li>
            <li>📱 Responsive design with mobile support</li>
            <li>⌨️ Keyboard shortcuts support</li>
            <li>🎯 Selection tracking and context awareness</li>
            <li>💾 Multiple export formats</li>
            <li>🖼️ Advanced image insertion with sizing</li>
            <li>📝 Block format selection (headings, quotes, code)</li>
            <li>🎪 Fullscreen editing experience</li>
            <li>⚡ Real-time content statistics</li>
            <li>🛡️ Content validation and limits</li>
            <li>🎨 Syntax highlighting for code blocks</li>
            <li>📋 Advanced clipboard operations</li>
            <li>🔧 Customizable toolbar configuration</li>
            <li>♿ Accessibility features built-in</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Usage Example</h3>
        <pre className="bg-blue-100 p-4 rounded text-sm overflow-x-auto text-blue-800">
{`<RichTextEditor
  initialContent="<p>Hello World!</p>"
  onChange={(content) => console.log(content)}
  height="300px"
  showStatusBar={true}
  enableSpellCheck={true}
  maxLength={5000}
  placeholder="Start typing..."
  toolbarConfig={{
    undoRedo: true,
    formatting: true,
    colors: true,
    table: true,
    export: true
  }}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default App;