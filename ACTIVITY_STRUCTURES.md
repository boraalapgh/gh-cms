# Activity Content Structures

This document defines the **content templates, elements, and controls** for each activity type. These are the authoring specifications that define what goes inside each activity - not just settings, but the actual content building blocks.

---

## Overview: Lesson Structure

A Lesson contains:
1. **Lesson Overview** (metadata + expert info)
2. **Video** (intro video)
3. **Activity List** (ordered activities)
4. **Recap** (required wrap-up)

```
Lesson
├── Expert Info (avatar, name, credentials)
├── Title & Subtitle
├── Duration estimate
├── "What's in it for me?" (WIIFM)
├── Video Thumbnail + Video
├── Activities (ordered):
│   ├── Quick Dive
│   ├── Daily Dilemma
│   ├── In Practice
│   └── Quiz
└── Recap (required)
```

---

## 1. Quick Dive Activity

**Purpose:** Magazine-style rich content article - "The essence through the eyes of the expert"

### Content Structure

```typescript
interface QuickDiveContent {
  expertImage?: string;          // Expert photo at top
  title: string;                 // Main headline
  blocks: QuickDiveBlock[];      // Ordered content blocks
  estimatedReadingTime?: number; // Auto-calculated
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

### Template Structure

Based on the prototype, a Quick Dive typically contains:

```
1. Expert Avatar (centered)
2. Main Title (H1)
3. Introduction paragraphs (2-3)
4. Section with heading + bullet list
5. Quote block (styled callout with author)
6. Section with heading + paragraphs
7. Grid cards (2-column, numbered)
8. Numbered steps (1-4)
9. Pro Tip card (bottom CTA)
```

### Block Types & Controls

| Block Type | Left Panel Tool | Right Panel Controls |
|------------|-----------------|---------------------|
| Paragraph | `📝 Text` | Font size, alignment |
| Heading | `📝 Heading` | Level (H2/H3), alignment |
| Bullet List | `📋 List` | Bullet style |
| Quote | `💬 Quote` | Author name, style |
| Tip Card | `💡 Tip` | Variant (tip/warning/info), title |
| Numbered Steps | `🔢 Steps` | Add/remove steps, titles |
| Grid Cards | `📦 Cards` | Number of cards (2-4), layout |
| Image | `🖼️ Image` | Upload/URL, alt text, caption |

### Default Template (New Quick Dive)

When creating a new Quick Dive, pre-populate with:

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

---

## 2. Daily Dilemma Activity

**Purpose:** Interactive scenario-based decision activity - "Will you make the right choices?"

### Content Structure

```typescript
interface DailyDilemmaContent {
  screens: DailyDilemmaScreen[];
  expertName: string;
  expertAvatar: string;
  backgroundImage?: string;
  themeColor?: string;  // Purple, teal, green, pink presets
}

type DailyDilemmaScreen =
  | AnecdoteScreen
  | DilemmaScreen
  | FeedbackScreen;

interface AnecdoteScreen {
  id: string;
  type: 'anecdote';
  order: number;
  expertSpeech: string;  // Speech bubble text
}

interface DilemmaScreen {
  id: string;
  type: 'dilemma';
  order: number;
  expertSpeech: string;  // "You have two options for how to respond:"
  options: DailyDilemmaOption[];
}

interface DailyDilemmaOption {
  id: string;
  label: string;        // "A", "B", "C", "D"
  text: string;         // Option description
  isCorrect: boolean;
  feedback: string;     // Shown when this option is selected
}

// Feedback is per-option, shown after selection
// The "feedback screen" displays the selected option's feedback
```

### Screen Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  ANECDOTE 1 → ANECDOTE 2 (optional) → DILEMMA → FEEDBACK        │
│                                                                   │
│  [Expert speech bubble setting up scenario]                      │
│  [Expert speech bubble adding context]                           │
│  [Expert speech + A/B option cards]                              │
│  [Expert feedback based on selection]                            │
└─────────────────────────────────────────────────────────────────┘
```

### Visual Layout

**Anecdote Screen:**
```
┌─────────────────────────────┐
│  [←]                        │
│                             │
│  ┌──────┐                   │
│  │Avatar│                   │
│  └──────┘                   │
│       ┌─────────────────┐   │
│       │  Speech bubble  │   │
│       │  with scenario  │   │
│       │  text...        │   │
│       └─────────────────┘   │
│                             │
│                             │
│  [◀]      1/4       [▶]    │
└─────────────────────────────┘
```

