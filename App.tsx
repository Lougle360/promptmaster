
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { SearchIcon, PlusIcon, StarIcon, UploadIcon } from './components/Icons';
import { PromptDetailModal } from './components/PromptDetailModal';
import { PromptFormModal } from './components/PromptFormModal';
import { ImportModal } from './components/ImportModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { ExportModal } from './components/ExportModal';
import { AdvancedFilter } from './components/AdvancedFilter';
import { LoginPage } from './components/LoginPage';
import { SettingsPage } from './components/SettingsPage';
import { HelpPage } from './components/HelpPage';
import { Prompt, CategoryStats, CategoryTree, TagStats, PromptFilter } from './types';
import { storageService } from './services/storageService';
import { DEFAULT_ATTRIBUTES } from './constants';

type Page = 'dashboard' | 'settings' | 'help' | 'login';

function App() {
  // --- State ---
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTree>({});
  
  // Custom Attributes State
  const [attributes, setAttributes] = useState<typeof DEFAULT_ATTRIBUTES>(DEFAULT_ATTRIBUTES);

  // Selection State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Advanced Filters State
  const [filters, setFilters] = useState<PromptFilter>({
      minRating: 0,
      searchQuery: '',
      source: undefined,
      author: undefined,
      parameterType: undefined,
      agentPlatform: undefined,
      scenario: undefined,
      model: undefined
  });
  
  // Modals
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [categoryManagerInitialTab, setCategoryManagerInitialTab] = useState<string>('categories');

  // --- Effects ---
  useEffect(() => {
    // Load initial data
    const loadedPrompts = storageService.getPrompts();
    setPrompts(loadedPrompts);
    
    const loadedCategories = storageService.getCategoryTree();
    setCategoryTree(loadedCategories);

    const loadedAttributes = storageService.getAttributes();
    setAttributes(loadedAttributes);
  }, []);

  useEffect(() => {
    if (prompts.length > 0) {
        storageService.savePrompts(prompts);
    }
  }, [prompts]);

  // --- Logic ---

  // Dynamic Options for Filters (Merge Custom Attributes + Used Values)
  const availableFilterOptions = useMemo(() => {
      const getUnique = (field: keyof Prompt, defaultList: string[]) => 
        Array.from(new Set([
            ...defaultList,
            ...prompts.map(p => p[field] as string).filter(Boolean)
        ]));

      return {
          sources: getUnique('source', attributes.sources),
          authors: getUnique('author', attributes.authors),
          parameterTypes: getUnique('parameterType', attributes.parameterTypes),
          agentPlatforms: getUnique('agentPlatform', attributes.agentPlatforms),
          scenarios: getUnique('scenario', attributes.scenarios),
          models: getUnique('model', attributes.models),
      };
  }, [prompts, attributes]);


  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      // 1. Sidebar Filters
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedSubCategory && p.subCategory !== selectedSubCategory) return false;
      if (selectedTag && (!p.tags || !p.tags.includes(selectedTag))) return false;

      // 2. Rating & Search
      if (filters.minRating > 0 && p.rating < filters.minRating) return false;
      if (filters.searchQuery) {
          const searchLower = filters.searchQuery.toLowerCase();
          const matches = p.title.toLowerCase().includes(searchLower) || p.content.toLowerCase().includes(searchLower);
          if (!matches) return false;
      }

      // 3. Advanced Filters (6 Dimensions)
      if (filters.source && p.source !== filters.source) return false;
      if (filters.author && p.author !== filters.author) return false;
      if (filters.parameterType && p.parameterType !== filters.parameterType) return false;
      if (filters.agentPlatform && p.agentPlatform !== filters.agentPlatform) return false;
      if (filters.scenario && p.scenario !== filters.scenario) return false;
      if (filters.model && p.model !== filters.model) return false;

      return true;
    }).sort((a, b) => b.createdAt - a.createdAt); // Newest first
  }, [prompts, selectedCategory, selectedSubCategory, selectedTag, filters]);

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
  
  const handleAttributesSave = (newAttributes: typeof DEFAULT_ATTRIBUTES) => {
      setAttributes(newAttributes);
      storageService.saveAttributes(newAttributes);
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
  
  const openAttributeManager = () => {
      setCategoryManagerInitialTab('sources'); // Default to first attr
      setIsCategoryManagerOpen(true);
  };

  // --- Render ---

  if (currentPage === 'login') {
      return <LoginPage onLogin={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="flex min-h-screen bg-[#EFF3F6] font-sans">
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
                {/* Header */}
                <header className="px-8 py-6 flex flex-col md:flex-row gap-6 justify-between items-center shrink-0 z-10">
                    <div className="flex items-center w-full md:w-auto gap-4 flex-1 max-w-3xl">
                        {/* Search Bar Neumorphic */}
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <SearchIcon className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="搜索标题或内容..."
                                value={filters.searchQuery}
                                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                                className="neu-pressed w-full pl-11 pr-4 py-3 rounded-2xl text-slate-600 placeholder-slate-400 focus:outline-none focus:text-indigo-600 transition-all"
                            />
                        </div>
                        
                        {/* Rating Filter Neumorphic */}
                        <div className="neu-flat flex items-center p-1 rounded-xl shrink-0">
                            <button 
                                    onClick={() => setFilters({...filters, minRating: 0})}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filters.minRating === 0 ? 'neu-pressed text-indigo-500' : 'text-slate-500 hover:text-indigo-500'}`}
                            >
                                全部
                            </button>
                            <button 
                                    onClick={() => setFilters({...filters, minRating: 4})}
                                    className={`flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-lg transition-all ${filters.minRating === 4 ? 'neu-pressed text-amber-500' : 'text-slate-500 hover:text-amber-500'}`}
                            >
                                4+ <StarIcon filled={true} className="w-3 h-3" />
                            </button>
                            <button 
                                    onClick={() => setFilters({...filters, minRating: 5})}
                                    className={`flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-lg transition-all ${filters.minRating === 5 ? 'neu-pressed text-amber-500' : 'text-slate-500 hover:text-amber-500'}`}
                            >
                                5 <StarIcon filled={true} className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto justify-end">
                         <button 
                            onClick={() => setIsExportOpen(true)}
                            className="neu-btn p-3 text-slate-600 hover:text-indigo-600"
                            title="导出数据"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                        <button 
                            onClick={() => setIsImportOpen(true)}
                            className="neu-btn px-5 py-3 text-slate-600 hover:text-indigo-600 flex items-center gap-2 text-sm font-bold"
                        >
                            <UploadIcon className="w-4 h-4" />
                            导入
                        </button>
                        <button 
                            onClick={() => { setEditingPrompt(null); setIsFormOpen(true); }}
                            className="neu-btn neu-btn-primary px-6 py-3 flex items-center gap-2 text-sm font-bold"
                        >
                            <PlusIcon className="w-5 h-5" />
                            新建
                        </button>
                    </div>
                </header>

                {/* Advanced Filter Panel */}
                <AdvancedFilter 
                    filter={filters} 
                    onChange={setFilters} 
                    availableOptions={availableFilterOptions}
                    onManage={openAttributeManager}
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    {filteredPrompts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <div className="neu-flat p-6 rounded-full mb-4">
                                <SearchIcon className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-500">未找到相关提示词</h3>
                            <p className="text-sm mt-2">请尝试调整筛选条件。</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPrompts.map(prompt => (
                                <div 
                                    key={prompt.id}
                                    onClick={() => setViewingPrompt(prompt)}
                                    className="neu-flat rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-transform duration-300 flex flex-col h-64 group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="neu-pressed px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate max-w-[60%]">
                                            {prompt.category}
                                        </div>
                                        <div className="flex gap-0.5 text-amber-400">
                                            <StarIcon filled={true} className="w-4 h-4" />
                                            <span className="text-xs font-bold text-slate-500 ml-1 pt-0.5">{prompt.rating}.0</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-bold text-slate-700 text-lg mb-2 line-clamp-1 group-hover:text-indigo-500 transition-colors">
                                        {prompt.title}
                                    </h3>
                                    
                                    {/* Advanced Badges */}
                                    <div className="flex flex-wrap gap-2 mb-3 h-5 overflow-hidden">
                                        {prompt.model && (
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/50 text-slate-500 font-medium truncate">
                                                {prompt.model}
                                            </span>
                                        )}
                                        {prompt.parameterType && prompt.parameterType !== '无参数' && (
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/50 text-slate-500 font-medium">
                                                {prompt.parameterType}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 relative mb-3">
                                        <p className="text-slate-500 text-sm line-clamp-3 font-mono leading-relaxed opacity-80">
                                            {prompt.content}
                                        </p>
                                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#EFF3F6] to-transparent"></div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t border-slate-200/50">
                                        <span className="font-medium text-slate-500">
                                            {prompt.subCategory}
                                        </span>
                                        <span className="group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100 font-bold">
                                            详情 &rarr;
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

      {/* Modals */}
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
        attributes={attributes}
      />

      <ImportModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={handleImport}
        categoryTree={categoryTree}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        prompts={prompts}
      />
      
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categoryTree={categoryTree}
        onSave={handleCategoryTreeSave}
        prompts={prompts}
        onUpdatePrompts={handleUpdatePrompts}
        initialTab={categoryManagerInitialTab}
        attributes={attributes}
        onSaveAttributes={handleAttributesSave}
      />
    </div>
  );
}

export default App;
