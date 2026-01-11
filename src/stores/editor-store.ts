/**
 * Editor Store
 *
 * Zustand store for managing editor state including blocks, selection,
 * and undo/redo history. Uses immer for immutable state updates.
 */

"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  Block,
  BlockType,
  DeviceType,
  ActivityConfig,
  ActivityType,
  defaultActivityConfigs,
  LessonConfig,
  defaultLessonConfig,
  LessonActivityRef,
  CourseConfig,
  defaultCourseConfig,
  CourseModule,
  AssessmentConfig,
  defaultAssessmentConfig,
  AssessmentSection,
} from "@/types";

// History entry for undo/redo
interface HistoryEntry {
  blocks: Block[];
  timestamp: number;
}

// Editor state interface
interface EditorState {
  // Entity info
  entityId: string | null;
  entityType: string | null;
  activityType: ActivityType | null;
  activityConfig: ActivityConfig | null;

  // Lesson-specific state
  lessonConfig: LessonConfig | null;
  lessonActivities: LessonActivityRef[];

  // Course-specific state
  courseConfig: CourseConfig | null;
  courseModules: CourseModule[];

  // Assessment-specific state
  assessmentConfig: AssessmentConfig | null;

  // Blocks
  blocks: Block[];

  // Selection
  selectedBlockId: string | null;
  hoveredBlockId: string | null;

  // UI state
  devicePreview: DeviceType;
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  rightPanelTab: "element" | "global" | "versions";

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;

  // Loading states
  isSaving: boolean;
  isDirty: boolean;
}

// Editor actions interface
interface EditorActions {
  // Entity
  setEntity: (entityId: string, entityType: string, activityType?: ActivityType) => void;
  setActivityConfig: (config: Partial<ActivityConfig>) => void;

  // Lesson actions
  setLessonConfig: (config: Partial<LessonConfig>) => void;
  setLessonActivities: (activities: LessonActivityRef[]) => void;
  addLessonActivity: (activity: LessonActivityRef) => void;
  removeLessonActivity: (activityId: string) => void;
  reorderLessonActivities: (fromIndex: number, toIndex: number) => void;

  // Course actions
  setCourseConfig: (config: Partial<CourseConfig>) => void;
  setCourseModules: (modules: CourseModule[]) => void;
  addCourseModule: (module?: Partial<CourseModule>) => CourseModule;
  updateCourseModule: (moduleId: string, updates: Partial<CourseModule>) => void;
  removeCourseModule: (moduleId: string) => void;
  reorderCourseModules: (fromIndex: number, toIndex: number) => void;
  addLessonToModule: (moduleId: string, lessonId: string) => void;
  removeLessonFromModule: (moduleId: string, lessonId: string) => void;

  // Assessment actions
  setAssessmentConfig: (config: Partial<AssessmentConfig>) => void;
  addAssessmentSection: (section?: Partial<AssessmentSection>) => AssessmentSection;
  updateAssessmentSection: (sectionId: string, updates: Partial<AssessmentSection>) => void;
  removeAssessmentSection: (sectionId: string) => void;
  reorderAssessmentSections: (fromIndex: number, toIndex: number) => void;

  // Blocks
  setBlocks: (blocks: Block[]) => void;
  loadBlocks: (entityId: string) => Promise<void>;
  addBlock: (type: BlockType, parentId?: string | null, index?: number) => Block;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (id: string, newOrder: number, newParentId?: string | null) => void;
  reorderBlocks: (reorderedBlocks: { id: string; order: number; parentId?: string | null }[]) => void;

  // Selection
  selectBlock: (id: string | null) => void;
  setHoveredBlock: (id: string | null) => void;

  // UI
  setDevicePreview: (device: DeviceType) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setRightPanelTab: (tab: "element" | "global" | "versions") => void;

  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Persistence
  setIsSaving: (isSaving: boolean) => void;
  markDirty: () => void;
  markClean: () => void;

  // Reset
  reset: () => void;
}

// Generate unique ID
const generateId = () => crypto.randomUUID();

