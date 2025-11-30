
import React, { useState, useEffect, useMemo } from 'react';
import { XIcon, TrashIcon, EditIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon, CheckIcon, SearchIcon, SettingsIcon } from './Icons';
import { CategoryTree, Prompt } from '../types';
import { storageService } from '../services/storageService';
import { DEFAULT_ATTRIBUTES } from '../constants';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryTree: CategoryTree;
  onSave: (newTree: CategoryTree) => void;
  prompts: Prompt[];
  onUpdatePrompts: (prompts: Prompt[]) => void;
  initialTab?: string; // Changed to string to support more tabs
  attributes: typeof DEFAULT_ATTRIBUTES;
  onSaveAttributes: (newAttrs: typeof DEFAULT_ATTRIBUTES) => void;
}

type TabType = 'categories' | 'tags' | 'sources' | 'authors' | 'models' | 'agentPlatforms' | 'scenarios';

const TAB_CONFIG: Record<string, { label: string, icon: any }> = {
    categories: { label: '领域分类', icon: null },
    tags: { label: '标签库', icon: null },
    sources: { label: '来源渠道', icon: null },
    authors: { label: '作者/贡献者', icon: null },
    models: { label: '大模型', icon: null },
    agentPlatforms: { label: '智能体平台', icon: null },
    scenarios: { label: '应用场景', icon: null },
};

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ 
    isOpen, 
    onClose, 
    categoryTree, 
    onSave,
    prompts,
    onUpdatePrompts,
    initialTab = 'categories',
    attributes,
    onSaveAttributes
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  
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

  // --- Attributes State ---
  const [localAttributes, setLocalAttributes] = useState<typeof DEFAULT_ATTRIBUTES>(DEFAULT_ATTRIBUTES);
  const [newAttributeName, setNewAttributeName] = useState('');
  const [editingAttribute, setEditingAttribute] = useState<{original: string, current: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      // Init Categories
      setLocalTree(JSON.parse(JSON.stringify(categoryTree)));
      setCategories(Object.keys(categoryTree));
      setSelectedCategory(Object.keys(categoryTree)[0] || null);
      // Init Tags
      setRecommendedTags(storageService.getRecommendedTags());
      // Init Attributes
      setLocalAttributes(JSON.parse(JSON.stringify(attributes)));
    }
  }, [isOpen, categoryTree, initialTab, attributes]);

  // --- Helpers ---
  const getAttributeKey = (tab: string): keyof typeof DEFAULT_ATTRIBUTES | null => {
      if (['sources', 'authors', 'models', 'agentPlatforms', 'scenarios', 'parameterTypes'].includes(tab)) {
          return tab as keyof typeof DEFAULT_ATTRIBUTES;
      }
      return null;
  };

  // --- Categories Logic (Same as before) ---
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
        if (c === original) { newTree[newName] = localTree[original]; return newName; }
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

  // --- Tags Logic (Simplified) ---
  const allTagsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach(p => { if (p.tags) p.tags.forEach(t => counts[t] = (counts[t] || 0) + 1); });
    recommendedTags.forEach(t => { if (counts[t] === undefined) counts[t] = 0; });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [prompts, recommendedTags]);
  
  const handleAddRecommendedTag = () => {
      const tag = newTag.trim();
      if (!tag || recommendedTags.includes(tag)) return;
      setRecommendedTags([...recommendedTags, tag]);
      setNewTag('');
  };
  const handleStartEditTag = (tag: string) => setEditingTag({ original: tag, current: tag });
  const handleSaveEditTag = () => { /* ... simplified same as before ... */
      if (!editingTag) return;
      const { original, current } = editingTag;
      const newTagName = current.trim();
      if (!newTagName || newTagName === original) { setEditingTag(null); return; }
      if (!window.confirm(`确认重命名 "${original}" -> "${newTagName}" ?`)) return;
      const updatedPrompts = prompts.map(p => {
          if (p.tags && p.tags.includes(original)) {
              const newTags = Array.from(new Set(p.tags.map(t => t === original ? newTagName : t)));
              return { ...p, tags: newTags };
          }
          return p;
      });
      let updatedRecommended = [...recommendedTags];
      if (updatedRecommended.includes(original)) updatedRecommended = Array.from(new Set(updatedRecommended.map(t => t === original ? newTagName : t)));
      onUpdatePrompts(updatedPrompts);
      setRecommendedTags(updatedRecommended);
      setEditingTag(null);
  };
  const handleDeleteTagSystemWide = (tagToDelete: string) => {
      if (!window.confirm(`确认删除标签 "${tagToDelete}" ?`)) return;
      const updatedPrompts = prompts.map(p => {
          if (p.tags && p.tags.includes(tagToDelete)) return { ...p, tags: p.tags.filter(t => t !== tagToDelete) };
          return p;
      });
      onUpdatePrompts(updatedPrompts);
      setRecommendedTags(recommendedTags.filter(t => t !== tagToDelete));
  };

  // --- Attributes Logic ---
  const handleAddAttribute = () => {
      const key = getAttributeKey(activeTab);
      if (!key) return;
      const name = newAttributeName.trim();
      if (!name) return;
      if (localAttributes[key].includes(name)) { alert('已存在'); return; }
      setLocalAttributes({ ...localAttributes, [key]: [...localAttributes[key], name] });
      setNewAttributeName('');
  };

  const handleDeleteAttribute = (val: string) => {
      const key = getAttributeKey(activeTab);
      if (!key) return;
      if (!window.confirm(`确定要删除 "${val}" 吗?`)) return;
      setLocalAttributes({ ...localAttributes, [key]: localAttributes[key].filter(v => v !== val) });
  };
  
  const handleStartEditAttribute = (val: string) => setEditingAttribute({ original: val, current: val });
  
  const handleSaveEditAttribute = () => {
      const key = getAttributeKey(activeTab);
      if (!key || !editingAttribute) return;
      const { original, current } = editingAttribute;
      const newVal = current.trim();
      if (!newVal || newVal === original) { setEditingAttribute(null); return; }
      
      // Update local list
      const newList = localAttributes[key].map(v => v === original ? newVal : v);
      setLocalAttributes({ ...localAttributes, [key]: newList });
      
      // We don't verify usage counts for attributes here to keep it simple, but we could.
      // Assuming users manually update prompts if needed or we could do batch update like tags.
      // For this MVP, we just update the list.
      
      setEditingAttribute(null);
  };


  // --- Save All ---
  const handleSaveAll = () => {
      // 1. Categories
      const orderedTree: CategoryTree = {};
      categories.forEach(cat => orderedTree[cat] = localTree[cat]);
      onSave(orderedTree);
      // 2. Tags
      storageService.saveRecommendedTags(recommendedTags);
      // 3. Attributes
      onSaveAttributes(localAttributes);
      
      onClose();
  };

  if (!isOpen) return null;

  const currentAttrList = getAttributeKey(activeTab) ? localAttributes[getAttributeKey(activeTab)!] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">知识库设置</h2>
            <p className="text-sm text-slate-500">集中管理分类、标签及各类高级属性</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Menu */}
            <div className="w-48 bg-slate-50 border-r border-slate-200 overflow-y-auto py-2">
                <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">基础设置</div>
                <button 
                    onClick={() => setActiveTab('categories')}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-l-4 ${activeTab === 'categories' ? 'bg-white text-indigo-600 border-indigo-600 shadow-sm' : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                    领域分类
                </button>
                <button 
                    onClick={() => setActiveTab('tags')}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-l-4 ${activeTab === 'tags' ? 'bg-white text-indigo-600 border-indigo-600 shadow-sm' : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                    标签库
                </button>
                
                <div className="mt-4 px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">高级维度</div>
                {['sources', 'models', 'agentPlatforms', 'scenarios', 'authors'].map(key => (
                    <button 
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-l-4 ${activeTab === key ? 'bg-white text-indigo-600 border-indigo-600 shadow-sm' : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                        {TAB_CONFIG[key]?.label || key}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-white">
                {activeTab === 'categories' ? (
                     // --- CATEGORIES VIEW (Simplified reuse) ---
                    <div className="flex h-full">
                        <div className="w-1/2 border-r border-slate-200 flex flex-col">
                             <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2">
                                <input value={newCategoryName} onChange={e=>setNewCategoryName(e.target.value)} placeholder="新一级领域..." className="flex-1 px-2 py-1.5 text-sm border rounded" onKeyDown={e=>e.key==='Enter'&&handleAddCategory()} />
                                <button onClick={handleAddCategory} className="bg-indigo-600 text-white p-1.5 rounded"><PlusIcon className="w-5 h-5"/></button>
                             </div>
                             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {categories.map((cat, idx) => (
                                    <div key={cat} onClick={()=>setSelectedCategory(cat)} className={`p-2 flex justify-between rounded cursor-pointer ${selectedCategory===cat?'bg-indigo-50 text-indigo-700':'hover:bg-slate-50'}`}>
                                        {editingCategory?.original === cat ? (
                                            <input value={editingCategory.current} onChange={e=>setEditingCategory({...editingCategory, current:e.target.value})} className="border rounded px-1 w-full" autoFocus onKeyDown={e=>e.key==='Enter'&&handleSaveEditCategory()} onBlur={handleSaveEditCategory} />
                                        ) : <span>{cat}</span>}
                                        <div className="flex gap-1 text-slate-400">
                                            <button onClick={(e)=>{e.stopPropagation();handleStartEditCategory(cat)}}><EditIcon className="w-4 h-4"/></button>
                                            <button onClick={(e)=>{e.stopPropagation();handleDeleteCategory(cat)}}><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="w-1/2 flex flex-col">
                             <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2">
                                <input value={newSubCategoryName} onChange={e=>setNewSubCategoryName(e.target.value)} placeholder="新二级子类..." disabled={!selectedCategory} className="flex-1 px-2 py-1.5 text-sm border rounded disabled:bg-slate-100" onKeyDown={e=>e.key==='Enter'&&handleAddSubCategory()} />
                                <button onClick={handleAddSubCategory} disabled={!selectedCategory} className="bg-indigo-600 text-white p-1.5 rounded disabled:opacity-50"><PlusIcon className="w-5 h-5"/></button>
                             </div>
                             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {selectedCategory && localTree[selectedCategory]?.map((sub, idx) => (
                                    <div key={idx} className="p-2 flex justify-between rounded hover:bg-slate-50">
                                        <span>{sub}</span>
                                        <button onClick={()=>handleDeleteSubCategory(idx)} className="text-slate-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                ) : activeTab === 'tags' ? (
                    // --- TAGS VIEW ---
                     <div className="flex flex-col h-full">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-4">
                            <div className="flex-1 flex gap-2">
                                <input value={newTag} onChange={e=>setNewTag(e.target.value)} placeholder="添加推荐标签..." className="flex-1 px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-indigo-500" onKeyDown={e=>e.key==='Enter'&&handleAddRecommendedTag()} />
                                <button onClick={handleAddRecommendedTag} className="bg-indigo-600 text-white px-3 rounded"><PlusIcon className="w-5 h-5"/></button>
                            </div>
                            <div className="flex-1 relative">
                                <input value={tagSearch} onChange={e=>setTagSearch(e.target.value)} placeholder="搜索标签..." className="w-full pl-9 pr-3 py-2 text-sm border rounded focus:ring-2 focus:ring-indigo-500" />
                                <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-500 font-medium"><tr><th className="p-2">名称</th><th className="p-2">引用</th><th className="p-2 text-right">操作</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">
                                    {allTagsWithCounts.filter(t=>t.name.toLowerCase().includes(tagSearch.toLowerCase())).map(t => (
                                        <tr key={t.name}>
                                            <td className="p-2">
                                                {editingTag?.original === t.name ? (
                                                     <div className="flex gap-1"><input value={editingTag.current} onChange={e=>setEditingTag({...editingTag, current:e.target.value})} className="border rounded px-1" autoFocus onKeyDown={e=>e.key==='Enter'&&handleSaveEditTag()} /><button onClick={handleSaveEditTag}><CheckIcon className="w-4 h-4 text-green-600"/></button></div>
                                                ) : <span className={recommendedTags.includes(t.name) ? 'font-bold text-indigo-700' : ''}>{t.name}</span>}
                                            </td>
                                            <td className="p-2 text-slate-500">{t.count}</td>
                                            <td className="p-2 text-right space-x-2">
                                                <button onClick={()=>handleStartEditTag(t.name)} className="text-blue-400"><EditIcon className="w-4 h-4"/></button>
                                                <button onClick={()=>handleDeleteTagSystemWide(t.name)} className="text-red-400"><TrashIcon className="w-4 h-4"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    // --- ATTRIBUTES VIEW (Generic) ---
                    <div className="flex flex-col h-full">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <div className="flex gap-2">
                                <input value={newAttributeName} onChange={e=>setNewAttributeName(e.target.value)} placeholder={`添加新${TAB_CONFIG[activeTab]?.label || '项'}...`} className="flex-1 px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-indigo-500" onKeyDown={e=>e.key==='Enter'&&handleAddAttribute()} />
                                <button onClick={handleAddAttribute} className="bg-indigo-600 text-white px-3 rounded hover:bg-indigo-700"><PlusIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {currentAttrList.length === 0 ? <p className="text-center text-slate-400 py-10">暂无数据，请添加。</p> : (
                                <div className="grid grid-cols-2 gap-3">
                                    {currentAttrList.map((val) => (
                                        <div key={val} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 group">
                                            {editingAttribute?.original === val ? (
                                                <div className="flex gap-2 flex-1">
                                                    <input value={editingAttribute.current} onChange={e=>setEditingAttribute({...editingAttribute, current:e.target.value})} className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded outline-none" autoFocus onKeyDown={e=>e.key==='Enter'&&handleSaveEditAttribute()} />
                                                    <button onClick={handleSaveEditAttribute} className="text-green-600"><CheckIcon className="w-4 h-4"/></button>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-medium text-slate-700">{val}</span>
                                            )}
                                            
                                            <div className={`flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${editingAttribute?.original===val ? 'hidden' : ''}`}>
                                                <button onClick={()=>handleStartEditAttribute(val)} className="text-slate-400 hover:text-blue-600"><EditIcon className="w-4 h-4"/></button>
                                                <button onClick={()=>handleDeleteAttribute(val)} className="text-slate-400 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg">取消</button>
          <button onClick={handleSaveAll} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm">
              保存更改
          </button>
        </div>
      </div>
    </div>
  );
};
