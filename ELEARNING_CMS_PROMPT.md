# E-Learning CMS - Ralph Wiggum Development Prompt

## Project Overview

Build a Figma/Notion-like CMS for creating e-learning content. Block-based editor with left panel (tools/layers), center (live preview), right panel (settings tabs).

**Tech Stack:** Vite + Next.js 16 (App Router), Shadcn/ui, Tailwind CSS v4, Drizzle ORM, Neon PostgreSQL, OpenAI API

**Design:** Minimal black/white/grey prototype aesthetic. Clean, functional, scalable.

---

## Environment Variables

```env
# Database - Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:npg_jW4QOwR5PnFX@ep-hidden-union-agg6mxiz-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_jW4QOwR5PnFX@ep-hidden-union-agg6mxiz.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

# OpenAI
OPENAI_API_KEY=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
```

---

## PHASE 1: Project Foundation & Database Schema

### Task

Set up Next.js 16 project with all dependencies and create the complete database schema using Drizzle ORM.

### Requirements

1. **Project Setup**
   - Next.js 16 with App Router
   - Tailwind CSS v4 configuration
   - Shadcn/ui installed and configured (use neutral/zinc theme for black/white/grey aesthetic)
   - Drizzle ORM with Neon PostgreSQL
   - Project structure following Next.js best practices

2. **Database Schema Design** (JSON-based block storage for flexibility)

```
entities:
  - id, type (activity|lesson|course|assessment), title, description
  - status (draft|published), version, created_at, updated_at
  - settings (JSON - global settings for the entity)

entity_versions:
  - id, entity_id, version_number, content (JSON - full block tree)
  - created_at, published_at

blocks:
  - id, entity_id, version_id, parent_id (for nesting)
  - type (text|image|video|card|slide|quiz_question|option|section|etc)
  - content (JSON - block-specific data)
  - order, settings (JSON - styling/config)
  - created_at, updated_at

activity_types:
  - video, daily_dilemma, quick_dive, in_practice, quiz

lessons:
  - id, entity_id, intro_text, outro_text
  - activity_ids (ordered array)

courses:
  - id, entity_id, is_ordered (boolean)
  - module structure (JSON)
  - placement_test_id (optional)

assessments:
  - id, entity_id, passing_score
  - certificate_template_id

certificates:
  - id, name, template (JSON - canvas data)
  - settings (JSON - configurable fields)

media:
  - id, type (image|video), url, source (upload|external|ai_generated)
  - metadata (JSON), created_at
```

3. **API Routes Structure**
   - `/api/entities` - CRUD for all entity types
   - `/api/blocks` - CRUD for blocks with reordering
   - `/api/versions` - Version management (create, restore, list)
   - `/api/media` - Upload handling and URL storage
   - `/api/ai/text` - OpenAI text generation
   - `/api/ai/image` - OpenAI DALL-E image generation

4. **Tests**
   - Schema validation tests
   - Database connection test
   - Basic CRUD operation tests for each table

### Success Criteria
- [ ] `pnpm dev` runs without errors
- [ ] Database migrations applied successfully
- [ ] All tables created in Neon
- [ ] Basic API routes return 200
- [ ] Tests pass with >80% coverage on schema layer

### Process
1. Initialize Next.js project with TypeScript
2. Configure Tailwind v4 and Shadcn
3. Set up Drizzle with schema files
4. Run migrations against Neon
5. Create base API route handlers
6. Write and run tests
7. If tests fail, debug and fix
8. Repeat until all green

### After 20 iterations if stuck:
- Document which specific step is failing
- List error messages
- Check Neon connection issues separately

Output <promise>PHASE1_COMPLETE</promise> when:
- Project runs locally
- All migrations applied
- Tests passing
- API routes responding

---

## PHASE 2: Core Editor Layout & Block System

### Task

Build the unified editor interface with three-panel layout and implement the core block system.

### Requirements

