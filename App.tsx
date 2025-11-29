
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { SearchIcon, PlusIcon, StarIcon, UploadIcon } from './components/Icons';
import { PromptDetailModal } from './components/PromptDetailModal';
import { PromptFormModal } from './components/PromptFormModal';
import { ImportModal } from './components/ImportModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { LoginPage } from './components/LoginPage';
import { SettingsPage } from './components/SettingsPage';
import { HelpPage } from './components/HelpPage';
import { Prompt, CategoryStats, CategoryTree, TagStats } from './types';
import { CATEGORY_COLORS } from './constants';
import { storageService } from './services/storageService';

type Page = 'dashboard' | 'settings' | 'help' | 'login';

function App() {
  // --- State ---
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTree>({});
  
  // Selection State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [minRating, setMinRating] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // Settings Modal State
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [categoryManagerInitialTab, setCategoryManagerInitialTab] = useState<'categories' | 'tags'>('categories');

  // --- Effects ---
  useEffect(() => {
    // Load initial data
    const loadedPrompts = storageService.getPrompts();
    setPrompts(loadedPrompts);
    
    const loadedCategories = storageService.getCategoryTree();
    setCategoryTree(loadedCategories);
  }, []);

  useEffect(() => {
    if (prompts.length > 0) {
        storageService.savePrompts(prompts);
    }
  }, [prompts]);

  // --- Logic ---
  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      // 1. Filter by Category
      if (selectedCategory && p.category !== selectedCategory) return false;
      
      // 2. Filter by SubCategory (if selected)
      if (selectedSubCategory && p.subCategory !== selectedSubCategory) return false;
      
      // 3. Filter by Tag
      if (selectedTag && (!p.tags || !p.tags.includes(selectedTag))) return false;

      // 4. Filter by Rating
      if (minRating > 0 && p.rating < minRating) return false;

      // 5. Search Query
      if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matches = p.title.toLowerCase().includes(searchLower) || p.content.toLowerCase().includes(searchLower);
          if (!matches) return false;
      }

      return true;
    }).sort((a, b) => b.createdAt - a.createdAt); // Newest first
  }, [prompts, selectedCategory, selectedSubCategory, selectedTag, minRating, searchQuery]);

  // Derived stats for sidebar
  const stats: CategoryStats = useMemo(() => {
    const s: CategoryStats = {};
    Object.keys(categoryTree).forEach(cat => {
        s[cat] = { total: 0, subs: {} };
        categoryTree[cat].forEach(sub => {
            s[cat].subs[sub] = 0;
        });
    });
    prompts.forEach(p => {
        const cat = p.category;
        const sub = p.subCategory;
        if (!s[cat]) s[cat] = { total: 0, subs: {} };
        s[cat].total++;
        s[cat].subs[sub] = (s[cat].subs[sub] || 0) + 1;
    });
    return s;
  }, [prompts, categoryTree]);

  // Tag Statistics
  const tagStats: TagStats = useMemo(() => {
      const ts: TagStats = {};
      prompts.forEach(p => {
          if(p.tags) {
              p.tags.forEach(tag => {
                  ts[tag] = (ts[tag] || 0) + 1;
              });
          }
      });
      return ts;
  }, [prompts]);

  const handleCategorySelect = (category: string | null, subCategory: string | null) => {
      setSelectedCategory(category);
      setSelectedSubCategory(subCategory);
      setSelectedTag(null);
  };
  
  const handleTagSelect = (tag: string | null) => {
      setSelectedTag(tag);
      if(tag) {
        setSelectedCategory(null);
        setSelectedSubCategory(null);
      }
  };

  const handleAddPrompt = (newPrompt: Prompt) => {
    if (editingPrompt) {
        setPrompts(prompts.map(p => p.id === newPrompt.id ? newPrompt : p));
    } else {
        setPrompts([newPrompt, ...prompts]);
    }
    setEditingPrompt(null);
  };

  const handleDeletePrompt = (id: string) => {
      setPrompts(prompts.filter(p => p.id !== id));
  };

  const handleImport = (importedPrompts: Prompt[]) => {
    setPrompts([...prompts, ...importedPrompts]);
  };

  const handleCategoryTreeSave = (newTree: CategoryTree) => {
    setCategoryTree(newTree);
    storageService.saveCategoryTree(newTree);
    if (selectedCategory && !newTree[selectedCategory]) {
        setSelectedCategory(null);
        setSelectedSubCategory(null);
    }
  };

  const handleUpdatePrompts = (updatedPrompts: Prompt[]) => {
      setPrompts(updatedPrompts);
  };

  const openCategoryManager = () => {
      setCategoryManagerInitialTab('categories');
      setIsCategoryManagerOpen(true);
  };

  const openTagManager = () => {
      setCategoryManagerInitialTab('tags');
      setIsCategoryManagerOpen(true);
  };

  // --- Render ---

  // 1. Login Page
  if (currentPage === 'login') {
      return <LoginPage onLogin={() => setCurrentPage('dashboard')} />;
  }

  // 2. Main App Layout (Sidebar + Content)
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar 
        categoryTree={categoryTree}
        selectedCategory={selectedCategory}
        selectedSubCategory={selectedSubCategory}
        selectedTag={selectedTag}
        onSelect={handleCategorySelect}
        onSelectTag={handleTagSelect}
        stats={stats}
        tagStats={tagStats}
        onManageCategories={openCategoryManager}
        onManageTags={openTagManager}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {currentPage === 'dashboard' ? (
            <>
                {/* Dashboard Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0 z-10">
                    <div className="flex items-center w-full md:w-auto gap-4 flex-1 max-w-2xl">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="搜索标题或内容关键词..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm"
                            />
                        </div>
                        <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200 shrink-0">
                        <button 
                                onClick={() => setMinRating(0)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${minRating === 0 ? 'bg-white text-slate-800 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            全部
                        </button>
                        <button 
                                onClick={() => setMinRating(4)}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${minRating === 4 ? 'bg-white text-amber-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            4+ <StarIcon filled={true} className="w-3 h-3" />
                        </button>
                        <button 
                                onClick={() => setMinRating(5)}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${minRating === 5 ? 'bg-white text-amber-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            5 <StarIcon filled={true} className="w-3 h-3" />
                        </button>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto justify-end">
                        <button 
                            onClick={() => setIsImportOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-all text-sm font-medium shadow-sm"
                        >
                            <UploadIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">导入</span>
                        </button>
                        <button 
                            onClick={() => { setEditingPrompt(null); setIsFormOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-all text-sm font-bold shadow-md shadow-indigo-100 active:scale-95"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">新建</span>
                            <span className="inline sm:hidden">新建</span>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {filteredPrompts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <SearchIcon className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-600">未找到相关提示词</h3>
                            <p className="text-sm">请尝试调整筛选条件或搜索关键词。</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                            {filteredPrompts.map(prompt => (
                                <div 
                                    key={prompt.id}
                                    onClick={() => setViewingPrompt(prompt)}
                                    className="group bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-60"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border truncate max-w-[50%] ${CATEGORY_COLORS[prompt.category] || 'bg-slate-100 text-slate-600'}`}>
                                            {prompt.category}
                                        </span>
                                        <div className="flex gap-0.5 text-amber-400">
                                            <StarIcon filled={true} className="w-4 h-4" />
                                            <span className="text-xs font-bold text-slate-600 ml-1 pt-0.5">{prompt.rating}.0</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1 leading-snug group-hover:text-indigo-600 transition-colors">
                                        {prompt.title}
                                    </h3>
                                    
                                    <div className="flex gap-1 mb-3 overflow-hidden h-5">
                                        {prompt.tags?.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] px-1.5 rounded-md bg-slate-100 text-slate-500 whitespace-nowrap">
                                                #{tag}
                                            </span>
                                        ))}
                                        {(prompt.tags?.length || 0) > 3 && (
                                            <span className="text-[10px] text-slate-400">+{prompt.tags!.length - 3}</span>
                                        )}
                                    </div>
                                    
                                    <p className="text-slate-500 text-sm line-clamp-3 mb-2 flex-1 font-mono bg-slate-50 p-2 rounded border border-transparent group-hover:border-slate-100">
                                        {prompt.content}
                                    </p>
                                    
                                    <div className="flex justify-between items-center text-xs text-slate-400 mt-auto pt-2 border-t border-slate-50">
                                        <span className="truncate max-w-[100px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                            {prompt.subCategory}
                                        </span>
                                        <span className="group-hover:text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            查看详情 &rarr;
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </>
        ) : currentPage === 'settings' ? (
            <div className="flex-1 overflow-y-auto">
                <SettingsPage />
            </div>
        ) : currentPage === 'help' ? (
            <div className="flex-1 overflow-y-auto">
                <HelpPage />
            </div>
        ) : null}
      </main>

      {/* Modals (Only active in dashboard view usually, but kept global for simplicity) */}
      <PromptDetailModal 
        prompt={viewingPrompt} 
        onClose={() => setViewingPrompt(null)} 
        onEdit={(p) => {
            setViewingPrompt(null);
            setEditingPrompt(p);
            setIsFormOpen(true);
        }}
        onDelete={handleDeletePrompt}
      />
      
      <PromptFormModal 
        isOpen={isFormOpen}
        editingPrompt={editingPrompt}
        onClose={() => { setIsFormOpen(false); setEditingPrompt(null); }}
        onSave={handleAddPrompt}
        categoryTree={categoryTree}
      />

      <ImportModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={handleImport}
        categoryTree={categoryTree}
      />
      
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categoryTree={categoryTree}
        onSave={handleCategoryTreeSave}
        prompts={prompts}
        onUpdatePrompts={handleUpdatePrompts}
        initialTab={categoryManagerInitialTab}
      />
    </div>
  );
}

export default App;