**Dilemma Screen:**
```
┌─────────────────────────────┐
│  [←]                        │
│                             │
│  ┌──────┐                   │
│  │Avatar│                   │
│  └──────┘                   │
│       ┌─────────────────┐   │
│       │ You have two    │   │
│       │ options...      │   │
│       └─────────────────┘   │
│                             │
│    ┌─────┐     ┌─────┐     │
│    │  A  │     │  B  │     │  ← Tilted cards (-9° / +9°)
│    │     │     │     │     │
│    │text │     │text │     │
│    └─────┘     └─────┘     │
│                             │
│  [◀]      3/4       [▶]    │
└─────────────────────────────┘
```

### Left Panel Tools

| Tool | Icon | Description |
|------|------|-------------|
| Anecdote Screen | `💬` | Add context/story screen |
| Dilemma Screen | `❓` | Add decision point with options |
| Option Card | `➕` | Add option to dilemma (A, B, C, D) |

### Left Panel Layers

```
SCREENS
├─ ≡ 💬 Anecdote 1        [🗑]
├─ ≡ 💬 Anecdote 2        [🗑]
├─ ≡ ❓ Dilemma           [🗑]
│   ├─ 🅰️ Option A        [🗑]
│   └─ 🅱️ Option B  ✓     [🗑]  ← Correct marked
└─ (Feedback auto-generated)
```

### Right Panel Controls

**Activity Level:**
- Expert name (text input)
- Expert avatar (image upload/URL)
- Background image (image upload/URL)
- Theme color (4 preset swatches)

**Anecdote Screen Selected:**
- Expert speech (textarea)

**Dilemma Screen Selected:**
- Expert speech (textarea)
- Add Option button

**Option Selected:**
- Option label (A, B, C, D - auto-assigned)
- Option text (textarea)
- ✓ Mark as correct (toggle)
- Feedback text (textarea) - "Shown when learner selects this option"

### Default Template (New Daily Dilemma)

```json
{
  "expertName": "Expert Name",
  "expertAvatar": null,
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

### Validation Rules

- Minimum 1 anecdote + 1 dilemma screen
- Dilemma must have 2-4 options
- Each option must have feedback text
- Exactly 1 option must be marked correct
- Expert speech cannot be empty

---

## 3. In Practice Activity

**Purpose:** Multi-slide practical tips with "Here's how to do it" callouts - "Ready for practice?"

### Content Structure

```typescript
interface InPracticeContent {
  slides: InPracticeSlide[];
  backgroundColor?: string;  // Default: dark purple #2e0a61
}

interface InPracticeSlide {
  id: string;
  order: number;
  number?: number;           // 1, 2, 3... (null for final takeaway)
  title: string;
  content: string;           // Main explanation
  howTo?: string;            // "Here's how to do it" box (optional)
  icon: 'puzzle' | 'lightbulb' | 'target' | 'star';
  isFinal?: boolean;         // Marks the takeaway slide
}
```

### Screen Layout

**Practice Step Slide:**
```
┌─────────────────────────────┐
│  [←]                    [✓] │  ← Check on final
│                             │
│          [Icon]             │
│                             │
│    1. Step Title Here       │
│                             │
│    Main explanation text    │
│    that describes what to   │
│    do and why it matters... │
│                             │
│  ┌─────────────────────────┐│
│  │ Here's how to do it     ││
│  │                         ││
│  │ Specific actionable     ││
│  │ instructions...         ││
│  └─────────────────────────┘│
│                             │
│  [◀]      1/4       [▶]    │
└─────────────────────────────┘
```

**Final Takeaway Slide:**
```
┌─────────────────────────────┐
│  [←]                    [✓] │
│                             │
│        [💡 Lightbulb]       │
│                             │
│    Expert's Take-Away:      │
│                             │
│    "Summary quote from the  │
│    expert wrapping up the   │
│    key learning..."         │
│                             │
│                             │
│  [◀]      4/4       [▶]    │
└─────────────────────────────┘
```

### Left Panel Tools

| Tool | Icon | Description |
|------|------|-------------|
| Practice Step | `🎯` | Add numbered step slide |
| Takeaway | `💡` | Add final summary slide |

### Left Panel Layers

```
SLIDES
├─ ≡ 1. The 3-Second Pause Rule      [🗑]
├─ ≡ 2. The Mirror-Back Method       [🗑]
├─ ≡ 3. The Curiosity Check-In       [🗑]
└─ ≡ 💡 Expert's Take-Away           [🗑]
```

### Right Panel Controls

**Step Slide Selected:**
- Step number (auto-assigned, can override)
- Title (text input)
- Content (textarea)
- "Here's how to do it" (textarea, optional)
- Icon (dropdown: puzzle, lightbulb, target, star)

**Takeaway Slide Selected:**
- Title (text input, default: "Expert's Take-Away:")
- Content (textarea)
- Icon (locked to lightbulb)

### Default Template (New In Practice)

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

### Validation Rules

- Minimum 2 slides (at least 1 step + takeaway)
- Maximum 6 slides recommended
- Each step needs title + content
- Final slide should be marked isFinal

---

## 4. Quiz Activity

**Purpose:** Knowledge assessment with multiple question types

### Content Structure

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
  questionImage?: string;     // Optional image with question
  options: QuizOption[];
  feedback?: {
    correct: string;
    incorrect: string;
  };
}

interface QuizOption {
  id: string;
  text: string;
  image?: string;             // For image_choice type
  isCorrect: boolean;
}

interface QuizSettings {
  passingScore: number;       // 0-100, default 70
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  allowRetry: boolean;
  maxAttempts?: number;
  timeLimit?: number;         // In minutes
}
```