// Default block content by type
const getDefaultContent = (type: BlockType): Record<string, unknown> => {
  switch (type) {
    case "text":
      return { text: "Enter text here...", format: "plain" };
    case "heading":
      return { text: "Heading", level: 2 };
    case "image":
      return { url: "", alt: "", caption: "" };
    case "video":
      return { url: "", autoplay: false, controls: true, loop: false };
    case "quiz_question":
      return { question: "", points: 1, explanation: "" };
    case "option":
      return { label: "Option", isCorrect: false, feedback: "" };
    case "card":
      return { title: "", backgroundColor: "" };
    case "callout":
      return { text: "", variant: "info" };
    case "list":
      return { items: [], ordered: false };
    case "two_column":
      return { leftTitle: "Left Column", rightTitle: "Right Column", splitRatio: 0.5 };
    case "divider":
      return {};
    case "section":
      return { title: "" };
    case "slide":
      return {};
    case "slide_deck":
      return {};
    case "card_group":
      return {};
    case "transcript":
      return { text: "", source: "manual", isCollapsible: true, defaultExpanded: true };
    default:
      return {};
  }
};

// Initial state
const initialState: EditorState = {
  entityId: null,
  entityType: null,
  activityType: null,
  activityConfig: null,
  lessonConfig: null,
  lessonActivities: [],
  courseConfig: null,
  courseModules: [],
  assessmentConfig: null,
  blocks: [],
  selectedBlockId: null,
  hoveredBlockId: null,
  devicePreview: "desktop",
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  rightPanelTab: "element",
  history: [],
  historyIndex: -1,
  isSaving: false,
  isDirty: false,
};

