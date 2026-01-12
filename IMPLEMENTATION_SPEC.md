# E-Learning CMS - Complete Implementation Specification

This document consolidates all requirements for the GoodHabitz E-Learning CMS. Use this as the single source of truth for implementation.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Data Model](#3-data-model)
4. [Activity Types & Content Structures](#4-activity-types--content-structures)
5. [Editor Architecture](#5-editor-architecture)
6. [Implementation Status](#6-implementation-status)
7. [Features to Build](#7-features-to-build)
8. [Skillsets Taxonomy](#8-skillsets-taxonomy)
9. [Design System](#9-design-system)

---

## 1. Project Overview

### Purpose
CMS for creating and editing e-learning content (Courses → Modules → Lessons → Activities). Supports both:
- **Internal Studio users**: Create content from scratch
- **External clients**: Edit AI-generated lessons from the Experts product

### Content Hierarchy
```
Organization
└── Course
    └── Module
        └── Lesson
            ├── Expert Info (avatar, name, credentials)
            ├── Title & Subtitle
            ├── Duration estimate
            ├── WIIFM ("What's in it for me?")
            ├── Video Thumbnail + Video
            ├── Activities (ordered):
            │   ├── Quick Dive
            │   ├── Daily Dilemma
            │   ├── In Practice
            │   ├── Quiz
            │   └── Podcast
            └── Recap (required)
```

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) + React 19 |
| Database | PostgreSQL via Neon |
| ORM | Drizzle |
| State | Zustand |
| Styling | Tailwind CSS 4 + Radix UI |
| Drag & Drop | @dnd-kit |
| Rich Text | TipTap (planned) |

---

## 3. Data Model

### Core Entities

```typescript
// Organization
interface Organization {
  id: string;
  name: string;
  settings: OrgSettings;
  createdAt: Date;
  updatedAt: Date;
}

// Course
interface Course {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  coverImage?: string;
  status: 'draft' | 'published' | 'archived';
  skillsetId?: string;
  modules: Module[];
  createdAt: Date;
  updatedAt: Date;
}

// Module
interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

// Lesson
interface Lesson {
  id: string;
  moduleId?: string;
  organizationId: string;
  title: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  expertName?: string;
  expertAvatar?: string;
  expertCredentials?: string;
  expertBio?: string;
  duration?: number;
  wiifm?: { headline: string; points: string[] };
  status: 'draft' | 'published' | 'archived';
  skillsetId?: string;
  activities: Activity[];
  recap?: RecapContent;
  createdAt: Date;
  updatedAt: Date;
}

// Activity
interface Activity {
  id: string;
  lessonId: string;
  type: ActivityType;
  title: string;
  order: number;
  content: string; // JSON string, parsed to typed content
  subskillId?: string;
  createdAt: Date;
  updatedAt: Date;
}

type ActivityType = 'video' | 'quick_dive' | 'daily_dilemma' | 'in_practice' | 'quiz' | 'podcast';

// Version (for history)
interface Version {
  id: string;
  entityId: string;
  entityType: 'lesson' | 'activity' | 'course';
  data: string; // JSON snapshot
  createdBy: string;
  createdAt: Date;
  publishedAt?: Date;
}

// Asset
interface Asset {
  id: string;
  organizationId: string;
  type: 'image' | 'video' | 'audio' | 'caption' | 'document';
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  createdBy: string;
  createdAt: Date;
  source: 'upload' | 'generated' | 'external_url';
  altText?: string;
}
```

### Recap Content
```typescript
interface RecapContent {
  celebrationImage?: string;
  title: string;
  summary: string;
  keyTakeaways?: string[];
}
```

---

## 4. Activity Types & Content Structures

### 4.1 Video Activity

```typescript
interface VideoContent {
  videoUrl?: string;
  videoType: 'embed' | 'upload';
  thumbnailUrl?: string;
  description?: string;
  captions?: { locale: string; vttUrl: string }[];
  transcript?: string;
  chapters?: { title: string; startTime: number }[];
}
```

**Settings:** `autoplay`, `controls`, `loop`, `transcriptEnabled`

---

### 4.2 Quick Dive Activity

Magazine-style rich content article.

```typescript
interface QuickDiveContent {
  expertImage?: string;
  title: string;
  blocks: QuickDiveBlock[];
  estimatedReadingTime?: number;
}

type QuickDiveBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level: 2 | 3 }
  | { type: 'bulletList'; items: string[] }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'tipCard'; title?: string; text: string; variant: 'tip' | 'warning' | 'info' }
  | { type: 'numberedSteps'; steps: { title: string; description: string }[] }
  | { type: 'gridCards'; cards: { number: string; title: string; description: string }[] }
  | { type: 'image'; src: string; alt?: string; caption?: string };
```

**Default Template:**
```json
{
  "title": "Why [Topic] Matters More Than You Think?",
  "blocks": [
    { "type": "paragraph", "text": "Introduction paragraph..." },
    { "type": "paragraph", "text": "Second paragraph setting context..." },
    { "type": "heading", "text": "Key Components of [Topic]:", "level": 2 },
    { "type": "bulletList", "items": ["Point 1", "Point 2", "Point 3", "Point 4"] },
    { "type": "quote", "text": "Expert quote here...", "author": "Expert Name" },
    { "type": "heading", "text": "The Theoretical Foundation", "level": 2 },
    { "type": "paragraph", "text": "Deeper explanation..." },
    { "type": "tipCard", "title": "Pro tip", "text": "Actionable advice...", "variant": "tip" }
  ]
}
```

**Block Tools (Left Panel):**
| Block | Icon | Controls |
|-------|------|----------|
| Paragraph | `Type` | Font size, alignment |
| Heading | `Heading` | Level (H2/H3), alignment |
| Bullet List | `List` | Bullet style |
| Quote | `Quote` | Author name, style |
| Tip Card | `Lightbulb` | Variant (tip/warning/info), title |
| Numbered Steps | `ListOrdered` | Add/remove steps |
| Grid Cards | `LayoutGrid` | Number of cards (2-4) |
| Image | `Image` | Upload/URL, alt text, caption |

---

### 4.3 Daily Dilemma Activity

Interactive scenario-based decision activity.

```typescript
interface DailyDilemmaContent {
  screens: DailyDilemmaScreen[];
  expertName: string;
  expertAvatar?: string;
  backgroundImage?: string;
  themeColor: string; // '#2e0a61', '#0d9488', '#059669', '#db2777'
}

type DailyDilemmaScreen = AnecdoteScreen | DilemmaScreen;

interface AnecdoteScreen {
  id: string;
  type: 'anecdote';
  order: number;
  expertSpeech: string;
}

interface DilemmaScreen {
  id: string;
  type: 'dilemma';
  order: number;
  expertSpeech: string;
  options: DailyDilemmaOption[];
}

interface DailyDilemmaOption {
  id: string;
  label: string;        // "A", "B", "C", "D"
  text: string;
  isCorrect: boolean;
  feedback: string;
}
```

**Screen Flow:**
```
ANECDOTE 1 → ANECDOTE 2 (optional) → DILEMMA → FEEDBACK
```

**Default Template:**
```json
{
  "expertName": "Expert Name",
  "expertAvatar": null,
  "themeColor": "#2e0a61",
  "screens": [
    {
      "type": "anecdote",
      "order": 0,
      "expertSpeech": "You're in a meeting when a stakeholder says..."
    },
    {
      "type": "anecdote",
      "order": 1,
      "expertSpeech": "You immediately think of several responses. But which is best?"
    },
    {
      "type": "dilemma",
      "order": 2,
      "expertSpeech": "You have two options for how to respond:",
      "options": [
        {
          "label": "A",
          "text": "Option A description...",
          "isCorrect": false,
          "feedback": "Feedback for option A..."
        },
        {
          "label": "B",
          "text": "Option B description...",
          "isCorrect": true,
          "feedback": "Perfect! This is the recommended approach because..."
        }
      ]
    }
  ]
}
```

**Validation Rules:**
- Minimum 1 anecdote + 1 dilemma screen
- Dilemma must have 2-4 options
- Each option must have feedback text
- Exactly 1 option must be marked correct
- Expert speech cannot be empty

**Visual Layout - Option Cards:**
- White cards with `rounded-2xl`
- Border: `border-[6px] border-purple-600/50`
- Tilted: Option A at `-9deg`, Option B at `+9deg`
- Size: `w-[165px] h-[268px]`

---

### 4.4 In Practice Activity

Multi-slide practical tips.

```typescript
interface InPracticeContent {
  slides: InPracticeSlide[];
  backgroundColor?: string; // Default: '#2e0a61'
}

interface InPracticeSlide {
  id: string;
  order: number;
  number?: number;           // 1, 2, 3... (null for final)
  title: string;
  content: string;
  howTo?: string;            // "Here's how to do it" box
  icon: 'puzzle' | 'lightbulb' | 'target' | 'star';
  isFinal?: boolean;
}
```

**Default Template:**
```json
{
  "backgroundColor": "#2e0a61",
  "slides": [
    {
      "number": 1,
      "title": "First Practice Technique",
      "content": "Explanation of what to do and why...",
      "howTo": "Specific instructions for how to implement this...",
      "icon": "puzzle"
    },
    {
      "number": 2,
      "title": "Second Practice Technique",
      "content": "Explanation of what to do and why...",
      "howTo": "Specific instructions for how to implement this...",
      "icon": "puzzle"
    },
    {
      "number": 3,
      "title": "Third Practice Technique",
      "content": "Explanation of what to do and why...",
      "howTo": "Specific instructions for how to implement this...",
      "icon": "puzzle"
    },
    {
      "title": "Expert's Take-Away:",
      "content": "\"Summary quote from the expert with key insight...\"",
      "icon": "lightbulb",
      "isFinal": true
    }
  ]
}
```

**Validation Rules:**
- Minimum 2 slides (at least 1 step + takeaway)
- Maximum 6 slides recommended
- Each step needs title + content
- Final slide should be marked `isFinal`

---

### 4.5 Quiz Activity

```typescript
interface QuizContent {
  title?: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
}

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'multi_select' | 'true_false' | 'image_choice';
  order: number;
  questionText: string;
  questionImage?: string;
  options: QuizOption[];
  feedback?: { correct: string; incorrect: string };
}

interface QuizOption {
  id: string;
  text: string;
  image?: string;
  isCorrect: boolean;
}

interface QuizSettings {
  passingScore: number;       // 0-100, default 70
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  allowRetry: boolean;
  maxAttempts?: number;
  timeLimit?: number;         // Minutes
}
```

**Default Template:**
```json
{
  "questions": [
    {
      "type": "multiple_choice",
      "questionText": "Question 1?",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true },
        { "text": "Option C", "isCorrect": false },
        { "text": "Option D", "isCorrect": false }
      ]
    }
  ],
  "settings": {
    "passingScore": 70,
    "showCorrectAnswers": true,
    "randomizeQuestions": false,
    "randomizeOptions": false,
    "allowRetry": true
  }
}
```

**Validation Rules:**
- Minimum 1 question
- Each question needs 2+ options (except true/false)
- At least 1 correct option per question
- Passing score 0-100

---

### 4.6 Podcast Activity

Audio-based learning with script and AI generation.

```typescript
interface PodcastContent {
  title: string;
  description?: string;
  coverImage?: string;
  audioSource: 'upload' | 'generated' | 'url';
  audioUrl?: string;
  script?: PodcastScript;
  chapters?: PodcastChapter[];
  transcript?: string;
  duration?: number;
  voiceId?: string;
  voiceSpeed?: 'slow' | 'normal' | 'fast';
}

interface PodcastScript {
  locale: string;
  text: string;
  segments?: ScriptSegment[];
}

interface ScriptSegment {
  id: string;
  type: 'intro' | 'main' | 'example' | 'summary' | 'outro';
  speaker?: string;
  text: string;
  order: number;
}

interface PodcastChapter {
  id: string;
  title: string;
  startTime: number;
  description?: string;
}
```

**Default Template:**
```json
{
  "title": "Episode Title",
  "audioSource": "generated",
  "script": {
    "locale": "en",
    "text": "Welcome to this episode where we'll explore [topic].\n\n[Introduction - set context]\n\n[Main content - key concepts]\n\n[Examples - real-world applications]\n\n[Summary - key takeaways]\n\nThank you for listening!"
  },
  "chapters": [
    { "title": "Introduction", "startTime": 0 },
    { "title": "Key Concepts", "startTime": 150 },
    { "title": "Summary", "startTime": 420 }
  ],
  "voiceId": "sofia",
  "voiceSpeed": "normal"
}
```

**Voice Options:**
- Sofia (Female, Warm)
- Marcus (Male, Professional)
- Elena (Female, Energetic)
- James (Male, Calm)

**Validation Rules:**
- Must have: uploaded audio OR script (for generation) OR valid URL
- If generating: script minimum 100 words
- Chapters must have titles
- Chapter start times must be in order

---

## 5. Editor Architecture

### 5.1 Layout

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

### 5.2 Left Panel

**Responsibilities:**
- Add new activities, screens, blocks
- Remove elements (with confirmation)
- Reorder via drag-and-drop
- Navigate by clicking to select

**Lesson Overview Mode:**
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

**Inside Activity Mode:**
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
│ │   └─ 🅱️ Option B  ✓   │
│ └─ ≡ 💬 Anecdote 2      │
└─────────────────────────┘
```

### 5.3 Right Panel Tabs

| Tab | Purpose |
|-----|---------|
| **Design** | Content, styling, media |
| **Settings** | Publishing, visibility, metadata, danger zone |

### 5.4 Selection State

```typescript
type EditorSelection =
  | { type: 'lesson' }
  | { type: 'activity'; activityId: string }
  | { type: 'screen'; activityId: string; screenId: string }
  | { type: 'option'; activityId: string; screenId: string; optionId: string }
  | { type: 'block'; activityId: string; blockId: string };
```

### 5.5 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Manual save |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Delete/Backspace` | Delete selected |
| `Escape` | Deselect |

---

## 6. Implementation Status

### Built ✅

| Feature | Location |
|---------|----------|
| Autosave | `useAutoSave.ts` - 3s debounce |
| Undo/Redo | `editor-store.ts` - 50-step history |
| Version Control | `/api/versions` - create/restore with publish |
| Keyboard Shortcuts | `useKeyboardShortcuts.ts` |
| 5 Activity Types | Video, Daily Dilemma, Quick Dive, In Practice, Quiz |
| Block System | 17 block types with renderers + settings |
| Certificate Designer | Canvas elements, templates, variable substitution |

### Missing ❌

| Feature | Priority | Notes |
|---------|----------|-------|
| Podcast Activity | High | Add 6th activity type |
| Content Validation | High | Pre-publish checks |
| User Roles/Auth | High | RBAC system |
| Media Upload | Medium | Currently URL-only |
| Conflict Detection | Medium | Concurrent edit handling |
| Skillsets Taxonomy | Medium | Metadata system |
| Content Reuse | Low | Linked/forked activities |
| AI Generation | Low | Routes exist, no handlers |

---

## 7. Features to Build

### 7.1 Autosave Enhancements

**Save Status Display:**
| State | Display |
|-------|---------|
| Saved | `Saved • 2 min ago` |
| Saving | `Saving…` |
| Offline | `Offline • Changes stored locally` |
| Conflict | `Conflict detected` |

**Conflict Prevention:**
1. Add `revision` column to entities (auto-increment on update)
2. Client includes `revision` in PUT requests
3. Server rejects with 409 if mismatch

**Conflict Resolution Modal:**
- "This content was updated elsewhere"
- Options: Reload latest / Copy my changes / Compare

### 7.2 Pre-Publish Validation

**Entry Points:**
- Opening Publish modal
- Opening Export modal
- Settings tab → "Run checks"

**Validation Levels:**
| Level | Behavior |
|-------|----------|
| Warning (soft) | Can still publish |
| Error (hard) | Must fix to publish |

**Results UI:**
- Grouped by: Missing fields, Localization, Accessibility, Broken media, Structural
- Each item: What's wrong + "Jump to fix" button

### 7.3 Content Reuse (Linked vs Forked)

| Behavior | Linked | Forked |
|----------|--------|--------|
| Source changes propagate | ✅ | ❌ |
| Can edit independently | ❌ | ✅ |
| Shows 🔗 indicator | ✅ | ❌ |

**"Add from Existing" Picker:**
- Search by title, tags, expert
- Filters: Status, Type, Owner, Locale
- Sort: Recently updated, Most used, A-Z
- Usage count indicator

### 7.4 User Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access, manage users/orgs |
| **studio** | Create/edit all content, publish, AI tools |
| **external_client** | Edit AI-generated content, limited publish |

---

## 8. Skillsets Taxonomy

9 Skillsets × 10 Subskills = 90 skills total.

**Tagging Rules:**
- Activity: 1 Subskill (parent Skillset implied)
- Lesson: 1 Skillset
- Course: 1 Skillset

### Skillsets

| ID | Name | Color |
|----|------|-------|
| communication | Communication | #5a14bd |
| leadership | Leadership | #0d9488 |
| collaboration | Collaboration | #059669 |
| productivity | Productivity | #db2777 |
| problem-solving | Problem Solving | #f59e0b |
| customer-focus | Customer Focus | #ef4444 |
| emotional-intelligence | Emotional Intelligence | #8b5cf6 |
| strategy | Strategy | #0ea5e9 |
| learning-development | Learning & Development | #14b8a6 |

### Example Subskills (Communication)

| ID | Name |
|----|------|
| active-listening | Active Listening |
| clear-writing | Clear Writing |
| difficult-conversations | Difficult Conversations |
| feedback | Feedback |
| storytelling | Storytelling |
| stakeholder-comms | Stakeholder Communication |
| meeting-facilitation | Meeting Facilitation |
| empathy | Empathy |
| negotiation | Negotiation |
| presentation | Presentation |

Full taxonomy in `skillsets-taxonomy.json`.

---

## 9. Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Primary purple | `#5a14bd` | Buttons, accents, icons |
| Dark purple | `#2e0a61` | Dark backgrounds |
| Light purple bg | `#f3ecfd` | Cards, quote blocks |
| Pink accent | `#fff5fa` | Badges, author tags |
| Text dark | `#1a1a1a` | Headings |
| Text medium | `#4d4d4d` | Body text |

### Component Styles

| Component | Tailwind Classes |
|-----------|------------------|
| Option cards | `bg-white rounded-2xl border-[6px] border-purple-600/50` |
| Speech bubble | `bg-white/95 backdrop-blur-sm rounded-2xl` |
| Tip card | `bg-purple-600 text-white rounded-xl p-6` |
| Quote block | `bg-purple-50 rounded-xl p-6` |
| Nav buttons | `bg-white rounded-full p-4 shadow-[0px_4px_40px_rgba(0,0,0,0.16)]` |
| Pagination | `bg-black/15 backdrop-blur-md rounded-full px-4 py-2` |

### Shadows

```css
/* Floating elements */
box-shadow: 0px 4px 40px rgba(0, 0, 0, 0.16);
```

---

## Acceptance Criteria

A build is complete when:

- [ ] All 6 activity types create, edit, save, preview correctly
- [ ] Autosave with "Saved • X min ago" indicator works
- [ ] Undo/redo works for content + structure + settings
- [ ] Version history shows draft/published badges
- [ ] Left panel shows correct tools per activity type
- [ ] Right panel shows correct settings per selection
- [ ] Keyboard shortcuts work (Cmd+S, Cmd+Z, Delete, Escape)
- [ ] Validation blocks publish with errors, allows with warnings
- [ ] Skillset/subskill tagging works per rules
- [ ] Activity content matches TypeScript interfaces exactly

---

*Document Version: 1.0*
*Created: January 2025*
