import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import ResizableImageExtension from 'tiptap-extension-resize-image'
import { Color } from '@tiptap/extension-color'
import { useState, useRef, useEffect } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, CodeSquare, Link as LinkIcon, ImageIcon, Minus, Save, Share2
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'

// Modal for saving notebooks with custom names
const SaveModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('')

  if (!isOpen) return null

  const handleSave = () => {
    if (name.trim()) {
      onSave(name)
      setName('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Save Notebook</CardTitle>
          <CardDescription>Give your notebook entry a name</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter notebook name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Rich text editor toolbar with formatting controls
const MenuBar = ({ editor, onSave, onShare }) => {
  const fileInputRef = useRef(null)

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  // Convert uploaded image to base64 and insert into editor
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result
        if (url) {
          editor.chain().focus().setImage({ src: url, alt: file.name }).run()
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="border rounded-lg bg-card p-3 mb-4 flex flex-wrap gap-1 items-center justify-between">
      <div className="flex flex-wrap gap-1">
        {/* Heading buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text formatting buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
        >
          <Code className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* List buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Block elements */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
        >
          <CodeSquare className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Media insertion */}
        <Button
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="w-4 h-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button size="sm" onClick={onSave} className="bg-blue-500 hover:bg-blue-600">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

export function JournalPage() {
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [savedNotebooks, setSavedNotebooks] = useState([])
  const [editorState, setEditorState] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      ResizableImageExtension.configure({
        inline: false,
        allowBase64: true,
      }),
      Color,
    ],
    content: `
      <h1>Welcome to Your Notebook</h1>
      <h3>This is a powerful rich text editor built with TipTap. You can:</h3>
      <p>Format text with <strong>bold</strong>, <em>italic</em>, and <u>underline</u></p>
      <ul>
        <li>Create headers and subheaders</li>
        <li>Insert links and images</li>
        <li>Add code blocks and blockquotes</li>
        <li>Create ordered and unordered lists</li>
      </ul>
      <p>Start typing to replace this content...</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
    // Force re-render on content or selection changes to update toolbar active states
    onUpdate: () => setEditorState(prev => prev + 1),
    onSelectionUpdate: () => setEditorState(prev => prev + 1),
  })

  const handleSave = (name) => {
    if (editor) {
      const notebook = {
        id: Date.now(),
        name,
        content: editor.getHTML(),
        type: 'Notebook',
        createdAt: new Date().toISOString(),
      }
      setSavedNotebooks([...savedNotebooks, notebook])
      console.log('Saved notebook:', notebook)
      // TODO: Save to backend/localStorage
    }
  }

  const handleShare = () => {
    console.log('Share functionality coming soon')
    // TODO: Implement share functionality
  }

  // Custom markdown shortcut: Convert ```code``` to code blocks
  // This watches for the pattern and converts it automatically
  useEffect(() => {
    if (!editor) return

    let isProcessing = false
    let debounceTimeout = null

    const handleUpdate = () => {
      if (isProcessing) return

      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }

      // Wait 300ms after typing stops before processing to avoid interfering with typing
      debounceTimeout = setTimeout(() => {
        const { from, to } = editor.state.selection
        if (from !== to) return // Don't process if user has selected text

        const text = editor.getText()
        const pattern = /```([^`]+)```/g
        const match = pattern.exec(text)

        if (match) {
          const code = match[1]
          const fullMatch = match[0]
          const fullText = editor.getText()
          const startIndex = fullText.indexOf(fullMatch)

          if (startIndex !== -1) {
            isProcessing = true

            // Find the exact position in the document structure
            let fromPos = 0
            let found = false
            editor.state.doc.descendants((node, pos) => {
              if (!found && node.isText) {
                const nodeText = node.text
                if (startIndex >= fromPos && startIndex < fromPos + nodeText.length) {
                  const relativePos = startIndex - fromPos
                  const actualFrom = pos + relativePos
                  const actualTo = actualFrom + fullMatch.length

                  // Replace the text with a code block node
                  setTimeout(() => {
                    editor.chain()
                      .setTextSelection({ from: actualFrom, to: actualTo })
                      .deleteSelection()
                      .insertContentAt(actualFrom, {
                        type: 'codeBlock',
                        content: [{ type: 'text', text: code }]
                      })
                      .run()

                    isProcessing = false
                  }, 0)

                  found = true
                  return false
                }
                fromPos += nodeText.length
              }
              return true
            })

            if (!found) {
              isProcessing = false
            }
          }
        }
      }, 300)
    }

    editor.on('update', handleUpdate)

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
      editor.off('update', handleUpdate)
    }
  }, [editor])

  if (!editor) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
      <div className="flex-1 px-8 py-8 overflow-hidden flex flex-col">
        <MenuBar
          editor={editor}
          onSave={() => setShowSaveModal(true)}
          onShare={handleShare}
        />
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
      />

      <style>{`
        .ProseMirror {
          outline: none !important;
          min-height: 100%;
        }

        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
          margin-top: 1.5rem;
          color: hsl(var(--foreground));
        }

        .ProseMirror h1:first-child {
          margin-top: 0;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
          margin-top: 1.25rem;
          color: hsl(var(--foreground));
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
          color: hsl(var(--foreground));
        }

        .ProseMirror p {
          margin-bottom: 1rem;
          line-height: 1.75;
          color: hsl(var(--foreground));
        }

        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 2rem;
          margin-bottom: 1rem;
        }

        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 2rem;
          margin-bottom: 1rem;
        }

        .ProseMirror li {
          margin-bottom: 0.25rem;
          display: list-item;
        }

        .ProseMirror ul ul {
          list-style-type: circle;
        }

        .ProseMirror ul ul ul {
          list-style-type: square;
        }

        .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
          cursor: pointer;
        }

        .ProseMirror a:hover {
          opacity: 0.8;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          display: block;
        }

        .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid hsl(var(--primary));
        }

        .ProseMirror .image-resizer {
          display: inline-block;
          position: relative;
          max-width: 100%;
        }

        .ProseMirror .image-resizer img {
          display: block;
          width: 100%;
          height: auto;
        }

        .ProseMirror .image-resizer.ProseMirror-selectednode::after {
          content: '';
          position: absolute;
          right: 0;
          bottom: 0;
          width: 10px;
          height: 10px;
          background: hsl(var(--primary));
          cursor: nwse-resize;
        }

        .ProseMirror pre {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background: none;
          padding: 0;
          font-size: 0.875rem;
        }

        .ProseMirror code {
          background: hsl(var(--muted));
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .ProseMirror blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }

        .ProseMirror hr {
          border: none;
          border-top: 2px solid hsl(var(--border));
          margin: 2rem 0;
        }

        .ProseMirror strong {
          font-weight: bold;
        }

        .ProseMirror em {
          font-style: italic;
        }
      `}</style>
    </div>
  )
}
