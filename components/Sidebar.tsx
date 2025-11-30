
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
      onNavigate('dashboard');
      setExpandedCategories(prev => ({...prev, [category]: true}));
    }
  };

  const totalPrompts = Object.values(stats).reduce((sum, cat: any) => sum + cat.total, 0);

  // Sort tags by popularity
  const sortedTags = Object.entries(tagStats)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10); 

  return (
    <div className="w-72 bg-[#EFF3F6] h-screen overflow-hidden flex flex-col shrink-0 z-20 relative shadow-[5px_0_15px_rgba(209,217,230,0.5)]">
      {/* Brand Header */}
      <div className="p-8 pb-4 shrink-0 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <div className="flex items-center gap-3">
            <div className="neu-flat w-10 h-10 rounded-xl flex items-center justify-center text-indigo-600">
                <span className="text-xl font-black font-mono">P</span>
            </div>
            <div>
                <h1 className="text-xl font-black text-slate-700 tracking-tight">
                PromptMaster
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">你的第二大脑</p>
            </div>
        </div>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-6">
        
        {/* All Prompts Button */}
        <button
          onClick={() => { onSelect(null, null); onSelectTag(null); onNavigate('dashboard'); }}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
            currentPage === 'dashboard' && selectedCategory === null && selectedTag === null
              ? 'neu-pressed text-indigo-600'
              : 'neu-btn text-slate-600 hover:text-indigo-600'
          }`}
        >
          <span>全部提示词</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
              currentPage === 'dashboard' && selectedCategory === null && selectedTag === null
              ? 'bg-indigo-100 text-indigo-600'
              : 'bg-slate-200 text-slate-500'
          }`}>
            {totalPrompts}
          </span>
        </button>

        {/* Categories Section */}
        <div>
            <div className="flex items-center justify-between px-2 mb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">领域分类</h3>
                <button 
                    onClick={onManageCategories} 
                    className="neu-btn p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition-transform hover:scale-105 active:scale-95"
                    title="管理知识库"
                >
                    <SettingsIcon className="w-3.5 h-3.5" />
                </button>
            </div>
            
            <div className="space-y-3">
            {Object.entries(categoryTree).map(([category, subCategories]) => {
                const count = stats[category]?.total || 0;
                const isExpanded = expandedCategories[category];
                const isSelected = selectedCategory === category && currentPage === 'dashboard';

                return (
                <div key={category} className="select-none">
                    <div 
                        className={`flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl cursor-pointer transition-all duration-200 ${
                            isSelected && selectedSubCategory === null
                            ? 'neu-pressed text-indigo-600'
                            : 'neu-flat hover:translate-y-[-1px] text-slate-600'
                        }`}
                        onClick={() => handleCategorySelect(category)}
                    >
                    <div className="flex items-center gap-3 truncate">
                        <button 
                            onClick={(e) => toggleCategory(category, e)}
                            className={`p-1 rounded-full transition-colors ${isSelected ? 'text-indigo-400 hover:bg-indigo-100' : 'text-slate-400 hover:bg-slate-200'}`}
                        >
                            {isExpanded ? <ChevronDownIcon className="w-3 h-3 stroke-[3]" /> : <ChevronRightIcon className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <span className="truncate">{category}</span>
                    </div>
                    {count > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'
                        }`}>
                        {count}
                        </span>
                    )}
                    </div>

                    {isExpanded && (
                    <div className="mt-2 ml-4 space-y-1 border-l-2 border-slate-200/50 pl-3">
                        {(subCategories as string[]).map(sub => {
                        const subCount = stats[category]?.subs?.[sub] || 0;
                        const isSubSelected = selectedCategory === category && selectedSubCategory === sub && currentPage === 'dashboard';
                        
                        return (
                            <button
                            key={sub}
                            onClick={() => { onSelect(category, sub); onNavigate('dashboard'); }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                                isSubSelected
                                ? 'bg-slate-200/50 text-indigo-600 shadow-inner'
                                : 'text-slate-500 hover:bg-slate-200/30 hover:text-slate-700'
                            }`}
                            >
                            <span className="truncate">{sub}</span>
                            {subCount > 0 && <span className="opacity-50 text-[10px]">{subCount}</span>}
                            </button>
                        );
                        })}
                    </div>
                    )}
                </div>
                );
            })}
            </div>
        </div>

        {/* Popular Tags Section */}
        <div>
            <div className="flex items-center justify-between px-2 mb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">热门标签</h3>
                <button 
                    onClick={onManageTags} 
                    className="neu-btn p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition-transform hover:scale-105 active:scale-95"
                    title="管理标签"
                >
                    <SettingsIcon className="w-3.5 h-3.5" />
                </button>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
                {sortedTags.length > 0 ? (
                    sortedTags.map(([tag, count]) => {
                        const isSelected = selectedTag === tag && currentPage === 'dashboard';
                        return (
                            <button
                                key={tag}
                                onClick={() => { onSelectTag(isSelected ? null : tag); onNavigate('dashboard'); }}
                                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all duration-200 ${
                                    isSelected
                                    ? 'neu-pressed text-indigo-600 translate-y-[1px]' 
                                    : 'neu-flat text-slate-500 hover:text-indigo-500 hover:-translate-y-0.5'
                                }`}
                            >
                                #{tag}
                            </button>
                        );
                    })
                ) : (
                    <div className="px-2 text-xs text-slate-400 italic">暂无标签</div>
                )}
            </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-6 bg-[#EFF3F6] relative">
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50"></div>
          <nav className="space-y-3 mt-2">
              <button 
                onClick={() => onNavigate('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold ${
                    currentPage === 'settings' 
                    ? 'neu-pressed text-indigo-600' 
                    : 'neu-btn text-slate-600 hover:text-indigo-600'
                }`}
              >
                  <UserIcon className="w-5 h-5" />
                  账户设置
              </button>
              <button 
                onClick={() => onNavigate('help')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold ${
                    currentPage === 'help' 
                    ? 'neu-pressed text-indigo-600' 
                    : 'neu-btn text-slate-600 hover:text-indigo-600'
                }`}
              >
                  <SupportIcon className="w-5 h-5" />
                  帮助中心
              </button>
              <button 
                onClick={() => onNavigate('login')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-red-500 neu-btn transition-all duration-200 text-sm font-bold active:shadow-inner"
              >
                  <LogoutIcon className="w-5 h-5" />
                  退出登录
              </button>
          </nav>
      </div>
    </div>
  );
};
