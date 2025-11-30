
import { Prompt, CategoryTree } from '../types';
import { INITIAL_PROMPTS, DEFAULT_CATEGORY_TREE, RECOMMENDED_TAGS, DEFAULT_ATTRIBUTES } from '../constants';

const STORAGE_KEY_PROMPTS = 'prompt_manager_data_v2';
const STORAGE_KEY_CATEGORIES = 'prompt_manager_categories_v1';
const STORAGE_KEY_TAGS = 'prompt_manager_tags_v1';
const STORAGE_KEY_ATTRIBUTES = 'prompt_manager_attributes_v1';

export const storageService = {
  getPrompts: (): Prompt[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROMPTS);
      
      // Migration logic: Check if v1 data exists if v2 is missing
      if (!data) {
        const v1Data = localStorage.getItem('prompt_manager_data_v1');
        if (v1Data) {
          try {
            const parsedV1 = JSON.parse(v1Data);
            // Migrate v1 to v2 format
            const migrated = parsedV1.map((p: any) => ({
              ...p,
              category: mapDomainToCategory(p.domain),
              subCategory: '通用',
              tags: [],
            }));
            localStorage.setItem(STORAGE_KEY_PROMPTS, JSON.stringify(migrated));
            return migrated;
          } catch (e) {
            console.error("Migration failed", e);
          }
        }
        
        // Initialize with default data if empty and no legacy data
        localStorage.setItem(STORAGE_KEY_PROMPTS, JSON.stringify(INITIAL_PROMPTS));
        return INITIAL_PROMPTS as Prompt[];
      }
      
      const parsed = JSON.parse(data);
      // Ensure tags array exists for existing data
      return parsed.map((p: any) => ({
          ...p,
          tags: Array.isArray(p.tags) ? p.tags : []
      }));
    } catch (error) {
      console.error('Error reading prompts from storage', error);
      return [];
    }
  },

  savePrompts: (prompts: Prompt[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY_PROMPTS, JSON.stringify(prompts));
    } catch (error) {
      console.error('Error saving prompts to storage', error);
    }
  },

  // --- Category Tree Methods ---

  getCategoryTree: (): CategoryTree => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (data) {
        return JSON.parse(data) as CategoryTree;
      }
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORY_TREE));
      return DEFAULT_CATEGORY_TREE;
    } catch (error) {
      console.error('Error reading category tree from storage', error);
      return DEFAULT_CATEGORY_TREE;
    }
  },

  saveCategoryTree: (tree: CategoryTree): void => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(tree));
    } catch (error) {
      console.error('Error saving category tree to storage', error);
    }
  },

  // --- Tag Methods ---
  
  getRecommendedTags: (): string[] => {
      try {
          const data = localStorage.getItem(STORAGE_KEY_TAGS);
          if (data) {
              return JSON.parse(data);
          }
          return RECOMMENDED_TAGS;
      } catch (error) {
          return RECOMMENDED_TAGS;
      }
  },

  saveRecommendedTags: (tags: string[]): void => {
      try {
          localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(tags));
      } catch (error) {
          console.error("Error saving tags", error);
      }
  },

  // --- Advanced Attributes Methods ---
  
  getAttributes: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ATTRIBUTES);
      if (data) {
        // Merge with defaults to ensure all keys exist
        return { ...DEFAULT_ATTRIBUTES, ...JSON.parse(data) };
      }
      return DEFAULT_ATTRIBUTES;
    } catch (error) {
      return DEFAULT_ATTRIBUTES;
    }
  },

  saveAttributes: (attributes: typeof DEFAULT_ATTRIBUTES): void => {
    try {
      localStorage.setItem(STORAGE_KEY_ATTRIBUTES, JSON.stringify(attributes));
    } catch (error) {
      console.error("Error saving attributes", error);
    }
  },

  // --- User Profile ---
  getUserProfile: () => {
      try {
          const data = localStorage.getItem('prompt_manager_user_profile');
          return data ? JSON.parse(data) : { username: 'Alex Hartman', role: '高级产品经理' };
      } catch {
          return { username: 'Alex Hartman', role: '高级产品经理' };
      }
  },

  saveUserProfile: (profile: any) => {
      localStorage.setItem('prompt_manager_user_profile', JSON.stringify(profile));
  },
  
  // --- Auth Session ---
  isLoggedIn: () => {
      return !!localStorage.getItem('prompt_manager_session');
  },
  
  login: () => {
      localStorage.setItem('prompt_manager_session', 'true');
  },
  
  logout: () => {
      localStorage.removeItem('prompt_manager_session');
  },

  // Helper to generate UUID-like string
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// Helper for migration
const mapDomainToCategory = (oldDomain: string): string => {
  const map: Record<string, string> = {
    "企业管理": "企业管理",
    "项目管理": "项目管理",
    "产品管理": "产品设计",
    "市场营销": "市场营销",
    "内容创作": "内容创作",
    "代码开发": "技术开发",
    "教育育儿": "教育学习",
    "个人成长": "个人成长",
  };
  return map[oldDomain] || "其他";
};