1. **Editor Layout** (`/editor/[type]/[id]`)
   - Left Panel (240px collapsible):
     - Tools section (add block buttons/palette)
     - Layers section (block tree, drag-to-reorder with @dnd-kit)
   - Center Panel (flexible):
     - Device preview toggle (Desktop/Tablet/Mobile)
     - Live preview canvas showing blocks as learner would see
     - Click-to-select blocks for editing
   - Right Panel (320px collapsible):
     - Tab 1: Element Settings (selected block's properties + styling)
     - Tab 2: Global Settings (entity-level configuration)

2. **Block System Architecture**
   ```typescript
   interface Block {
     id: string
     type: BlockType
     content: Record<string, any>
     settings: {
       style?: CSSProperties
       className?: string
       [key: string]: any
     }
     children?: Block[]
     order: number
   }
   
   type BlockType = 
     | 'text' | 'heading' | 'image' | 'video' 
     | 'card' | 'card_group' | 'slide' | 'slide_deck'
     | 'quiz_question' | 'option' | 'section' | 'divider'
     | 'two_column' | 'callout' | 'list'
   ```

3. **Block Components**
   - Each block type has: Renderer (preview), Editor (inline editing), Settings (right panel)
   - Blocks are composable (cards can contain text, images, etc.)
   - Consistent selection/hover states (grey border on hover, black border on select)

4. **State Management**
   - Use Zustand for editor state
   - Optimistic updates with API sync
   - Undo/redo support (command pattern)

5. **Tests**
   - Block rendering tests
   - Drag-and-drop reorder tests
   - Settings panel update tests
   - Device preview responsive tests

### Success Criteria
- [ ] Three-panel layout renders correctly
- [ ] Can add blocks from tools palette
- [ ] Can reorder blocks via drag-drop in layers
- [ ] Selecting block shows its settings in right panel
- [ ] Device preview toggles work
- [ ] Changes persist to database
- [ ] Undo/redo works
- [ ] Tests passing

### Component Structure
```
/components
  /editor
    EditorLayout.tsx
    LeftPanel.tsx
    CenterPanel.tsx
    RightPanel.tsx
    DevicePreview.tsx
    BlockCanvas.tsx
  /blocks
    /renderers (what learner sees)
    /editors (inline editing mode)
    /settings (right panel forms)
    BlockWrapper.tsx (selection, drag handle)
    BlockRegistry.tsx (type -> component mapping)
  /ui (shadcn components)
```

### Process
1. Build layout shell with resizable panels
2. Implement Zustand store for blocks
3. Create BlockWrapper with selection logic
4. Build 3 basic blocks (text, heading, image)
5. Implement layers list with dnd-kit
6. Connect right panel settings forms
7. Add device preview toggle
8. Wire up API persistence
9. Add undo/redo
10. Write tests
11. If failing, fix and iterate

Output <promise>PHASE2_COMPLETE</promise> when:
- Editor layout fully functional
- Basic blocks working end-to-end
- Drag/drop reordering works
- Settings update blocks in real-time
- Tests passing

---

## PHASE 3: Single Activity Types

### Task

Implement all 5 single activity formats with their unique block structures and settings.

### Requirements

1. **Video Activity**
   - Video block with URL input OR upload OR AI description for placeholder
   - Thumbnail settings
   - Playback settings (autoplay, controls, loop)
   - Transcript block (optional, AI-generatable)

2. **Daily Dilemma Activity**
   - Slide deck container
   - Each slide can have:
     - Content area (text, image blocks)
     - Option cards (2-4 options)
   - Each option has:
     - Label text
     - "Is best answer" toggle
     - Feedback text (shown after selection)
   - No scoring, just feedback display

3. **Quick Dive Activity**
   - Rich content area supporting:
     - Text (with inline formatting)
     - Images (with captions)
     - Videos (embedded)
     - Info cards (styled callouts)
     - Expandable sections
   - Reading time estimate (auto-calculated)

4. **In Practice Activity**
   - Slide deck with special two-column layout per slide
   - Left column: "How to apply" content
   - Right column: "Why it matters" content
   - Both columns support same blocks as Quick Dive

5. **Quiz Activity**
   - Question blocks with:
     - Question text (supports images)
     - Answer options (radio, 2-6 options)
     - Correct answer marking
     - Points value
     - Explanation (shown after answer)
   - Quiz-level settings:
     - Passing score percentage
     - Show correct answers toggle
     - Randomize questions toggle
     - Time limit (optional)

6. **AI Integration for Activities**
   - "Generate with AI" button on text blocks
   - "Improve with AI" button on existing text
   - "Generate image" button on image blocks
   - Context-aware prompts (knows activity type)

### Settings Panel for Each Activity Type
- Activity-specific settings in Global Settings tab
- Block-specific settings when block selected

### Tests
- Each activity type renders correctly
- Quiz scoring logic works
- Daily dilemma feedback display works
- AI generation endpoints respond
- Activity saves and loads correctly

### Process
1. Create activity type registry/factory
2. Build Video activity (simplest)
3. Build Quiz activity (validates scoring logic)
4. Build Quick Dive (rich content)
5. Build Daily Dilemma (options + feedback)
6. Build In Practice (two-column)
7. Integrate AI buttons
8. Write comprehensive tests
9. Fix failures, iterate

Output <promise>PHASE3_COMPLETE</promise> when:
- All 5 activity types fully functional
- Can create, edit, save each type
- Quiz scoring works correctly
- AI generation works
- Tests passing

---

## PHASE 4: Lessons & Courses

### Task

Implement Lesson and Course entities that compose single activities, with intro/outro and module structure.

### Requirements

1. **Lesson Entity**
   - Intro section (rich text blocks)
   - Activities list (ordered, reorderable)
   - Activity picker modal (search/filter existing activities)
   - Create new activity inline option
   - Outro section (rich text blocks)
   - Lesson-level settings:
     - Estimated duration (auto-calculated from activities)
     - Learning objectives (list)
     - Prerequisites (optional)

2. **Course Entity**
   - Module structure:
     ```typescript
     interface CourseModule {
       id: string
       title: string
       description: string
       lessons: string[] // lesson IDs
       order: number
       isRequired: boolean
     }
     ```
   - Module management (add, remove, reorder)
   - Lesson assignment to modules
   - Course settings:
     - Is ordered (must complete in sequence) toggle
     - Placement test (optional, links to assessment)
     - Skip rules based on placement test score
   - Course overview editor (landing page blocks)

3. **Placement Test Integration**
   - Select existing assessment as placement test
   - Score threshold configuration per module
   - "Skip if score > X%" for each module

4. **Nested Editor Experience**
   - Course editor can drill into module → lesson → activity
   - Breadcrumb navigation
   - "Edit" vs "Preview" for nested items
   - Back navigation preserves state

### Tests
- Lesson CRUD with activities
- Course CRUD with modules
- Activity reordering within lesson
- Module reordering within course
- Placement test skip logic
- Nested navigation works

Output <promise>PHASE4_COMPLETE</promise> when:
- Lessons compose activities correctly
- Courses compose modules/lessons correctly
- Placement test integration works
- Nested editing navigation works
- Tests passing

---

## PHASE 5: Assessments & Certificate Designer

### Task

Implement assessment entity with multiple test types and a full canvas certificate designer.

### Requirements

1. **Assessment Entity**
   - Extends Quiz activity concept
   - Multiple sections (group questions by topic)
   - Section-level settings:
     - Points per section
     - Time limit per section
   - Assessment-level settings:
     - Total passing score
     - Attempts allowed
     - Time limit (total)
     - Proctoring settings (placeholder for future)
     - Certificate template selection

2. **Certificate Designer**
   - Canvas-based editor (use Fabric.js or Konva)
   - Template starting points (3-4 pre-built templates)
   - Editable elements:
     - Text (with variable placeholders: {{name}}, {{date}}, {{course}}, {{score}})
     - Images (logo upload, decorative elements)
     - Shapes (lines, borders, badges)
     - Background color/image
   - Right panel settings:
     - Element-specific (font, size, color, position)
     - Global (page size, orientation, margins)
   - Toggle elements:
     - Show/hide logo
     - Show/hide score
     - Show/hide additional description
     - Show/hide signature line
   - Preview with sample data
   - Export as template JSON

3. **Certificate Generation** (API)
   - Endpoint to generate PDF with real data
   - Variable substitution
   - Return PDF or image URL

### Tests
- Assessment CRUD
- Section management
- Scoring calculation
- Certificate designer renders
- Template save/load
- PDF generation works

Output <promise>PHASE5_COMPLETE</promise> when:
- Assessments fully functional
- Certificate designer works
- Templates save/load correctly
- PDF generation works
- Tests passing

---

## PHASE 6: Versioning, Polish & Final Testing

### Task

Implement version control, add polish, and ensure everything works together.

### Requirements

1. **Version Control**
   - Save as draft / Publish workflow
   - Version history list
   - Compare versions (diff view, nice-to-have)
   - Restore previous version
   - Auto-save drafts (debounced)

2. **Polish**
   - Loading states (skeleton loaders)
   - Error boundaries and error states
   - Empty states with helpful prompts
   - Keyboard shortcuts (Cmd+S save, Cmd+Z undo, Delete block)
   - Toast notifications for actions
   - Confirmation modals for destructive actions

3. **Dashboard**
   - List all entities by type
   - Search and filter
   - Status badges (draft/published)
   - Quick actions (edit, duplicate, delete)
   - Create new entity flow

4. **Final Integration Tests**
   - End-to-end flow: create activity → add to lesson → add to course
   - Assessment with certificate flow
   - Version restore flow
   - AI generation in context

### Tests
- Version create/restore
- E2E user flows
- Error handling
- Keyboard shortcuts

Output <promise>PHASE6_COMPLETE</promise> when:
- Versioning works
- Dashboard complete
- All polish items done
- E2E tests passing
- No console errors
- Ready for demo

---

## Global Guidelines (Apply to All Phases)

### Code Quality
- TypeScript strict mode
- ESLint + Prettier configured
- Proper error handling (try/catch, error boundaries)
- No `any` types except where absolutely necessary
- Meaningful variable/function names
- Comments for complex logic only

### Component Patterns
- Server components by default, client only when needed
- Custom hooks for reusable logic
- Proper prop typing
- Composition over configuration
- Consistent file naming (PascalCase components, camelCase utilities)

### Testing
- Vitest for unit tests
- React Testing Library for component tests
- Test files co-located with components (`Component.test.tsx`)
- Minimum 80% coverage on business logic

### Styling
- Tailwind utility classes
- Shadcn components as base
- CSS variables for theming
- Consistent spacing scale
- Black/white/grey palette:
  - Background: white, zinc-50
  - Borders: zinc-200, zinc-300
  - Text: zinc-900, zinc-600, zinc-400
  - Accents: black (primary actions)

### Git
- Meaningful commit messages
- Commit after each major milestone within phase

---

## Stuck Protocol

If after 15 iterations a phase is not complete:

1. Document current state:
   - What's working
   - What's failing (with error messages)
   - What was attempted

2. Identify blocker category:
   - Dependency issue
   - Logic error
   - API/database issue
   - Environment issue

3. Attempt targeted fix for top blocker

4. If still stuck after 5 more iterations:
   - Create `STUCK_REPORT.md` with full details
   - List alternative approaches
   - Output <promise>PHASE_STUCK</promise>

---

## Completion

When all 6 phases complete, run full test suite and verify:
- All pages load without error
- All CRUD operations work
- All activity types function
- Lessons and courses compose correctly
- Assessments and certificates work
- AI integration functional
- Versioning works
- Dashboard is usable

Output <promise>PROJECT_COMPLETE</promise> when verified.
