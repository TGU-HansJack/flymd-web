# Changelog

## v0.5.5
- Added: AI vision capabilities that let the assistant directly read local images and call vision models for understanding and analysis
- Added: New window layout APIs for the extension system, enabling a three-column layout
- Added: Exposed YAML Front Matter and parsed metadata API for plugins
- Added: Published "Telegraph-Image" image hosting plugin in the extension marketplace
- Improved: Layout behavior of AI plugin windows and tab bar
- Improved: Error handling around local and hosted images with size/limit prompts
- Fixed: Library sidebar drag-and-drop sorting now persists correctly

## v0.5.4
- Added: AI chat can now link with Sticky Notes for quick todo creation
- Improved: Default Sticky Note spawn position
- Added: Custom drag-and-drop ordering for the sidebar tree
- Improved: PDFs are now sorted separately from Markdown files
- Improved: WebDAV sync defaults for newly created libraries
- Fixed: Added explicit prompt when WebDAV is not configured

## v0.5.3
- Added: Extension marketplace search for name, author, and description
- Added: "Markdown Table Helper" marketplace extension
- Improved: Unified table styling across Edit/Reading/WYSIWYG modes
- Improved: Theme settings panel with new typography presets

## v0.5.2
- Added: Collaboration mode with JS-driven custom cursor
- Improved: Refined WYSIWYG editing styles for KaTeX
- Fixed: Mermaid/Math NodeView scrolling issues in WYSIWYG mode
- Added: "Generate tag" and "Open in new instance" in sidebar context menu

## v0.5.1
- Added: Open collaborative editing support with FlyMD collaboration server sample
- Added: Plugin host APIs for custom namespaces and selection changes
- Improved: File-tree click/double-click integration with multi-tab system
- Fixed: Layout glitches with plain text paste

## v0.5.0
- Added: Sticky Note mode to open documents in compact windows
- Added: Sticky Note controls with "Lock position" and "Always on top" buttons
- Added: Enhanced tab right-click menu with "Open in new instance"
- Added: Quick todo input in Sticky Note mode
- Improved: AI Assistant replies now support Markdown rendering
- Improved: Reworked editor undo/redo logic with per-tab undo stacks

## v0.4.8
- Added: WebDAV sync now supports end-to-end encryption
- Added: Restored OMG preset endpoint in AI Assistant settings
- Added: More theme background options and Markdown layout presets
- Fixed: WYSIWYG bold/italic shortcuts cursor positioning

## v0.4.7
- Added: Full configuration export/import
- Added: Portable Mode to store config alongside the app root
- Added: Tab right-click menu
- Improved: Adjusted `Ctrl+N` behavior for multi-tab workflow

## v0.4.6
- Added: Right-click context menu items support drag-and-drop sorting
- Added: Custom three-button dialogs for exit prompts
- Improved: Auto-detect OS dark preference on launch

## v0.4.5
- Added: WebDAV sync HTTP host whitelist
- Improved: WYSIWYG edits now trigger outline refresh
- Fixed: Reworked WYSIWYG `Ctrl+B / Ctrl+I` shortcuts

## v0.4.3
- Improved: macOS build upgraded to Universal Binary

## v0.4.2
- Added: Multi-tab editing with `Ctrl+T` new tab
- Added: Library sidebar rename/delete shortcuts
- Added: WYSIWYG code blocks copy button
- Added: Plugin marketplace local installation support
- Improved: WebDAV sync allows plain HTTP connections

## v0.4.1
- Improved: Library sidebar open/close state persisted
- Fixed: Focus Mode no longer hides folder toggle arrows

## v0.4.0
- Added: Dark mode toggle in theme settings
- Added: AI Assistant defaults to free model with SiliconFlow integration
- Added: AI Assistant exposes `callAI / translate / quickAction / generateTodos` APIs
- Added: WebDAV sync and sync log viewer in context menu
- Added: WYSIWYG mode fully supports AI extension capabilities

## v0.3.9
- Added: Focus Mode — borderless immersive writing experience
- Added: "Default to WYSIWYG Mode" toggle in theme settings

## v0.3.8
- Added: AI assistant "Free model" mode
- Added: AI assistant "Translate" action
- Added: Extension APIs `context.getPreviewElement` and `context.saveFileWithDialog`