### Left Panel Tools

| Tool | Icon | Description |
|------|------|-------------|
| Multiple Choice | `⚪` | Single correct answer |
| Multi-Select | `☑️` | Multiple correct answers |
| True/False | `⊘` | Binary question |
| Image Choice | `🖼️` | Visual answer options |

### Left Panel Layers

```
QUESTIONS
├─ ≡ 1. ⚪ What is the capital...     [🗑]
├─ ≡ 2. ⊘ True or False: React...   [🗑]
├─ ≡ 3. ☑️ Select all that apply...   [🗑]
└─ ≡ 4. 🖼️ Which image shows...       [🗑]
```

### Right Panel Controls

**Quiz Level (Global Settings tab):**
- Passing score slider (0-100%)
- ☐ Randomize question order
- ☐ Randomize option order
- ☐ Show correct answers after submission
- ☐ Allow retry
- Max attempts (if retry enabled)
- Time limit (optional)

**Question Selected:**
- Question text (textarea)
- Question image (optional upload)
- Options list:
  - Option text
  - ⚪/☑️ Mark as correct
  - [🗑] Delete option
- [+ Add Option] button
- Feedback (correct) (textarea)
- Feedback (incorrect) (textarea)

### Default Template (New Quiz)

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

### Validation Rules

- Minimum 1 question
- Each question needs 2+ options (except true/false)
- At least 1 correct option per question
- Passing score 0-100

---

## 5. Video Activity

**Purpose:** Video introduction from the expert

### Content Structure

```typescript
interface VideoContent {
  videoUrl?: string;
  videoType: 'embed' | 'upload';
  thumbnailUrl?: string;
  description?: string;
  captions?: {
    locale: string;
    vttUrl: string;
  }[];
  transcript?: string;
  chapters?: {
    title: string;
    startTime: number;  // Seconds
  }[];
}
```

### Right Panel Controls

**Video Source:**
- Source type toggle: [Upload] [Embed URL]
- URL input (YouTube, Vimeo, direct)
- Upload button
- Video preview player

**Thumbnail:**
- Thumbnail preview
- [Auto from video] [Upload custom]

**Chapters (optional):**
- Add chapter: title + timestamp

**Captions:**
- Add caption track: language + VTT upload

**Transcript:**
- Transcript textarea (optional)
- [Generate with AI] button

---

## 6. Lesson Overview (Container)

### Content Structure

```typescript
interface LessonContent {
  title: string;
  subtitle: string;
  expertName: string;
  expertAvatar: string;
  expertCredentials?: string;
  expertBio?: string;
  duration: number;              // Minutes
  wiifm?: {                      // What's In It For Me
    headline: string;
    points: string[];
  };
  activities: string[];          // Activity IDs in order
  recap: RecapContent;
}

interface RecapContent {
  celebrationImage?: string;
  title: string;                 // "Great job! You have completed..."
  summary: string;               // Lesson summary
  keyTakeaways?: string[];
}
```

### Right Panel Controls (Lesson Selected)

**Design Tab:**
- Lesson title
- Lesson subtitle
- Duration (minutes)
- Expert section:
  - Name
  - Avatar (upload)
  - Credentials
  - Bio
- WIIFM section:
  - Headline
  - Benefit points (add/remove/reorder)

**Recap Settings:**
- Celebration image (upload)
- Recap title
- Summary text
- Key takeaways (add/remove)

---

## Design System Reference

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Primary purple | `#5a14bd` | Buttons, accents, icons |
| Dark purple | `#2e0a61` | Dark backgrounds (Daily Dilemma, In Practice) |
| Light purple bg | `#f3ecfd` | Cards, quote blocks |
| Pink accent | `#fff5fa` | Badges, author tags |
| Text dark | `#1a1a1a` | Headings |
| Text medium | `#4d4d4d` | Body text |

### Components

