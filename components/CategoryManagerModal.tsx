
import React, { useState, useEffect, useMemo } from 'react';
import { XIcon, TrashIcon, EditIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon, CheckIcon, SearchIcon } from './Icons';
import { CategoryTree, Prompt } from '../types';
import { storageService } from '../services/storageService';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryTree: CategoryTree;
  onSave: (newTree: CategoryTree) => void;
  prompts: Prompt[];
  onUpdatePrompts: (prompts: Prompt[]) => void;
  initialTab?: 'categories' | 'tags';
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ 
    isOpen, 
    onClose, 
    categoryTree, 
    onSave,
    prompts,
    onUpdatePrompts,
    initialTab = 'categories'
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>(initialTab);
  
  // --- Category State ---
  const [localTree, setLocalTree] = useState<CategoryTree>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{original: string, current: string} | null>(null);

  // --- Tag State ---
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [editingTag, setEditingTag] = useState<{original: string, current: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Set Tab
      setActiveTab(initialTab);

      // Init Categories
      setLocalTree(JSON.parse(JSON.stringify(categoryTree)));
      setCategories(Object.keys(categoryTree));
      setSelectedCategory(Object.keys(categoryTree)[0] || null);
      
      // Init Tags
      setRecommendedTags(storageService.getRecommendedTags());
    }
  }, [isOpen, categoryTree, initialTab]);

  // Calculate Tag Stats
  const allTagsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Count from prompts
    prompts.forEach(p => {
        if (p.tags) {
            p.tags.forEach(t => {
                counts[t] = (counts[t] || 0) + 1;
            });
        }
    });

    // Ensure recommended tags appear even if count is 0
    recommendedTags.forEach(t => {
        if (counts[t] === undefined) counts[t] = 0;
    });

    return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [prompts, recommendedTags]);

  const filteredTags = allTagsWithCounts.filter(t => 
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  if (!isOpen) return null;

  // --- Category Logic ---
  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (localTree[name]) { alert('该分类已存在'); return; }
    
    const newTree = { ...localTree, [name]: [] };
    setLocalTree(newTree);
    setCategories([...categories, name]);
    setNewCategoryName('');
    setSelectedCategory(name);
  };

  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`确定要删除分类“${cat}”吗？`)) {
      const newTree = { ...localTree };
      delete newTree[cat];
      setLocalTree(newTree);
      
      const newCats = categories.filter(c => c !== cat);
      setCategories(newCats);
      if (selectedCategory === cat) setSelectedCategory(newCats[0] || null);
    }
  };

  const handleStartEditCategory = (cat: string) => setEditingCategory({ original: cat, current: cat });
  
  const handleSaveEditCategory = () => {
    if (!editingCategory) return;
    const { original, current } = editingCategory;
    const newName = current.trim();
    if (!newName) return;
    if (newName !== original && localTree[newName]) { alert('分类名已存在'); return; }

    const newTree: CategoryTree = {};
    const newCats = categories.map(c => {
        if (c === original) {
            newTree[newName] = localTree[original];
            return newName;
        }
        newTree[c] = localTree[c];
        return c;
    });

    setLocalTree(newTree);
    setCategories(newCats);
    if (selectedCategory === original) setSelectedCategory(newName);
    setEditingCategory(null);
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    const newCats = [...categories];
    [newCats[index], newCats[newIndex]] = [newCats[newIndex], newCats[index]];
    setCategories(newCats);
  };

  const handleAddSubCategory = () => {
    if (!selectedCategory) return;
    const name = newSubCategoryName.trim();
    if (!name) return;
    const subs = localTree[selectedCategory] || [];
    if (subs.includes(name)) { alert('子分类已存在'); return; }
    setLocalTree({ ...localTree, [selectedCategory]: [...subs, name] });
    setNewSubCategoryName('');
  };

  const handleDeleteSubCategory = (index: number) => {
    if (!selectedCategory) return;
    const subs = [...localTree[selectedCategory]];
    subs.splice(index, 1);
    setLocalTree({ ...localTree, [selectedCategory]: subs });
  };

  const handleMoveSub = (index: number, direction: 'up' | 'down') => {
      if (!selectedCategory) return;
      const subs = [...localTree[selectedCategory]];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= subs.length) return;
      [subs[index], subs[newIndex]] = [subs[newIndex], subs[index]];
      setLocalTree({ ...localTree, [selectedCategory]: subs });
  };

  // --- Tag Logic ---

  // 1. Add Recommended Tag
  const handleAddRecommendedTag = () => {
      const tag = newTag.trim();
      if (!tag || recommendedTags.includes(tag)) return;
      setRecommendedTags([...recommendedTags, tag]);
      setNewTag('');
  };

  // 2. Rename Tag (System Wide)
  const handleStartEditTag = (tag: string) => setEditingTag({ original: tag, current: tag });

  const handleSaveEditTag = () => {
      if (!editingTag) return;
      const { original, current } = editingTag;
      const newTagName = current.trim();
      
      if (!newTagName || newTagName === original) {
          setEditingTag(null);
          return;
      }

      const confirmMsg = `确定要将标签 "${original}" 重命名为 "${newTagName}" 吗？\n这将更新 ${allTagsWithCounts.find(t => t.name === original)?.count || 0} 条相关提示词。`;
      if (!window.confirm(confirmMsg)) return;

      // Update Prompts
      const updatedPrompts = prompts.map(p => {
          if (p.tags && p.tags.includes(original)) {
              // Replace tag, and use Set to avoid duplicates if merged tag already existed
              const newTags = Array.from(new Set(p.tags.map(t => t === original ? newTagName : t)));
              return { ...p, tags: newTags };
          }
          return p;
      });

      // Update Recommended Tags
      let updatedRecommended = [...recommendedTags];
      if (updatedRecommended.includes(original)) {
          updatedRecommended = updatedRecommended.map(t => t === original ? newTagName : t);
          // Dedupe recommended if new name already existed
          updatedRecommended = Array.from(new Set(updatedRecommended));
      }

      onUpdatePrompts(updatedPrompts);
      setRecommendedTags(updatedRecommended);
      setEditingTag(null);
  };

  // 3. Delete Tag (System Wide)
  const handleDeleteTagSystemWide = (tagToDelete: string) => {
      const count = allTagsWithCounts.find(t => t.name === tagToDelete)?.count || 0;
      const confirmMsg = `确定要删除标签 "${tagToDelete}" 吗？\n这将从 ${count} 条提示词中移除该标签。`;
      if (!window.confirm(confirmMsg)) return;

      // Remove from prompts
      const updatedPrompts = prompts.map(p => {
          if (p.tags && p.tags.includes(tagToDelete)) {
              return { ...p, tags: p.tags.filter(t => t !== tagToDelete) };
          }
          return p;
      });

      // Remove from recommended
      const updatedRecommended = recommendedTags.filter(t => t !== tagToDelete);

      onUpdatePrompts(updatedPrompts);
      setRecommendedTags(updatedRecommended);
  };

  // --- Save All (Category Structure only, tags saved immediately) ---
  const handleSaveAll = () => {
      // Save Categories
      const orderedTree: CategoryTree = {};
      categories.forEach(cat => orderedTree[cat] = localTree[cat]);
      onSave(orderedTree);
      
      // Save Tags (Recommended list needs explicit save to storage here to ensure sync if user didn't modify prompts)
      storageService.saveRecommendedTags(recommendedTags);
      
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-[85vh]">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">知识库设置</h2>
            <p className="text-sm text-slate-500">管理分类体系与标签库</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 shrink-0">
            <button 
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'categories' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('categories')}
            >
                领域分类管理
            </button>
            <button 
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tags' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('tags')}
            >
                标签管理
            </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
            {activeTab === 'categories' ? (
                // --- CATEGORIES VIEW ---
                <div className="flex h-full">
                    {/* Left: Categories */}
                    <div className="w-1/2 border-r border-slate-200 flex flex-col bg-slate-50">
                        <div className="p-3 border-b border-slate-200 bg-white">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">一级领域</h3>
                            <div className="flex gap-2">
                                <input 
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="新领域名称..."
                                    className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <button onClick={handleAddCategory} className="bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700">
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {categories.map((cat, index) => (
                                <div 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`group flex items-center justify-between p-2 rounded cursor-pointer border ${
                                        selectedCategory === cat 
                                        ? 'bg-white border-indigo-200 shadow-sm' 
                                        : 'border-transparent hover:bg-slate-100'
                                    }`}
                                >
                                    {editingCategory?.original === cat ? (
                                        <div className="flex items-center gap-1 flex-1">
                                            <input 
                                                value={editingCategory.current}
                                                onChange={(e) => setEditingCategory({...editingCategory, current: e.target.value})}
                                                className="flex-1 px-1 py-0.5 text-sm border border-indigo-300 rounded outline-none"
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEditCategory()}
                                            />
                                            <button onClick={(e) => { e.stopPropagation(); handleSaveEditCategory(); }} className="text-green-600"><CheckIcon className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <span className={`text-sm font-medium ${selectedCategory === cat ? 'text-indigo-700' : 'text-slate-700'}`}>{cat}</span>
                                    )}
                                    
                                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${editingCategory?.original === cat ? 'hidden' : ''}`}>
                                        <button onClick={(e) => { e.stopPropagation(); handleMoveCategory(index, 'up'); }} className="text-slate-400 hover:text-indigo-600"><ArrowUpIcon className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleMoveCategory(index, 'down'); }} className="text-slate-400 hover:text-indigo-600"><ArrowDownIcon className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleStartEditCategory(cat); }} className="text-slate-400 hover:text-blue-600"><EditIcon className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }} className="text-slate-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: SubCategories */}
                    <div className="w-1/2 flex flex-col bg-white">
                        <div className="p-3 border-b border-slate-200 bg-white">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                {selectedCategory ? `“${selectedCategory}” 的子领域` : '请选择一级领域'}
                            </h3>
                            <div className="flex gap-2">
                                <input 
                                    value={newSubCategoryName}
                                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                                    placeholder={selectedCategory ? "新子领域名称..." : "请先选择左侧领域"}
                                    disabled={!selectedCategory}
                                    className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubCategory()}
                                />
                                <button onClick={handleAddSubCategory} disabled={!selectedCategory} className="bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700 disabled:opacity-50">
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {selectedCategory && localTree[selectedCategory]?.map((sub, index) => (
                                <div key={index} className="group flex items-center justify-between p-2 rounded border border-transparent hover:bg-slate-50">
                                    <span className="text-sm text-slate-700">{sub}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleMoveSub(index, 'up')} className="text-slate-400 hover:text-indigo-600"><ArrowUpIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleMoveSub(index, 'down')} className="text-slate-400 hover:text-indigo-600"><ArrowDownIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteSubCategory(index)} className="text-slate-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                // --- TAGS VIEW ---
                <div className="flex flex-col h-full bg-slate-50">
                     {/* Top Bar: Add & Search */}
                    <div className="p-4 bg-white border-b border-slate-200 space-y-4">
                        <div className="flex gap-4">
                            {/* Add Recommended */}
                            <div className="flex-1 flex flex-col">
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1">添加推荐标签</label>
                                <div className="flex gap-2">
                                    <input 
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="输入标签 (如: ChatGPT)"
                                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddRecommendedTag()}
                                    />
                                    <button onClick={handleAddRecommendedTag} className="px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                        <PlusIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                             {/* Search Tags */}
                             <div className="flex-1 flex flex-col">
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1">搜索标签</label>
                                <div className="relative">
                                    <input 
                                        value={tagSearch}
                                        onChange={(e) => setTagSearch(e.target.value)}
                                        placeholder="查找..."
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tag List Table */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <table className="w-full text-sm text-left bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                            <thead className="bg-slate-100 text-slate-500 font-medium">
                                <tr>
                                    <th className="p-3 w-1/3">标签名称</th>
                                    <th className="p-3 w-1/4">类型</th>
                                    <th className="p-3 w-1/4">引用次数</th>
                                    <th className="p-3 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTags.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-6 text-center text-slate-400">未找到相关标签</td>
                                    </tr>
                                )}
                                {filteredTags.map(({ name, count }) => (
                                    <tr key={name} className="hover:bg-slate-50 group">
                                        <td className="p-3">
                                            {editingTag?.original === name ? (
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        value={editingTag.current}
                                                        onChange={(e) => setEditingTag({ ...editingTag, current: e.target.value })}
                                                        className="w-full px-2 py-1 border border-indigo-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEditTag()}
                                                    />
                                                    <button onClick={handleSaveEditTag} className="text-green-600 hover:text-green-700"><CheckIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingTag(null)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-4 h-4" /></button>
                                                </div>
                                            ) : (
                                                <span className="font-medium text-slate-700">{name}</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {recommendedTags.includes(name) ? (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">推荐</span>
                                            ) : (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">自定义</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-slate-600">
                                            {count} 条
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleStartEditTag(name)}
                                                    className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"
                                                    title="重命名"
                                                >
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteTagSystemWide(name)}
                                                    className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                                                    title="删除"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors">取消</button>
          <button onClick={handleSaveAll} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
              {activeTab === 'categories' ? '保存分类更改' : '完成'}
          </button>
        </div>
      </div>
    </div>
  );
};
