
export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;     // 一级分类
  subCategory: string;  // 二级分类
  tags: string[];       // 标签列表
  rating: number; // 1 to 5
  createdAt: number;
  updatedAt: number;
  
  // Deprecated fields for migration
  domain?: string;
}

export type SortOption = 'newest' | 'rating' | 'alphabetical';

export interface PromptFilter {
  category?: string | null;
  subCategory?: string | null;
  tag?: string | null;
  minRating: number;
  searchQuery: string;
}

// Stats
export interface CategoryStats {
  [category: string]: {
    total: number;
    subs: { [sub: string]: number };
  };
}

export interface TagStats {
  [tag: string]: number;
}

export type CategoryTree = Record<string, string[]>;