## v0.3.7
- Added: AI assistant and todo integration
- Added: Inter-plugin communication API

## v0.3.6
- Added: Built-in `xxtui todo push` extension
- Added: Extension runtime right-click menu API
- Added: Extension marketplace channel selection

## v0.3.5
- Added: Auto-fetch page title when pasting URLs with `Ctrl+V`
- Added: Reading mode width adjustment with `Shift + scroll wheel`

## v0.3.4
- Improved: Optimized WebDAV sync strategy
- Added: Custom library icons support

## v0.3.3
- Fixed: Manual WebDAV sync strategy
- Improved: Scroll position preserved when switching modes

## v0.3.2
- Fixed: PDF bookmarks/outline issues
- Improved: Document library refresh after WebDAV sync

## v0.3.1
- Improved: Greatly improved startup and rendering performance
- Improved: WebDAV sync calculation and comparison logic
- Added: Word count in row/column status

## v0.3.0
- Improved: Enhanced window styles with animation effects

## v0.2.9
- Added: Extension APIs `pickDocFiles / openFileByPath / exportCurrentToPdf`
- Added: Batch PDF Export Extension

## v0.2.8
- Added: Extension update checking and hot-reload support

## v0.2.7
- Added: Ctrl+H find & replace in WYSIWYG mode
- Fixed: KaTeX square roots rendering issues

## v0.2.6
- Fixed: Missing LaTeX symbols in Reading mode
- Improved: Mermaid supported when exporting to Word

## v0.2.5
- Added: Mermaid zoom support in Reading/WYSIWYG modes
- Added: Export Mermaid as standalone SVG

## v0.2.4
- Added: Editor/Plugin APIs for AI extensions
- Added: Multiple libraries support

## v0.2.3
- Added: Custom font support
- Added: Zoom in/out via Ctrl + mouse wheel

## v0.2.2
- Improved: Theme CSS compatibility for dark mode
- Improved: Updated icons

## v0.2.0
- Added: Theme and background color customization API
- Added: Image hosting conversion & compression

## v0.1.9
- Added: Drag documents between folders in library
- Added: `¥¥` auto-converts to `$$` in Chinese IME

## v0.1.8
- Added: Save as PDF
- Added: Save as DOCX and WPS

## v0.1.7
- Improved: Mermaid global rendering in WYSIWYG mode
- Added: Strikethrough `~~` completion

## v0.1.6
- Improved: WYSIWYG mode supports undo/redo
- Added: TODO list support with click to toggle
- Added: Ctrl+H find & replace, paired marker completion

## v0.1.5
- Added: Markdown outline (WYSIWYG and Reading modes) and PDF bookmarks

## v0.1.4
- Improved: Sync feature library root snapshot
- Fixed: LaTeX formula rendering errors in Reading mode

## v0.1.3
- Refactor: Completely refactored WYSIWYG mode (V2)
- Added: Reading mode Ctrl+R, WYSIWYG mode Ctrl+W shortcuts

## v0.1.2
- Added: Sync logic options with real-time logs
- Added: Document library folder create/delete

## v0.1.0
- Added: WebDAV sync extension

## v0.0.9
- Added: Always save images locally option
- Added: Convert HTML to Markdown when pasting
- Added: Extension management and installation

## v0.0.8
- Added: Save clipboard images to local images directory

## v0.0.7
- Added: Custom sorting for file library
- Added: Update detection and download

## v0.0.6
- Added: Reading/editing position memory
- Added: WYSIWYG mode LaTeX and Mermaid support

## v0.0.5
- Added: PDF preview support
- Added: PDF file association

## v0.0.4
- Added: Document library create/rename/delete/move
- Added: Image hosting toggle

## v0.0.3
- Added: Library feature with sidebar file list
- Added: Clipboard image paste

## v0.0.2
- Unified confirmation dialogs to Tauri native
- Fixed: Unsaved close without prompt issue
- Enhanced: Mermaid rendering and error prompts

## v0.0.1
- Added: LaTeX (KaTeX) rendering support
- Added: Mermaid flowchart/sequence diagram support
- Added: Shortcuts Ctrl+B bold, Ctrl+I italic, Ctrl+K insert link