| Component | Style |
|-----------|-------|
| Option cards | White, rounded-2xl, border-[6px] border-purple, tilted ±9° |
| Speech bubble | White/95 opacity, rounded-2xl, triangle pointer |
| Tip card | bg-purple text-white, rounded-xl, p-6 |
| Quote block | bg-light-purple, rounded-xl, p-6 |
| Navigation buttons | White circle, shadow, p-4 |
| Pagination pill | Black/15 backdrop-blur, rounded-full |

---

## 7. Podcast Activity

**Purpose:** Audio-based learning with script, chapters, and optional AI-generated audio

### Content Structure

```typescript
interface PodcastContent {
  title: string;
  description?: string;
  coverImage?: string;

  // Audio source
  audioSource: 'upload' | 'generated' | 'url';
  audioUrl?: string;

  // Script for AI generation
  script?: PodcastScript;

  // Structure
  chapters?: PodcastChapter[];
  transcript?: string;

  // Settings
  duration?: number;           // Auto-calculated or manual (seconds)
  voiceId?: string;            // For AI generation
  voiceSpeed?: 'slow' | 'normal' | 'fast';
}

interface PodcastScript {
  locale: string;
  text: string;                // Full script text
  segments?: ScriptSegment[];  // Optional structured segments
}

interface ScriptSegment {
  id: string;
  type: 'intro' | 'main' | 'example' | 'summary' | 'outro';
  speaker?: string;            // For multi-voice podcasts
  text: string;
  order: number;
}

interface PodcastChapter {
  id: string;
  title: string;
  startTime: number;           // Seconds
  description?: string;
}
```

### Visual Layout

**Podcast Player Screen:**
```
┌─────────────────────────────┐
│  [←]                        │
│                             │
│      ┌─────────────────┐    │
│      │                 │    │
│      │   Cover Image   │    │
│      │                 │    │
│      └─────────────────┘    │
│                             │
│    Podcast Episode Title    │
│       by Expert Name        │
│                             │
│  ──●────────────────── 12:34│
│                             │
│     [⏮]  [▶/⏸]  [⏭]       │
│                             │
│  ┌─────────────────────────┐│
│  │ CHAPTERS                ││
│  ├─────────────────────────┤│
│  │ ▶ 00:00 Introduction    ││
│  │   02:30 Main Topic      ││
│  │   08:45 Examples        ││
│  │   12:00 Summary         ││
│  └─────────────────────────┘│
│                             │
│  [📄 View Transcript]       │
└─────────────────────────────┘
```

**Editor View (Script Mode):**
```
┌─────────────────────────────┐
│  [←]              [🔊 Preview]│
│                             │
│  SCRIPT                     │
│  ┌─────────────────────────┐│
│  │ Welcome to today's      ││
│  │ episode where we'll     ││
│  │ explore active          ││
│  │ listening techniques... ││
│  │                         ││
│  │ [Continue typing...]    ││
│  └─────────────────────────┘│
│                             │
│  Word count: 1,247          │
│  Est. duration: ~8 min      │
│                             │
│  ┌─────────────────────────┐│
│  │ [✨ Generate Audio]     ││
│  │                         ││
│  │ Voice: Sofia (Female)   ││
│  │ Speed: Normal           ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Left Panel Tools

| Tool | Icon | Description |
|------|------|-------------|
| Upload Audio | `📤` | Upload MP3, WAV, M4A |
| Script Editor | `📝` | Write script for AI generation |
| Add Chapter | `📑` | Add chapter marker |

### Left Panel Layers

```
PODCAST CONTENT
├─ 🎵 Audio Source
│   └─ Generated from script (8:42)
├─ 📑 CHAPTERS
│   ├─ ≡ 00:00 Introduction        [🗑]
│   ├─ ≡ 02:30 The Core Concept    [🗑]
│   ├─ ≡ 05:15 Real-World Example  [🗑]
│   └─ ≡ 08:00 Key Takeaways       [🗑]
└─ 📄 Transcript
```

### Right Panel Controls

**Audio Source Section:**
- Source type: [Upload] [Generate from Script] [URL]
- If Upload: File picker + audio preview
- If Generate: Script editor + voice selection
- If URL: URL input + validation

**Script Editor (if generating):**
- Script textarea (full width, expandable)
- Word count display
- Estimated duration (150 words ≈ 1 minute)
- Voice selection dropdown:
  - Sofia (Female, Warm)
  - Marcus (Male, Professional)
  - Elena (Female, Energetic)
  - James (Male, Calm)
- Speed: Slow / Normal / Fast
- [✨ Generate Audio] button
- [🔊 Preview] button (plays first 30 seconds)

**Chapters Section:**
- Chapter list (add/remove/reorder)
- Per chapter:
  - Title (text input)
  - Start time (MM:SS picker)
  - Description (optional)

**Transcript Section:**
- Transcript textarea
- [Auto-generate from audio] button
- [Auto-generate from script] button

**Cover Image:**
- Image upload/URL
- Preview

### Default Template (New Podcast)

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

### Validation Rules

- Must have either: uploaded audio OR script (for generation) OR valid URL
- If generating: script minimum 100 words
- Chapters must have titles
- Chapter start times must be in order
- Cover image recommended but optional

### AI Generation Flow

1. Author writes/pastes script
2. Selects voice and speed
3. Clicks "Generate Audio"
4. System calls AI TTS API
5. Progress indicator shows generation status
6. On complete: audio URL saved, duration calculated
7. Author can preview and regenerate if needed
8. Transcript auto-populated from script

---

## Component Implementation Examples

### Daily Dilemma Components

**Store Types** (`src/types/daily-dilemma.ts`):

```typescript
// Selection state for Daily Dilemma editor
export type DailyDilemmaSelection =
  | { type: 'activity' }
  | { type: 'screen'; screenId: string }
  | { type: 'option'; screenId: string; optionId: string }
  | { type: 'speechBubble'; screenId: string };

