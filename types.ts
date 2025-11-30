
import * as XLSX from 'xlsx';

declare global {
  interface Window {
    XLSX: typeof XLSX;
  }
}

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
  
  // Advanced Metadata (New)
  source?: string;       // 来源: Way2agi, LangGPT...
  author?: string;       // 作者: 云中江树...
  parameterType?: '无参数' | '单参数' | '多参数'; // 参数类型
  agentPlatform?: string; // 智能体: 豆包, ChatGPT...
  scenario?: string;     // 场景: 飞书, Coze...
  model?: string;        // 大模型: Gemini, Deepseek...

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
  
  // Advanced Filters
  source?: string;
  author?: string;
  parameterType?: string;
  agentPlatform?: string;
  scenario?: string;
  model?: string;
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
export type TagRegistry = string[]; // Simple list for now