// Create the store
export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set, get) => ({
    ...initialState,

    // Entity
    setEntity: (entityId, entityType, activityType) => {
      set((state) => {
        state.entityId = entityId;
        state.entityType = entityType;
        state.activityType = activityType || null;
        state.activityConfig = activityType ? { ...defaultActivityConfigs[activityType] } : null;
        // Initialize lesson config if entity is a lesson
        state.lessonConfig = entityType === "lesson" ? { ...defaultLessonConfig } : null;
        state.lessonActivities = [];
        // Initialize course config if entity is a course
        state.courseConfig = entityType === "course" ? { ...defaultCourseConfig } : null;
        state.courseModules = [];
        // Initialize assessment config if entity is an assessment
        state.assessmentConfig = entityType === "assessment" ? { ...defaultAssessmentConfig } : null;
      });
    },

    setActivityConfig: (config) => {
      set((state) => {
        if (state.activityConfig) {
          state.activityConfig = { ...state.activityConfig, ...config } as ActivityConfig;
          state.isDirty = true;
        }
      });
    },

    // Lesson actions
    setLessonConfig: (config) => {
      set((state) => {
        if (state.lessonConfig) {
          state.lessonConfig = { ...state.lessonConfig, ...config } as LessonConfig;
          state.isDirty = true;
        }
      });
    },

    setLessonActivities: (activities) => {
      set((state) => {
        state.lessonActivities = activities;
      });
    },

    addLessonActivity: (activity) => {
      set((state) => {
        // Set order to be at the end
        const maxOrder = state.lessonActivities.reduce((max, a) => Math.max(max, a.order), -1);
        state.lessonActivities.push({ ...activity, order: maxOrder + 1 });
        state.isDirty = true;
      });
    },

    removeLessonActivity: (activityId) => {
      set((state) => {
        state.lessonActivities = state.lessonActivities.filter((a) => a.id !== activityId);
        // Reorder remaining activities
        state.lessonActivities.forEach((a, index) => {
          a.order = index;
        });
        state.isDirty = true;
      });
    },

    reorderLessonActivities: (fromIndex, toIndex) => {
      set((state) => {
        const activities = [...state.lessonActivities].sort((a, b) => a.order - b.order);
        const [moved] = activities.splice(fromIndex, 1);
        activities.splice(toIndex, 0, moved);
        activities.forEach((a, index) => {
          a.order = index;
        });
        state.lessonActivities = activities;
        state.isDirty = true;
      });
    },

    // Course actions
    setCourseConfig: (config) => {
      set((state) => {
        if (state.courseConfig) {
          state.courseConfig = { ...state.courseConfig, ...config } as CourseConfig;
          state.isDirty = true;
        }
      });
    },

    setCourseModules: (modules) => {
      set((state) => {
        state.courseModules = modules;
      });
    },

    addCourseModule: (moduleOverrides) => {
      const maxOrder = get().courseModules.reduce((max, m) => Math.max(max, m.order), -1);
      const newModule: CourseModule = {
        id: generateId(),
        title: "New Module",
        description: "",
        lessonIds: [],
        order: maxOrder + 1,
        isRequired: true,
        skipThreshold: undefined,
        ...moduleOverrides,
      };

      set((state) => {
        state.courseModules.push(newModule);
        state.isDirty = true;
      });

      return newModule;
    },

    updateCourseModule: (moduleId, updates) => {
      set((state) => {
        const module = state.courseModules.find((m) => m.id === moduleId);
        if (module) {
          Object.assign(module, updates);
          state.isDirty = true;
        }
      });
    },

    removeCourseModule: (moduleId) => {
      set((state) => {
        state.courseModules = state.courseModules.filter((m) => m.id !== moduleId);
        // Reorder remaining modules
        state.courseModules
          .sort((a, b) => a.order - b.order)
          .forEach((m, index) => {
            m.order = index;
          });
        state.isDirty = true;
      });
    },

    reorderCourseModules: (fromIndex, toIndex) => {
      set((state) => {
        const modules = [...state.courseModules].sort((a, b) => a.order - b.order);
        const [moved] = modules.splice(fromIndex, 1);
        modules.splice(toIndex, 0, moved);
        modules.forEach((m, index) => {
          m.order = index;
        });
        state.courseModules = modules;
        state.isDirty = true;
      });
    },

    addLessonToModule: (moduleId, lessonId) => {
      set((state) => {
        const module = state.courseModules.find((m) => m.id === moduleId);
        if (module && !module.lessonIds.includes(lessonId)) {
          module.lessonIds.push(lessonId);
          state.isDirty = true;
        }
      });
    },

    removeLessonFromModule: (moduleId, lessonId) => {
      set((state) => {
        const module = state.courseModules.find((m) => m.id === moduleId);
        if (module) {
          module.lessonIds = module.lessonIds.filter((id) => id !== lessonId);
          state.isDirty = true;
        }
      });
    },

    // Assessment actions
    setAssessmentConfig: (config) => {
      set((state) => {
        if (state.assessmentConfig) {
          state.assessmentConfig = { ...state.assessmentConfig, ...config } as AssessmentConfig;
          state.isDirty = true;
        }
      });
    },

    addAssessmentSection: (sectionOverrides) => {
      const sections = get().assessmentConfig?.sections || [];
      const maxOrder = sections.reduce((max, s) => Math.max(max, s.order), -1);
      const newSection: AssessmentSection = {
        id: generateId(),
        title: "New Section",
        description: "",
        questionIds: [],
        points: 0,
        timeLimit: undefined,
        order: maxOrder + 1,
        ...sectionOverrides,
      };

      set((state) => {
        if (state.assessmentConfig) {
          state.assessmentConfig.sections.push(newSection);
          state.isDirty = true;
        }
      });

      return newSection;
    },

    updateAssessmentSection: (sectionId, updates) => {
      set((state) => {
        if (state.assessmentConfig) {
          const section = state.assessmentConfig.sections.find((s) => s.id === sectionId);
          if (section) {
            Object.assign(section, updates);
            state.isDirty = true;
          }
        }
      });
    },

    removeAssessmentSection: (sectionId) => {
      set((state) => {
        if (state.assessmentConfig) {
          state.assessmentConfig.sections = state.assessmentConfig.sections.filter((s) => s.id !== sectionId);
          // Reorder remaining sections
          state.assessmentConfig.sections
            .sort((a, b) => a.order - b.order)
            .forEach((s, index) => {
              s.order = index;
            });
          state.isDirty = true;
        }
      });
    },

    reorderAssessmentSections: (fromIndex, toIndex) => {
      set((state) => {
        if (state.assessmentConfig) {
          const sections = [...state.assessmentConfig.sections].sort((a, b) => a.order - b.order);
          const [moved] = sections.splice(fromIndex, 1);
          sections.splice(toIndex, 0, moved);
          sections.forEach((s, index) => {
            s.order = index;
          });
          state.assessmentConfig.sections = sections;
          state.isDirty = true;
        }
      });
    },

    // Blocks
    setBlocks: (blocks) => {
      set((state) => {
        state.blocks = blocks;
        state.isDirty = false;
      });
      get().saveToHistory();
    },

    loadBlocks: async (entityId) => {
      try {
        const response = await fetch(`/api/blocks?entityId=${entityId}`);
        const result = await response.json();
        if (result.data) {
          get().setBlocks(result.data);
        }
      } catch (error) {
        console.error("Failed to load blocks:", error);
      }
    },

    addBlock: (type, parentId = null, index) => {
      const newBlock: Block = {
        id: generateId(),
        type,
        content: getDefaultContent(type),
        settings: {},
        parentId,
        order: index ?? get().blocks.length,
      };

      set((state) => {
        if (index !== undefined) {
          // Shift orders of blocks after insert point
          state.blocks.forEach((block) => {
            if (block.parentId === parentId && block.order >= index) {
              block.order += 1;
            }
          });
        }
        state.blocks.push(newBlock);
        state.isDirty = true;
      });

      get().saveToHistory();
      return newBlock;
    },

    updateBlock: (id, updates) => {
      set((state) => {
        const block = state.blocks.find((b) => b.id === id);
        if (block) {
          Object.assign(block, updates);
          state.isDirty = true;
        }
      });
      get().saveToHistory();
    },

    deleteBlock: (id) => {
      set((state) => {
        // Also delete children
        const idsToDelete = new Set<string>([id]);
        const findChildren = (parentId: string) => {
          state.blocks.forEach((b) => {
            if (b.parentId === parentId) {
              idsToDelete.add(b.id);
              findChildren(b.id);
            }
          });
        };
        findChildren(id);

        state.blocks = state.blocks.filter((b) => !idsToDelete.has(b.id));
        if (state.selectedBlockId && idsToDelete.has(state.selectedBlockId)) {
          state.selectedBlockId = null;
        }
        state.isDirty = true;
      });
      get().saveToHistory();
    },

    moveBlock: (id, newOrder, newParentId) => {
      set((state) => {
        const block = state.blocks.find((b) => b.id === id);
        if (block) {
          block.order = newOrder;
          if (newParentId !== undefined) {
            block.parentId = newParentId;
          }
          state.isDirty = true;
        }
      });
      get().saveToHistory();
    },

    reorderBlocks: (reorderedBlocks) => {
      set((state) => {
        reorderedBlocks.forEach(({ id, order, parentId }) => {
          const block = state.blocks.find((b) => b.id === id);
          if (block) {
            block.order = order;
            if (parentId !== undefined) {
              block.parentId = parentId;
            }
          }
        });
        state.isDirty = true;
      });
      get().saveToHistory();
    },

    // Selection
    selectBlock: (id) => {
      set((state) => {
        state.selectedBlockId = id;
        if (id) {
          state.rightPanelTab = "element";
        }
      });
    },

    setHoveredBlock: (id) => {
      set((state) => {
        state.hoveredBlockId = id;
      });
    },

    // UI
    setDevicePreview: (device) => {
      set((state) => {
        state.devicePreview = device;
      });
    },

    toggleLeftPanel: () => {
      set((state) => {
        state.leftPanelCollapsed = !state.leftPanelCollapsed;
      });
    },

    toggleRightPanel: () => {
      set((state) => {
        state.rightPanelCollapsed = !state.rightPanelCollapsed;
      });
    },

    setRightPanelTab: (tab) => {
      set((state) => {
        state.rightPanelTab = tab;
      });
    },

    // History
    saveToHistory: () => {
      const { blocks, history, historyIndex } = get();
      const entry: HistoryEntry = {
        blocks: JSON.parse(JSON.stringify(blocks)),
        timestamp: Date.now(),
      };

      set((state) => {
        // Remove future history if we're not at the end
        state.history = state.history.slice(0, historyIndex + 1);
        state.history.push(entry);
        state.historyIndex = state.history.length - 1;

        // Limit history size
        if (state.history.length > 50) {
          state.history.shift();
          state.historyIndex -= 1;
        }
      });
    },

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex > 0) {
        set((state) => {
          state.historyIndex -= 1;
          state.blocks = JSON.parse(JSON.stringify(history[historyIndex - 1].blocks));
          state.isDirty = true;
        });
      }
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex < history.length - 1) {
        set((state) => {
          state.historyIndex += 1;
          state.blocks = JSON.parse(JSON.stringify(history[historyIndex + 1].blocks));
          state.isDirty = true;
        });
      }
    },

    // Persistence
    setIsSaving: (isSaving) => {
      set((state) => {
        state.isSaving = isSaving;
      });
    },

    markDirty: () => {
      set((state) => {
        state.isDirty = true;
      });
    },

    markClean: () => {
      set((state) => {
        state.isDirty = false;
      });
    },

    // Reset
    reset: () => {
      set(() => initialState);
    },
  }))
);

// Selector helpers
export const selectRootBlocks = (state: EditorState) =>
  state.blocks
    .filter((b) => !b.parentId)
    .sort((a, b) => a.order - b.order);

export const selectChildBlocks = (parentId: string) => (state: EditorState) =>
  state.blocks
    .filter((b) => b.parentId === parentId)
    .sort((a, b) => a.order - b.order);

export const selectBlockById = (id: string) => (state: EditorState) =>
  state.blocks.find((b) => b.id === id);
