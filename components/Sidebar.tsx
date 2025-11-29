
import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon, SettingsIcon, UserIcon, SupportIcon, LogoutIcon } from './Icons';
import { CategoryStats, CategoryTree, TagStats } from '../types';

interface SidebarProps {
  categoryTree: CategoryTree;
  selectedCategory: string | null;
  selectedSubCategory: string | null;
  selectedTag: string | null;
  onSelect: (category: string | null, subCategory: string | null) => void;
  onSelectTag: (tag: string | null) => void;
  stats: CategoryStats;
  tagStats: TagStats;
  onManageCategories: () => void;
  onManageTags: () => void;
  onNavigate: (page: 'dashboard' | 'settings' | 'help' | 'login') => void;
  currentPage: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    categoryTree, 
    selectedCategory, 
    selectedSubCategory, 
    selectedTag,
    onSelect, 
    onSelectTag,
    stats, 
    tagStats,
    onManageCategories,
    onManageTags,
    onNavigate,
    currentPage
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category && selectedSubCategory === null) {
      setExpandedCategories(prev => ({...prev, [category]: !prev[category]}));
    } else {
      onSelect(category, null);
      onNavigate('dashboard'); // Ensure we go back to dashboard when selecting category
      setExpandedCategories(prev => ({...prev, [category]: true}));
    }
  };

  const totalPrompts = Object.values(stats).reduce((sum, cat) => sum + cat.total, 0);

  // Sort tags by popularity
  const sortedTags = Object.entries(tagStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Top 10 tags

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen overflow-hidden flex flex-col shrink-0 z-20">
      <div className="p-6 border-b border-slate-100 shrink-0 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg font-mono">P</span>
          PromptMaster
        </h1>
        <p className="text-xs text-slate-500 mt-1 pl-10">你的第二大脑知识库</p>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <button
          onClick={() => { onSelect(null, null); onSelectTag(null); onNavigate('dashboard'); }}
          className={`w-full flex items-center justify-between px-3 py-2.5 mb-4 text-sm font-medium rounded-lg transition-colors ${
            currentPage === 'dashboard' && selectedCategory === null && selectedTag === null
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span>全部提示词</span>
          <span className="bg-slate-200 text-slate-600 py-0.5 px-2 rounded-full text-xs min-w-[1.5rem] text-center">
            {totalPrompts}
          </span>
        </button>

        {/* Categories Section */}
        <div className="flex items-center justify-between px-2 mb-2 mt-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">领域分类</h3>
            <button 
                onClick={onManageCategories} 
                className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 transition-colors"
                title="管理知识库"
            >
                <SettingsIcon className="w-4 h-4" />
            </button>
        </div>
        
        <div className="space-y-1 mb-8">
          {Object.entries(categoryTree).map(([category, subCategories]) => {
            const count = stats[category]?.total || 0;
            const isExpanded = expandedCategories[category];
            const isSelected = selectedCategory === category && currentPage === 'dashboard';

            return (
              <div key={category} className="select-none">
                <div 
                  className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer group ${
                    isSelected && selectedSubCategory === null
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <button 
                        onClick={(e) => toggleCategory(category, e)}
                        className="p-0.5 rounded hover:bg-black/5 text-slate-400"
                    >
                        {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                    </button>
                    <span className="truncate">{category}</span>
                  </div>
                  {count > 0 && (
                    <span className={`${isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-500'} py-0.5 px-2 rounded-full text-xs min-w-[1.5rem] text-center`}>
                      {count}
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-1 ml-4 space-y-0.5 border-l-2 border-slate-100 pl-2">
                    {subCategories.map(sub => {
                       const subCount = stats[category]?.subs?.[sub] || 0;
                       return (
                        <button
                          key={sub}
                          onClick={() => { onSelect(category, sub); onNavigate('dashboard'); }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-colors ${
                            selectedCategory === category && selectedSubCategory === sub && currentPage === 'dashboard'
                              ? 'bg-indigo-50 text-indigo-700 font-medium'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate">{sub}</span>
                          {subCount > 0 && <span className="opacity-60">{subCount}</span>}
                        </button>
                       );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Popular Tags Section */}
        <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">热门标签</h3>
            <button 
                onClick={onManageTags} 
                className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 transition-colors"
                title="管理标签"
            >
                <SettingsIcon className="w-4 h-4" />
            </button>
        </div>
        
        {sortedTags.length > 0 ? (
            <div className="flex flex-wrap gap-2 px-2">
                {sortedTags.map(([tag, count]) => (
                    <button
                        key={tag}
                        onClick={() => { onSelectTag(selectedTag === tag ? null : tag); onNavigate('dashboard'); }}
                        className={`text-xs px-2 py-1 rounded-full border transition-all ${
                            selectedTag === tag && currentPage === 'dashboard'
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                    >
                        #{tag} <span className="opacity-60 ml-0.5">{count}</span>
                    </button>
                ))}
            </div>
        ) : (
            <div className="px-2 text-xs text-slate-400 italic">暂无标签</div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-slate-100 bg-white">
          <nav className="space-y-1">
              <button 
                onClick={() => onNavigate('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${currentPage === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                  <UserIcon className="w-5 h-5" />
                  账户设置
              </button>
              <button 
                onClick={() => onNavigate('help')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${currentPage === 'help' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                  <SupportIcon className="w-5 h-5" />
                  帮助中心
              </button>
              <button 
                onClick={() => onNavigate('login')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium"
              >
                  <LogoutIcon className="w-5 h-5" />
                  退出登录
              </button>
          </nav>
      </div>
    </div>
  );
};