// Content structure
export interface DailyDilemmaContent {
  screens: DailyDilemmaScreen[];
  expertName: string;
  expertAvatar?: string;
  backgroundImage?: string;
  themeColor: string;
}

export type DailyDilemmaScreen = AnecdoteScreen | DilemmaScreen;

export interface AnecdoteScreen {
  id: string;
  type: 'anecdote';
  order: number;
  expertSpeech: string;
}

export interface DilemmaScreen {
  id: string;
  type: 'dilemma';
  order: number;
  expertSpeech: string;
  options: DailyDilemmaOption[];
}

export interface DailyDilemmaOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}
```

**Left Panel Component** (`src/components/editor/DailyDilemmaLeftPanel.tsx`):

```typescript
import { Plus, MessageSquare, HelpCircle, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';

interface Props {
  content: DailyDilemmaContent;
  selection: DailyDilemmaSelection;
  onSelect: (selection: DailyDilemmaSelection) => void;
  onAddScreen: (type: 'anecdote' | 'dilemma') => void;
  onAddOption: (screenId: string) => void;
  onDeleteScreen: (screenId: string) => void;
  onDeleteOption: (screenId: string, optionId: string) => void;
  onReorderScreens: (screens: DailyDilemmaScreen[]) => void;
}

export function DailyDilemmaLeftPanel({
  content,
  selection,
  onSelect,
  onAddScreen,
  onAddOption,
  onDeleteScreen,
  onDeleteOption,
  onReorderScreens,
}: Props) {
  const selectedDilemmaScreen = content.screens.find(
    s => s.type === 'dilemma' && selection.type === 'screen' && selection.screenId === s.id
  );

  return (
    <div className="flex flex-col h-full">
      {/* Tools Section */}
      <div className="p-4 border-b">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">
          Add Screens
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => onAddScreen('anecdote')}
            className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-zinc-100 text-sm"
          >
            <MessageSquare size={16} className="text-zinc-500" />
            <span>Anecdote Screen</span>
            <Plus size={14} className="ml-auto text-zinc-400" />
          </button>
          <button
            onClick={() => onAddScreen('dilemma')}
            className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-zinc-100 text-sm"
          >
            <HelpCircle size={16} className="text-zinc-500" />
            <span>Dilemma Screen</span>
            <Plus size={14} className="ml-auto text-zinc-400" />
          </button>
          {selectedDilemmaScreen && (
            <button
              onClick={() => onAddOption(selectedDilemmaScreen.id)}
              className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-zinc-100 text-sm"
            >
              <Plus size={16} className="text-zinc-500" />
              <span>Add Option Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Layers Section */}
      <div className="flex-1 overflow-auto p-4">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">
          Screens ({content.screens.length})
        </h3>
        <div className="space-y-1">
          {content.screens.map((screen) => (
            <ScreenLayer
              key={screen.id}
              screen={screen}
              isSelected={selection.type === 'screen' && selection.screenId === screen.id}
              selection={selection}
              onSelect={onSelect}
              onDelete={() => onDeleteScreen(screen.id)}
              onDeleteOption={(optionId) => onDeleteOption(screen.id, optionId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenLayer({ screen, isSelected, selection, onSelect, onDelete, onDeleteOption }) {
  const isDilemma = screen.type === 'dilemma';

  return (
    <div>
      <button
        onClick={() => onSelect({ type: 'screen', screenId: screen.id })}
        className={`flex items-center gap-2 w-full p-2 rounded-lg text-sm ${
          isSelected ? 'bg-zinc-100' : 'hover:bg-zinc-50'
        }`}
      >
        <span className="text-zinc-400">≡</span>
        {isDilemma ? (
          <HelpCircle size={14} className="text-purple-500" />
        ) : (
          <MessageSquare size={14} className="text-blue-500" />
        )}
        <span className="truncate flex-1 text-left">
          {screen.expertSpeech.slice(0, 30)}...
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200 rounded"
        >
          <Trash2 size={14} className="text-zinc-400" />
        </button>
      </button>

      {/* Nested options for dilemma screens */}
      {isDilemma && screen.options && (
        <div className="ml-6 mt-1 space-y-1">
          {screen.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect({ type: 'option', screenId: screen.id, optionId: option.id })}
              className={`flex items-center gap-2 w-full p-2 rounded-lg text-sm ${
                selection.type === 'option' && selection.optionId === option.id
                  ? 'bg-zinc-100'
                  : 'hover:bg-zinc-50'
              }`}
            >
              <span className="w-5 h-5 rounded bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center">
                {option.label}
              </span>
              <span className="truncate flex-1 text-left text-zinc-600">
                {option.text.slice(0, 25)}...
              </span>
              {option.isCorrect && (
                <span className="text-green-500">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Right Panel Component** (`src/components/editor/DailyDilemmaRightPanel.tsx`):

```typescript
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Props {
  content: DailyDilemmaContent;
  selection: DailyDilemmaSelection;
  onChange: (updates: Partial<DailyDilemmaContent>) => void;
  onUpdateScreen: (screenId: string, updates: Partial<DailyDilemmaScreen>) => void;
  onUpdateOption: (screenId: string, optionId: string, updates: Partial<DailyDilemmaOption>) => void;
}

export function DailyDilemmaRightPanel({
  content,
  selection,
  onChange,
  onUpdateScreen,
  onUpdateOption,
}: Props) {
  // Activity-level settings
  if (selection.type === 'activity') {
    return (
      <div className="p-4 space-y-6">
        <div>
          <Label>Expert Name</Label>
          <Input
            value={content.expertName}
            onChange={(e) => onChange({ expertName: e.target.value })}
            placeholder="Sofia Rossi"
          />
        </div>

        <div>
          <Label>Expert Avatar</Label>
          <ImageUpload
            value={content.expertAvatar}
            onChange={(url) => onChange({ expertAvatar: url })}
          />
        </div>

        <div>
          <Label>Background Image</Label>
          <ImageUpload
            value={content.backgroundImage}
            onChange={(url) => onChange({ backgroundImage: url })}
          />
        </div>

        <div>
          <Label>Theme Color</Label>
          <div className="flex gap-2 mt-2">
            {['#2e0a61', '#0d9488', '#059669', '#db2777'].map((color) => (
              <button
                key={color}
                onClick={() => onChange({ themeColor: color })}
                className={`w-8 h-8 rounded-full ${
                  content.themeColor === color ? 'ring-2 ring-offset-2 ring-black' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Screen-level settings
  if (selection.type === 'screen') {
    const screen = content.screens.find(s => s.id === selection.screenId);
    if (!screen) return null;

    return (
      <div className="p-4 space-y-6">
        <div>
          <Label>Screen Type</Label>
          <div className="flex gap-2 mt-2">
            <button
              className={`px-3 py-1 rounded ${screen.type === 'anecdote' ? 'bg-zinc-900 text-white' : 'bg-zinc-100'}`}
            >
              Anecdote
            </button>
            <button
              className={`px-3 py-1 rounded ${screen.type === 'dilemma' ? 'bg-zinc-900 text-white' : 'bg-zinc-100'}`}
            >
              Dilemma
            </button>
          </div>
        </div>

        <div>
          <Label>Expert Speech</Label>
          <Textarea
            value={screen.expertSpeech}
            onChange={(e) => onUpdateScreen(screen.id, { expertSpeech: e.target.value })}
            placeholder="Enter what the expert says..."
            rows={5}
          />
        </div>
      </div>
    );
  }

  // Option-level settings
  if (selection.type === 'option') {
    const screen = content.screens.find(s => s.id === selection.screenId) as DilemmaScreen;
    const option = screen?.options.find(o => o.id === selection.optionId);
    if (!option) return null;

    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-2 p-3 bg-zinc-100 rounded-lg">
          <span className="w-8 h-8 rounded bg-purple-600 text-white font-bold flex items-center justify-center">
            {option.label}
          </span>
          <span className="font-medium">Option {option.label}</span>
        </div>

        <div>
          <Label>Option Text</Label>
          <Textarea
            value={option.text}
            onChange={(e) => onUpdateOption(screen.id, option.id, { text: e.target.value })}
            placeholder="Enter the option description..."
            rows={4}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Mark as Correct Answer</Label>
          <Switch
            checked={option.isCorrect}
            onCheckedChange={(checked) => onUpdateOption(screen.id, option.id, { isCorrect: checked })}
          />
        </div>

        <div>
          <Label>Feedback (shown when selected)</Label>
          <Textarea
            value={option.feedback}
            onChange={(e) => onUpdateOption(screen.id, option.id, { feedback: e.target.value })}
            placeholder="Enter feedback for this choice..."
            rows={4}
          />
          <p className="text-xs text-zinc-500 mt-1">
            This text appears after the learner selects this option.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
```

**Preview Component** (`src/components/editor/DailyDilemmaPreview.tsx`):

```typescript
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  content: DailyDilemmaContent;
  selection: DailyDilemmaSelection;
  onSelectScreen: (screenId: string) => void;
  onSelectOption: (screenId: string, optionId: string) => void;
}

export function DailyDilemmaPreview({
  content,
  selection,
  onSelectScreen,
  onSelectOption,
}: Props) {
  const [previewSlide, setPreviewSlide] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentScreen = content.screens[previewSlide];
  const isAnecdote = currentScreen?.type === 'anecdote';
  const isDilemma = currentScreen?.type === 'dilemma';

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: content.themeColor || '#2e0a61' }}
    >
      {/* Background */}
      {content.backgroundImage && (
        <div className="absolute inset-0 opacity-70">
          <img src={content.backgroundImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex-1 flex flex-col pt-28 px-6 z-10">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full border-[6px] border-white overflow-hidden shadow-lg mb-8">
          {content.expertAvatar ? (
            <img src={content.expertAvatar} alt={content.expertName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-300" />
          )}
        </div>

        {/* Speech Bubble */}
        <div
          className="relative max-w-[315px] cursor-pointer"
          onClick={() => currentScreen && onSelectScreen(currentScreen.id)}
        >
          <div className="absolute -top-5 left-6 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[20px] border-b-white/95" />
          <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 ${
            selection.type === 'screen' && selection.screenId === currentScreen?.id
              ? 'ring-2 ring-black'
              : ''
          }`}>
            <p className="text-sm text-zinc-900 leading-relaxed">
              {currentScreen?.expertSpeech || 'Expert speech...'}
            </p>
          </div>
        </div>

        {/* Option Cards (Dilemma only) */}
        {isDilemma && currentScreen.options && (
          <div className="flex-1 flex items-center justify-center -mx-6 overflow-visible">
            <div className="relative flex items-center justify-center w-full">
              {currentScreen.options.map((option, index) => {
                const isA = index === 0;
                const rotation = isA ? '-rotate-[9deg]' : 'rotate-[9deg]';
                const position = isA ? 'left-4' : 'right-4';
                const isSelected = selection.type === 'option' && selection.optionId === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => onSelectOption(currentScreen.id, option.id)}
                    className={`absolute ${position} transform ${rotation} transition-all duration-200 ${
                      isSelected ? 'scale-105 z-10' : 'hover:scale-102'
                    }`}
                  >
                    <div className={`w-[165px] h-[268px] bg-white rounded-2xl p-6 shadow-[0px_4px_40px_rgba(0,0,0,0.16)] border-[6px] ${
                      isSelected ? 'border-black' : 'border-purple-600/50'
                    }`}>
                      <p className="font-extrabold text-4xl text-purple-600 mb-2">
                        {option.label}
                      </p>
                      <p className="text-xs text-zinc-900 leading-relaxed tracking-wide">
                        {option.text || 'Option text...'}
                      </p>
                      {option.isCorrect && (
                        <span className="absolute top-2 right-2 text-green-500">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="relative z-20 flex items-center justify-between px-6 pb-4">
        <button
          onClick={() => setPreviewSlide(s => Math.max(0, s - 1))}
          disabled={previewSlide === 0}
          className="bg-white rounded-full p-4 shadow disabled:opacity-40"
        >
          <ChevronLeft size={24} className="text-purple-600" />
        </button>

        <div className="bg-black/15 backdrop-blur-md rounded-full px-4 py-2">
          <span className="text-xs font-medium text-white">
            {previewSlide + 1}/{content.screens.length}
          </span>
        </div>

        <button
          onClick={() => setPreviewSlide(s => Math.min(content.screens.length - 1, s + 1))}
          disabled={previewSlide === content.screens.length - 1}
          className="bg-white rounded-full p-4 shadow disabled:opacity-40"
        >
          <ChevronRight size={24} className="text-purple-600" />
        </button>
      </div>
    </div>
  );
}
```

---

### Quick Dive Block Components

**Block Registry** (`src/components/blocks/quick-dive/index.ts`):

```typescript
import { TextBlock } from './TextBlock';
import { HeadingBlock } from './HeadingBlock';
import { BulletListBlock } from './BulletListBlock';
import { QuoteBlock } from './QuoteBlock';
import { TipCardBlock } from './TipCardBlock';
import { NumberedStepsBlock } from './NumberedStepsBlock';
import { GridCardsBlock } from './GridCardsBlock';

export const QuickDiveBlockRegistry = {
  paragraph: TextBlock,
  heading: HeadingBlock,
  bulletList: BulletListBlock,
  quote: QuoteBlock,
  tipCard: TipCardBlock,
  numberedSteps: NumberedStepsBlock,
  gridCards: GridCardsBlock,
};

export const QuickDiveBlockTools = [
  { type: 'paragraph', label: 'Text', icon: 'Type' },
  { type: 'heading', label: 'Heading', icon: 'Heading' },
  { type: 'bulletList', label: 'Bullet List', icon: 'List' },
  { type: 'quote', label: 'Quote', icon: 'Quote' },
  { type: 'tipCard', label: 'Tip Card', icon: 'Lightbulb' },
  { type: 'numberedSteps', label: 'Steps', icon: 'ListOrdered' },
  { type: 'gridCards', label: 'Cards', icon: 'LayoutGrid' },
];
```

**Quote Block Example** (`src/components/blocks/quick-dive/QuoteBlock.tsx`):

```typescript
interface QuoteBlockProps {
  content: { text: string; author?: string };
  isSelected: boolean;
  onSelect: () => void;
  onChange: (content: { text: string; author?: string }) => void;
}

// Renderer (Center Panel)
export function QuoteBlockRenderer({ content, isSelected, onSelect }: QuoteBlockProps) {
  return (
    <div
      onClick={onSelect}
      className={`bg-purple-50 rounded-xl p-6 cursor-pointer ${
        isSelected ? 'ring-2 ring-black' : 'hover:ring-1 hover:ring-zinc-300'
      }`}
    >
      <p className="text-lg font-extrabold text-purple-900 leading-relaxed mb-4">
        {content.text || 'Quote text...'}
      </p>
      {content.author && (
        <p className="text-sm text-zinc-600">— {content.author}</p>
      )}
    </div>
  );
}

// Settings (Right Panel)
export function QuoteBlockSettings({ content, onChange }: QuoteBlockProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Quote Text</Label>
        <Textarea
          value={content.text}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          placeholder="Enter the quote..."
          rows={4}
        />
      </div>
      <div>
        <Label>Author (optional)</Label>
        <Input
          value={content.author || ''}
          onChange={(e) => onChange({ ...content, author: e.target.value })}
          placeholder="Author name"
        />
      </div>
    </div>
  );
}
```

**Tip Card Block Example** (`src/components/blocks/quick-dive/TipCardBlock.tsx`):

```typescript
interface TipCardContent {
  title?: string;
  text: string;
  variant: 'tip' | 'warning' | 'info';
}

const variantStyles = {
  tip: 'bg-purple-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-500 text-white',
};

export function TipCardRenderer({ content, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-xl p-6 ${variantStyles[content.variant]} ${
        isSelected ? 'ring-2 ring-black ring-offset-2' : ''
      }`}
    >
      {content.title && (
        <p className="font-bold mb-2">{content.title}</p>
      )}
      <p className="text-sm leading-relaxed opacity-90">
        {content.text || 'Tip content...'}
      </p>
    </div>
  );
}

export function TipCardSettings({ content, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Variant</Label>
        <div className="flex gap-2 mt-2">
          {['tip', 'warning', 'info'].map((variant) => (
            <button
              key={variant}
              onClick={() => onChange({ ...content, variant })}
              className={`px-3 py-1 rounded capitalize ${
                content.variant === variant
                  ? variantStyles[variant]
                  : 'bg-zinc-100'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Title (optional)</Label>
        <Input
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="Pro tip"
        />
      </div>
      <div>
        <Label>Content</Label>
        <Textarea
          value={content.text}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}
```

---

## Implementation Priority

1. **Daily Dilemma** - Most complex, needs screen/option management
2. **Quick Dive** - Block-based, needs multiple block types
3. **In Practice** - Slide-based, moderate complexity
4. **Quiz** - Question management + settings
5. **Video** - Simplest, mostly media handling
6. **Podcast** - AI integration for audio generation

---

*Document Version: 1.1*
*Updated: January 2025*
*Added: Podcast activity, component examples*
