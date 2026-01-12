# E-Learning CMS – Authoring Requirements Addendum

This document supplements `ELEARNING_CMS_PROMPT.md` with detailed authoring experience requirements, operational behaviors, and UI specifications. It consolidates requirements from the lesson-authoring project specs.

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Autosave | ✅ Built | 3s debounce in `useAutoSave.ts` |
| Undo/Redo | ✅ Built | 50-step history in editor store |
| Version Control | ✅ Built | Create/restore versions with publish flag |
| Keyboard Shortcuts | ✅ Built | Cmd+S, Cmd+Z, Cmd+Shift+Z, Delete, Escape |
| Activity Types | ✅ Built | Video, Daily Dilemma, Quick Dive, In Practice, Quiz |
| Block System | ✅ Built | 17 block types with renderers and settings |
| Certificate Designer | ✅ Built | Canvas elements, templates, variable substitution |
| Media Library | ⚠️ Partial | URL registration only, no upload handler |
| User Roles | ❌ Missing | Needs auth + RBAC |
| Content Validation | ❌ Missing | No pre-publish checks |
| Skillsets Taxonomy | ❌ Missing | Metadata system needed |
| Conflict Detection | ❌ Missing | No concurrent edit handling |
| AI Generation | ⚠️ Partial | Routes exist, no handlers |
| Reusable Content | ❌ Missing | No linking/forking system |

---

## UI Guidelines

**Keep the CMS editor UI simple.** Use shadcn/ui components with default black & white styling. Theme colors will be added later.

- Use standard shadcn components: `Button`, `Input`, `Textarea`, `Select`, `Switch`, `Card`, `Tabs`, `Dialog`
- Use `border` for panel separation
- Use `bg-muted` for subtle backgrounds
- Focus on functionality over decoration
- Preview colors (in center panel) are separate from editor UI colors

---

## Table of Contents

