
import React, { useState, useEffect } from 'react';
import { XIcon, StarIcon } from './Icons';
import { Prompt, CategoryTree } from '../types';
import { storageService } from '../services/storageService';

interface PromptFormModalProps {
  isOpen: boolean;
  editingPrompt?: Prompt | null;
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
  categoryTree: CategoryTree;
}

export const PromptFormModal: React.FC<PromptFormModalProps> = ({ isOpen, editingPrompt, onClose, onSave, categoryTree }) => {
  const [formData, setFormData] = useState<Partial<Prompt>>({
    title: '',
    content: '',
    category: '',
    subCategory: '',
    rating: 3,
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
        setRecommendedTags(storageService.getRecommendedTags());
        
        if (editingPrompt) {
            setFormData({
                ...editingPrompt,
                tags: editingPrompt.tags || []
            });
        } else {
            const defaultCategory = Object.keys(categoryTree)[0] || '';
            const defaultSubCategory = categoryTree[defaultCategory]?.[0] || '';
            setFormData({
                title: '',
                content: '',
                category: defaultCategory,
                subCategory: defaultSubCategory,
                rating: 3,
                tags: []
            });
        }
    }
  }, [editingPrompt, isOpen, categoryTree]);

  if (!isOpen) return null;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value;
    const availableSubs = categoryTree[newCat] || [];
    setFormData({
        ...formData,
        category: newCat,
        subCategory: availableSubs[0] || ''
    });
  };

  const handleAddTag = (tagToAdd: string) => {
      const tag = tagToAdd.trim();
      if (!tag) return;
      const currentTags = formData.tags || [];
      if (!currentTags.includes(tag)) {
          setFormData({ ...formData, tags: [...currentTags, tag] });
      }
      setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
      setFormData({
          ...formData,
          tags: (formData.tags || []).filter(t => t !== tagToRemove)
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          handleAddTag(tagInput);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.category) return;

    const newPrompt: Prompt = {
      id: editingPrompt ? editingPrompt.id : storageService.generateId(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      subCategory: formData.subCategory || '通用',
      rating: formData.rating || 3,
      tags: formData.tags || [],
      createdAt: editingPrompt ? editingPrompt.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSave(newPrompt);
    onClose();
  };

  const subCategories = formData.category ? (categoryTree[formData.category] || []) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col h-[90vh] md:h-auto md:min-h-[80vh] border border-slate-200 overflow-hidden relative">
        
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            
            {/* Header Area */}
            <div className="flex flex-wrap justify-between items-center gap-4 px-8 py-6 bg-white border-b border-slate-200 shrink-0">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                    {editingPrompt ? '编辑提示词' : '创建新提示词'}
                </h2>
                <div className="flex items-center gap-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="flex items-center justify-center min-w-[84px] h-10 px-4 rounded-lg bg-white border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        type="submit" 
                        className="flex items-center justify-center min-w-[120px] h-10 px-4 rounded-lg bg-indigo-600 text-white text-sm font-bold tracking-wide hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        保存提示词
                    </button>
                </div>
            </div>

            {/* Main Grid Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    
                    {/* Left Column: Main Inputs */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Title */}
                        <div className="flex flex-col">
                            <label className="text-slate-800 text-base font-medium mb-2" htmlFor="prompt-title">
                                标题
                            </label>
                            <input
                                id="prompt-title"
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 h-14 rounded-lg border border-slate-300 bg-white text-slate-900 text-base focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="例如：生成高转化率的营销邮件标题"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 min-h-[400px]">
                            <label className="text-slate-800 text-base font-medium mb-2" htmlFor="prompt-content">
                                提示词内容
                            </label>
                            <textarea
                                id="prompt-content"
                                required
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full flex-1 p-4 rounded-lg border border-slate-300 bg-white text-slate-900 text-base font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                                placeholder="在此详细描述您的提示词指令..."
                            />
                        </div>
                    </div>

                    {/* Right Column: Properties Sidebar */}
                    <div className="lg:col-span-1 flex flex-col gap-6 lg:border-l lg:pl-8 border-slate-200">
                        <div className="border-b border-slate-200 pb-2">
                             <h3 className="text-lg font-bold text-slate-800 tracking-tight">属性设置</h3>
                        </div>

                        {/* Category */}
                        <div className="flex flex-col">
                            <label className="text-slate-700 text-base font-medium mb-2">
                                一级领域
                            </label>
                            <select
                                value={formData.category}
                                onChange={handleCategoryChange}
                                className="w-full px-4 h-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-base focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                                {Object.keys(categoryTree).map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* SubCategory */}
                        <div className="flex flex-col">
                            <label className="text-slate-700 text-base font-medium mb-2">
                                二级子类
                            </label>
                            <select
                                value={formData.subCategory}
                                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                className="w-full px-4 h-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-base focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                                disabled={subCategories.length === 0}
                            >
                                {subCategories.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-col gap-2">
                             <label className="text-slate-700 text-base font-medium">标签</label>
                             {/* Tag Input Container */}
                             <div className="flex w-full flex-wrap gap-2 p-2 rounded-lg border border-slate-300 bg-white min-h-[56px] focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
                                {(formData.tags || []).map(tag => (
                                    <span key={tag} className="flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100">
                                        {tag}
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)} 
                                            className="text-indigo-400 hover:text-indigo-700 p-0.5 rounded-full hover:bg-indigo-100 transition-colors"
                                        >
                                            <XIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                                <input 
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={(formData.tags?.length || 0) === 0 ? "输入标签按回车..." : "添加..."}
                                    className="flex-1 bg-transparent p-1.5 text-slate-800 placeholder:text-slate-400 outline-none min-w-[80px]"
                                />
                             </div>
                             
                             {/* Recommended Tags */}
                             <div className="flex flex-wrap gap-2 mt-1">
                                {recommendedTags.slice(0, 8).map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleAddTag(tag)}
                                        disabled={(formData.tags || []).includes(tag)}
                                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                             </div>
                        </div>

                        {/* Rating */}
                        <div className="flex flex-col gap-2 mt-2">
                             <label className="text-slate-700 text-base font-medium">质量评级</label>
                             <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className={`focus:outline-none transition-transform hover:scale-110 ${
                                            (formData.rating || 0) >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'
                                        }`}
                                    >
                                        <StarIcon filled={(formData.rating || 0) >= star} className="w-8 h-8" />
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};