1. [User Roles & Permissions](#1-user-roles--permissions) ❌
2. [Save, Autosave & Undo/Redo](#2-save-autosave--undoredo) ✅ (enhance)
3. [Media & Asset Management](#3-media--asset-management) ⚠️ (needs upload)
4. [Pre-Publish Validation](#4-pre-publish-validation) ❌
5. [Skillsets & Subskills Taxonomy](#5-skillsets--subskills-taxonomy) ❌
6. [Content Lifecycle](#6-content-lifecycle) ✅ (enhance)
7. [Reuse, Linking & Forking](#7-reuse-linking--forking) ❌
8. [AI Governance](#8-ai-governance) ❌
9. [Editor Panels Specification](#9-editor-panels-specification) ✅ (reference)
10. [Activity Type Specifications](#10-activity-type-specifications) ✅ (reference)
11. [Certificate Designer](#11-certificate-designer) ✅ (reference)

---

## 1. User Roles & Permissions

### 1.1 User Types

| Role | Description | Primary Use |
|------|-------------|-------------|
| **admin** | System administrator | Full access, manage users/orgs |
| **studio** | Internal content creator | Create/edit all content, publish, AI tools |
| **external_client** | Client L&D team member | Edit AI-generated content, limited publish |

### 1.2 Permission Matrix

| Action | Admin | Studio | External Client |
|--------|-------|--------|-----------------|
| Create empty Lesson | ✅ | ✅ | ❌ |
| Create AI-generated Lesson | ✅ | ✅ | ✅ |
| Edit own content | ✅ | ✅ | ✅ |
| Edit assigned content | ✅ | ✅ | ✅ |
| Edit others' content | ✅ | ✅ | ❌ |
| Publish content | ✅ | ✅ | ✅ (own/assigned only) |
| Access Studio library | ✅ | ✅ | ⚙️ (if enabled) |
| Reuse content | ✅ | ✅ | ⚙️ (if enabled) |
| Manage users | ✅ | ❌ | ❌ |
| Delete content | ✅ | ✅ | ❌ |
| View analytics | ✅ | ✅ | ✅ (own only) |

### 1.3 External Client Flow (Experts Integration)

External clients receive AI-generated lessons from Experts and use the CMS to:
1. Edit activity content inline
2. Replace/update media
3. Adjust settings
4. Publish to their organization

They CANNOT:
- Create lessons from scratch
- Delete structural elements
- Access Studio content library (unless enabled)

---

## 2. Save, Autosave & Undo/Redo

### What's Already Built ✅

**Autosave** (`src/hooks/useAutoSave.ts`):
- 3000ms debounce (configurable)
- Bulk saves all blocks via PUT `/api/blocks`
- `isDirty` flag tracking
- Silent save (no toast spam)
- Error toasts on failure

**Undo/Redo** (`src/stores/editor-store.ts`):
- 50-step history stack
- `saveToHistory()`, `undo()`, `redo()` actions
- Full block state snapshots

**Keyboard Shortcuts** (`src/hooks/useKeyboardShortcuts.ts`):
- `Cmd/Ctrl + S` → Manual save
- `Cmd/Ctrl + Z` → Undo
- `Cmd/Ctrl + Shift + Z` / `Cmd/Ctrl + Y` → Redo
- `Delete/Backspace` → Delete selected block
- `Escape` → Deselect

**Version Control** (`/api/versions`):
- Create version snapshot with optional publish
- Restore to any previous version
- VersionHistory component with draft/published badges

---

### Enhancements Needed ❌

### 2.1 Save Status UI (Top Bar)

Current: Shows "Unsaved changes" and "Saving..."
**Enhance with timestamp:**

| State | Display | Description |
|-------|---------|-------------|
| Saved | `Saved • 2 min ago` | All changes persisted |
| Saving | `Saving…` | In-progress save |
| Offline | `Offline • Changes stored locally` | Network unavailable |
| Conflict | `Conflict detected` | Server has newer revision |

### 2.2 Conflict Prevention (NEW)

Current: No concurrent edit handling

**Add to save flow:**
1. Entity table needs `revision` column (auto-increment on update)
2. Client includes `revision` in PUT requests
3. Server rejects with 409 Conflict if mismatch

**Conflict Resolution Modal:**
- "This content was updated elsewhere"
- Options:
  1. **Reload latest** (discard local changes)
  2. **Copy my changes** (create forked draft)
  3. **Compare** (v2: diff view)

### 2.3 Draft Recovery (NEW)

**On page reload/reconnection:**
- Check localStorage for `draft:{entityId}:{userId}`
- If exists and newer than server: "Restore unsaved edits?"
- Store draft on every autosave attempt that fails

### 2.4 Autosave Enhancement

**Add triggers:**
- On blur (leaving a field)
- Before opening publish/export modals
- On navigation away (with warning if dirty)

---

## 3. Media & Asset Management

### 3.1 Asset Entity

```typescript
interface Asset {
  id: string;
  organizationId: string;
  type: 'image' | 'video' | 'audio' | 'caption' | 'document';
  storageKey: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;      // images
  height?: number;     // images
  durationSeconds?: number;  // audio/video
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  source: 'upload' | 'generated' | 'external_url';
  locale?: string;     // per-locale variant
  altText?: string;    // required for images on publish
  transcript?: string; // optional for audio/video
}
```

### 3.2 Upload UX

**Supported Input Methods:**
- Drag & drop
- File picker
- Paste from clipboard (images)
- External URL input

**Progress & Failure:**
- Upload progress bar
- Retry on failure
- Cancel upload option

### 3.3 Asset Library

Users can browse organization-scoped assets:
- Search by filename
- Filter by asset type
- Sort by recent / most used
- "Used in X places" indicator

### 3.4 Localized Assets

- Each locale can reference different assets
- Missing locale asset → fallback to default locale with indicator

### 3.5 Accessibility Requirements

| Asset Type | Requirements |
|------------|--------------|
| Images | `altText` required before publish (or mark as decorative) |
| Video | Captions required for publish (configurable) |
| Audio | Transcript required for publish (configurable) |

---

## 4. Pre-Publish Validation

### 4.1 Validation Levels

| Level | Description | Behavior |
|-------|-------------|----------|
| **Warning** (soft) | Best practice issue | Can still publish |
| **Error** (hard) | Missing requirement | Must fix to publish |

### 4.2 Validation Entry Points

- Opening Publish modal
- Opening Export modal
- On-demand: Settings tab → "Run checks"

### 4.3 Validation Results UI

Show checklist grouped by:
- Missing required fields
- Localization gaps
- Accessibility issues
- Broken media
- Structural errors

Each item includes:
- What's wrong
- "Jump to fix" → selects correct layer/block in editor

### 4.4 Validation Rules by Entity

#### Course (Hard)
- Title present in default locale
- At least 1 module
- Valid module order (no duplicates)

#### Lesson (Hard)
- Title present in default locale
- At least 1 Activity
- Recap exists (required)

#### Activity by Type

**Video:**
- videoUrl or uploaded asset present
- Captions present for default locale (if policy requires)

**Daily Dilemma:**
- Minimum 1 anecdote + 1 dilemma screen
- At least 2 options on dilemma
- Every option has feedback
- At least 1 correct option marked

**Quick Dive:**
- At least 1 block
- All blocks have required fields

**In Practice:**
- Takeaway title + description required
- Each step has title + description

**Quiz:**
- ≥1 question
- Each question ≥2 options
- At least 1 correct option per question
- Passing score 0–100

**Podcast:**
- Script exists OR uploaded audio exists
- Transcript required (if policy enabled)

---

## 5. Skillsets & Subskills Taxonomy

### 5.1 Tagging Rules

| Entity | Required Tag |
|--------|--------------|
| Activity | 1 Subskill (implies parent Skillset) |
| Lesson | 1 Skillset |
| Course | 1 Skillset |

### 5.2 UI Placement

Right Panel → Settings tab:
- **Activities**: Subskill dropdown (Skillset auto-fills)
- **Lessons/Courses**: Skillset dropdown only

### 5.3 Taxonomy (Seed Data)

**9 Skillsets × 10 Subskills each = 90 skills**

#### 1. Communication
- Active listening, Clear writing, Difficult conversations, Feedback, Storytelling, Stakeholder comms, Meeting facilitation, Empathy, Negotiation, Presentation

#### 2. Leadership
- Coaching, Delegation, Motivation, Decision-making, Vision setting, 1:1 management, Conflict resolution, Accountability, Hiring, Performance reviews

#### 3. Collaboration
- Cross-functional work, Alignment, Team rituals, Remote collaboration, Decision logs, Hand-offs, Peer feedback, Inclusion, Facilitation, Trust building

#### 4. Productivity
- Prioritization, Time management, Focus, Planning, Execution, Deep work, Habit building, Goal setting, Personal organization, Stress management

#### 5. Problem Solving
- Root cause analysis, Systems thinking, Critical thinking, Experimentation, Framing, Ideation, Trade-offs, Risk assessment, Learning loops, Troubleshooting

#### 6. Customer Focus
- Customer interviews, Empathy mapping, Service recovery, Handling complaints, Value delivery, Journey mapping, Support mindset, Quality mindset, Expectation setting, Relationship mgmt

#### 7. Emotional Intelligence
- Self-awareness, Self-regulation, Social awareness, Resilience, Managing stress, Confidence, Growth mindset, Handling ambiguity, Handling criticism, Compassion

#### 8. Strategy
- Market understanding, Competitive analysis, Strategic planning, OKRs, Alignment, Business thinking, Resource planning, Roadmapping, Measuring outcomes, Change management

#### 9. Learning & Development
- Coaching skills, Facilitation, Instructional design, Assessment design, Knowledge management, Mentoring, Workshop design, Feedback loops, Content curation, Evaluation

---

## 6. Content Lifecycle

### What's Already Built ✅

**Status States** (`src/db/schema.ts`):
```typescript
status: varchar('status', { length: 20 }).default('draft')  // draft | published
```

**Version Publishing** (`/api/versions`):
- `POST /api/versions` with `publish: true` sets:
  - `entity.status = 'published'`
  - `entity_version.publishedAt = now()`
- VersionHistory component shows published vs draft badges

**Delete** (`/api/entities/{id}`):
- Cascading delete via foreign key constraints
- Blocks, versions, activities all auto-deleted

---

### Enhancements Needed ❌

### 6.1 Add 'archived' Status

Current: Only `draft` and `published`
**Add:**
```typescript
type Status = 'draft' | 'published' | 'archived';
```

### 6.2 State Transitions

```
     ┌──────────────────────────────────┐
     │                                  │
     ▼                                  │
  ┌──────┐        ┌───────────┐        │
  │ draft │──────▶│ published │────────┘
  └──────┘        └───────────┘         unpublish
     │                 │
     │                 │ archive
     │                 ▼
     │            ┌──────────┐
     └───────────▶│ archived │
       archive    └──────────┘
```

### 6.3 Archived Behavior

- Does NOT appear in "Add from Existing" by default
- Appears in library only with "Include archived" filter
- If already used in published content: remains there, but cannot be added to new

### 6.4 Soft Delete Enhancement

- Add `deletedAt` column for soft delete
- Deleting referenced entity → block OR convert to archived
- "Danger Zone" UI shows consequences before delete

---

## 7. Reuse, Linking & Forking

### 7.1 Reuse Model

Content reuse is **internal to organization**.

```typescript
interface ActivityReuse {
  activityId: string;
  sourceId: string;     // Original activity
  lessonId: string;     // Where it's used
  isLinked: boolean;    // True = syncs with source
}
```

### 7.2 Linked vs Forked

| Behavior | Linked | Forked |
|----------|--------|--------|
| Source changes propagate | ✅ | ❌ |
| Can edit independently | ❌ | ✅ |
| Shows 🔗 indicator | ✅ | ❌ |
| Counts toward usage | ✅ | ❌ |

### 7.3 Add from Existing Picker

**Picker Modal Features:**
- Search by title, tags, expert
- Filters: Status, Type, Owner, Locale
- Sort: Recently updated (default), Most used, A-Z
- Usage count indicator

### 7.4 Visual Cues

**Left Panel:**
- 🔗 chain icon next to reused items
- Tooltip: "This content is used in other lessons"

**Right Panel (linked content selected):**
```
┌─────────────────────────────────┐
│  ⚠️ Linked content              │
│  Changes may affect 4 lessons   │
│                                 │
│  [📋 Make a copy]               │
└─────────────────────────────────┘
```

### 7.5 Fork Metadata

```typescript
interface ForkMetadata {
  sourceId: string;
  forkedFromVersion?: number;
  forkReason?: string;
}
```

---

## 8. AI Governance

### 8.1 Organization AI Settings

```typescript
interface OrgAISettings {
  enabled: boolean;
  allowedFeatures: {
    lessonGeneration: boolean;
    translation: boolean;
    assessmentGeneration: boolean;
    podcastGeneration: boolean;
  };
  monthlyQuota?: number;  // requests or token budget
}
```

### 8.2 Rate Limiting

| Scope | Default Limit |
|-------|---------------|
| Per user | 20 AI calls / hour |
| Per org | 200 AI calls / day |
| Audio generation | Stricter limits |

### 8.3 Audit Logging

Every AI request logs:
- Who requested
- When
- Entity targeted
- Locale
- Input prompt hash
- Output reference
- Model/version used
- Cost metadata

### 8.4 AI Output Labeling

```typescript
interface LocalizedContent {
  // ... existing fields
  aiGenerated: boolean;
  aiGeneratedAt?: Date;
  aiModel?: string;
}
```

"Regenerate" button requires confirmation before overwriting.

---

## 9. Editor Panels Specification

### What's Already Built ✅

**Core Components** (all in `src/components/editor/`):
- `EditorLayout.tsx` - Main three-panel layout with autosave integration
- `LeftPanel.tsx` - Block palette + layer tree
- `CenterPanel.tsx` - Live preview canvas
- `RightPanel.tsx` - Element properties + global settings
- `VersionHistory.tsx` - Save/publish/restore interface
- `BlockWrapper.tsx` - Selection, hover, interaction handling

**Block System** (in `src/components/blocks/`):
- 17 renderers in `/renderers/` (TextRenderer, HeadingRenderer, etc.)
- 13 settings panels in `/settings/` (TextSettings, etc.)

**State Management** (`src/stores/editor-store.ts`):
- Zustand store with full block CRUD
- Selection state (`selectedBlockId`, `hoveredBlockId`)
- Device preview modes (`desktop`, `tablet`, `mobile`)
- Panel collapse states

---

### Reference: Layout Overview

```
┌──────────────────────────────────────────────────────────────────┐
│  TOP BAR                                                         │
│  [← Back] [Title] [Save Status] [Device Toggle] [Export] [Publish]│
└──────────────────────────────────────────────────────────────────┘
┌────────────┬─────────────────────────────────┬───────────────────┐
│            │                                 │                   │
│   LEFT     │         CENTER                  │      RIGHT        │
│   PANEL    │         PANEL                   │      PANEL        │
│            │                                 │                   │
│  Tools     │      Live Preview               │   Content &       │
│    &       │      (Edit Surface)             │   Settings        │
│  Layers    │                                 │                   │
│            │                                 │                   │
│  ~240px    │         Flexible                │      ~320px       │
│            │                                 │                   │
└────────────┴─────────────────────────────────┴───────────────────┘
```

### 9.2 Left Panel Responsibilities

| Action | Description |
|--------|-------------|
| **Add** | Create new activities, screens, blocks |
| **Remove** | Delete elements (with confirmation) |
| **Reorder** | Drag-and-drop to change order |
| **Navigate** | Click to select and view |

### 9.3 Right Panel Tabs

| Tab | Purpose |
|-----|---------|
| **Design** | Content, styling, media |
| **Settings** | Publishing, visibility, metadata, danger zone |

### 9.4 Context-Aware Behavior

#### Lesson Overview Mode (Left Panel)
```
┌─────────────────────────┐
│ ADD ACTIVITY            │
│ ┌─────────┬─────────┐   │
│ │  📹     │  📖     │   │
│ │ Video   │ Quick   │   │
│ │         │  Dive   │   │
│ ├─────────┼─────────┤   │
│ │  💭     │  🎯     │   │
│ │ Daily   │   In    │   │
│ │ Dilemma │Practice │   │
│ ├─────────┼─────────┤   │
│ │  📝     │  🎙️     │   │
│ │  Quiz   │ Podcast │   │
│ └─────────┴─────────┘   │
│ [Browse Existing]       │
├─────────────────────────┤
│ LESSON STRUCTURE        │
│ ├─ 📄 Lesson Overview   │
│ ├─ ≡ 📹 Welcome Video   │
│ ├─ ≡ 💭 Decision Time   │
│ ├─ ≡ 📝 Quiz            │
│ └─ 🏆 Recap (required)  │
└─────────────────────────┘
```

#### Inside Activity (Left Panel transforms)
```
┌─────────────────────────┐
│ [← Back to Lesson]      │
│ Activity: Daily Dilemma │
├─────────────────────────┤
│ ADD SCREENS             │
│ ├─ Anecdote Screen  [+] │
│ ├─ Dilemma Screen   [+] │
│ └─ Option Card      [+] │
├─────────────────────────┤
│ SCREENS                 │
│ ├─ ≡ 💬 Anecdote 1      │
│ ├─ ≡ ❓ Dilemma         │
│ │   ├─ 🅰️ Option A      │
│ │   └─ 🅱️ Option B      │
│ └─ ≡ 💬 Anecdote 2      │
└─────────────────────────┘
```

---

## 10. Activity Type Specifications

### What's Already Built ✅

**5 Activity Types** (defined in `src/types/activities.ts`):

| Type | Config Keys | Block Palette |
|------|-------------|---------------|
| Video | `videoUrl`, `autoplay`, `controls`, `loop`, `transcriptEnabled` | video, transcript |
| Daily Dilemma | `feedbackMode` | slide_deck, slide, card_group, card, text |
| Quick Dive | `estimatedReadingTime` | text, heading, image, callout, list |
| In Practice | `layoutMode` | two_column, text, heading, image, callout |
| Quiz | `passingScore`, `randomize`, `timeLimit`, `attemptsAllowed` | quiz_question, option, text, image |

**Activity Configs** (`src/db/schema.ts`):
- `activities` table links to `entities` with activity-specific settings JSON

**Block Palette Restrictions** (`src/types/activities.ts`):
- Each activity type defines which block types are allowed

### Activity Type to Add ❌

**Podcast Activity** (from lesson-authoring):
- Script editor for AI audio generation
- Audio upload support
- Chapter markers
- Transcript editor
- Voice selection for AI generation

---

### Reference: 10.1 Video Activity

**Left Panel Tools:**
| Tool | Icon | Description |
|------|------|-------------|
| Upload Video | `Upload` | Upload MP4, WebM |
| Video URL | `Link` | YouTube/Vimeo/direct |
| Add Chapter | `Bookmark` | Chapter marker |
| Add Captions | `Subtitles` | Caption track |

**Right Panel - Design Tab:**
- Video source toggle (Upload / URL)
- Video preview player
- Thumbnail selection
- Playback settings (autoplay, controls, loop)
- Chapter list
- Caption management

---

### 10.2 Quick Dive Activity

**Left Panel Tools:**
| Tool | Icon | Description |
|------|------|-------------|
| Text Block | `Type` | Rich text paragraph |
| Image Block | `Image` | Image with caption |
| Quote Block | `Quote` | Blockquote |
| Tip Block | `Lightbulb` | Callout box |

**Right Panel - Design Tab:**
- Layout style toggle: `Magazine` | `Slides`
- Section background colors
- Block-specific settings (font size, alignment, etc.)

---

### 10.3 Daily Dilemma Activity

**Screen Flow:**
```
Anecdote(s) → Dilemma (with options) → Feedback (per option)
```

**Screen Types:**
| Type | Purpose | Content |
|------|---------|---------|
| `anecdote` | Set context | Expert speech bubble |
| `dilemma` | Present choice | Expert speech + 2-4 option cards |
| `feedback` | Show result | Response to selection |

**Left Panel Tools:**
| Tool | Icon | Description |
|------|------|-------------|
| Anecdote Screen | `MessageSquare` | Story/context screen |
| Dilemma Screen | `HelpCircle` | Decision point |
| Option Card | `Plus` | Add option (context-sensitive) |

**Option Card Structure:**
```typescript
interface OptionCard {
  id: string;
  label: string;         // "A", "B", "C"
  title?: string;
  description: string;
  isCorrect: boolean;
  feedback: {
    title: string;
    result: 'optimal' | 'acceptable' | 'not_recommended';
    expertResponse: string;
    explanation: string;
    learningPoint: string;
  };
}
```

**Right Panel - Design Tab (Activity level):**
- Expert name and avatar
- Theme color (4 presets)
- Background image

**Right Panel - Design Tab (Option selected):**
- Option text
- Correct answer toggle
- Feedback content editor

---

### 10.4 In Practice Activity

**Left Panel Tools:**
| Tool | Icon | Description |
|------|------|-------------|
| Practice Step | `CheckCircle` | Actionable step |
| Instructions | `FileText` | Instruction block |
| Tip | `Lightbulb` | Helpful tip |

**Structure:**
- Introduction with instructions
- Numbered steps (3-7 recommended)
- Required takeaway block

---

### 10.5 Quiz Activity

**Left Panel Tools:**
| Tool | Icon | Description |
|------|------|-------------|
| Multiple Choice | `CircleDot` | Single answer |
| True/False | `ToggleLeft` | Binary |
| Multi-Select | `CheckSquare` | Multiple answers |
| Image Choice | `Image` | Visual options |

**Right Panel - Design Tab (Quiz level):**
- Pass threshold slider (0-100%)
- Randomize questions toggle
- Show correct answers toggle
- Allow retry toggle

**Right Panel - Design Tab (Question selected):**
- Question text
- Options list (add/remove/mark correct)
- Feedback (correct/incorrect)

---

### 10.6 Podcast Activity

**Left Panel Tools:**
| Tool | Icon | Description |
|------|------|-------------|
| Upload Audio | `Upload` | Upload MP3, WAV, M4A |
| Audio URL | `Link` | Paste URL |
| Add Chapter | `Bookmark` | Chapter marker |
| Add Transcript | `FileText` | Transcript section |

**Right Panel - Design Tab:**
- Audio source (URL or upload)
- Audio preview player
- Cover image
- Chapter management
- Script editor (for AI generation)
- Transcript editor
- Voice selection (AI generation)

---

## 11. Certificate Designer

### What's Already Built ✅

**Database Schema** (`src/db/schema.ts`):
- `certificates` table with canvas-based design JSON
- Links to assessments for automatic awarding

**API** (`/api/certificates/[id]/generate`):
- Accepts certificate data: `name`, `date`, `course`, `score`, `instructor`, `organization`
- Variable substitution in templates
- Returns HTML for PDF conversion or JSON for client rendering

**Element Types**:
```typescript
type CertificateElementType = 'text' | 'variable' | 'image' | 'shape';
```

**Templates** (4 pre-built):
- Classic, Modern, Elegant, Minimal

---

### Reference: 11.1 Overview

Canvas-based editor for creating certificate templates using Fabric.js or Konva.

### Reference: 11.2 Template Elements

| Element | Description |
|---------|-------------|
| Text | With variable placeholders: `{{name}}`, `{{date}}`, `{{course}}`, `{{score}}` |
| Images | Logo upload, decorative elements |
| Shapes | Lines, borders, badges |
| Background | Color or image |

### 11.3 Right Panel Settings

**Element-specific:**
- Font, size, color, position
- Image source, scale

**Global:**
- Page size (A4, Letter)
- Orientation (portrait, landscape)
- Margins

### 11.4 Toggle Elements

- Show/hide logo
- Show/hide score
- Show/hide description
- Show/hide signature line

### 11.5 API

```typescript
// Generate certificate PDF
POST /api/certificates/generate
{
  templateId: string;
  data: {
    name: string;
    date: string;
    course: string;
    score?: number;
    // ... other variables
  }
}

// Response
{
  pdfUrl: string;
  imageUrl: string;
}
```

---

## Open Decisions

Mark these as decisions needed before implementation:

1. **Export requires publish?**
   - Recommended: No (configurable per org)

2. **Default reuse behavior: linked or forked?**
   - Recommended: Linked for studio, fork for external

3. **Archived content addability: block or allow?**
   - Recommended: Block add to new; allow existing

4. **"View usages" scope?**
   - Recommended: v1 shows count only, v2 adds full list

---

## Acceptance Checklist

A build is acceptable when:

- [ ] Autosave + "Saved" indicator work reliably
- [ ] Undo/redo works for text + structure + settings
- [ ] Conflict detection prevents silent overwrite
- [ ] Media uploads support progress + retry
- [ ] Publish/export gate shows actionable validation list
- [ ] Skillset/subskill metadata selectable per rules
- [ ] Reuse indicators (🔗) + "Make a copy" work correctly
- [ ] Locale fallback labels consistent everywhere
- [ ] All activity types create, edit, save, preview correctly
- [ ] Certificate designer renders and generates PDF

---

*Document Version: 1.0*
*Created: January 2025*
