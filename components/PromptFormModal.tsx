
import React, { useState, useEffect } from 'react';
import { XIcon, StarIcon, ChevronDownIcon, CubeIcon } from './Icons';
import { Prompt, CategoryTree } from '../types';
import { storageService } from '../services/storageService';
import { DEFAULT_ATTRIBUTES } from '../constants';

interface PromptFormModalProps {
  isOpen: boolean;
  editingPrompt?: Prompt | null;
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
  categoryTree: CategoryTree;
  attributes: typeof DEFAULT_ATTRIBUTES;
}

export const PromptFormModal: React.FC<PromptFormModalProps> = ({ isOpen, editingPrompt, onClose, onSave, categoryTree, attributes }) => {
  const [formData, setFormData] = useState<Partial<Prompt>>({
    title: '',
    content: '',
    category: '',
    subCategory: '',
    rating: 3,
    tags: [],
    // Advanced
    source: '原创',
    author: '我',
    parameterType: '无参数',
    model: '任意'
  });

  const [tagInput, setTagInput] = useState('');
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(true);

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
                tags: [],
                source: '原创',
                author: '我',
                parameterType: '无参数',
                model: '任意'
            });
        }
    }
  }, [editingPrompt, isOpen, categoryTree]);

  // Auto-detect Parameter Type
  useEffect(() => {
      if (formData.content) {
          const paramCount = (formData.content.match(/{{.*?}}/g) || []).length + (formData.content.match(/\[.*?\]/g) || []).length;
          let type = '无参数';
          if (paramCount === 1) type = '单参数';
          if (paramCount > 1) type = '多参数';
          
          if (formData.parameterType !== type) {
              setFormData(prev => ({ ...prev, parameterType: type as any }));
          }
      }
  }, [formData.content]);

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
      // Advanced
      source: formData.source,
      author: formData.author,
      parameterType: formData.parameterType as any,
      agentPlatform: formData.agentPlatform,
      scenario: formData.scenario,
      model: formData.model
    };

    onSave(newPrompt);
    onClose();
  };

  const subCategories = formData.category ? (categoryTree[formData.category] || []) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#EFF3F6]/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="neu-flat rounded-2xl w-full max-w-6xl flex flex-col h-[90vh] md:h-auto md:min-h-[80vh] overflow-hidden relative">
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 px-8 py-6 shrink-0">
                <h2 className="text-2xl font-black text-slate-700 tracking-tight">
                    {editingPrompt ? '编辑提示词' : '创建新提示词'}
                </h2>
                <div className="flex items-center gap-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="neu-btn px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800"
                    >
                        取消
                    </button>
                    <button 
                        type="submit" 
                        className="neu-btn neu-btn-primary px-8 py-2.5 text-sm font-bold tracking-wide"
                    >
                        保存
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    
                    {/* Left: Content */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex flex-col">
                            <label className="text-slate-600 text-sm font-bold mb-3 ml-1">标题</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full neu-pressed rounded-xl px-5 h-14 text-slate-700 font-medium text-lg placeholder:text-slate-400 focus:outline-none"
                                placeholder="输入提示词标题..."
                            />
                        </div>

                        <div className="flex flex-col flex-1 min-h-[400px]">
                            <label className="text-slate-600 text-sm font-bold mb-3 ml-1">内容</label>
                            <textarea
                                required
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full flex-1 neu-pressed rounded-xl p-5 text-slate-700 font-mono leading-relaxed placeholder:text-slate-400 focus:outline-none resize-none"
                                placeholder="输入提示词详细内容..."
                            />
                        </div>
                    </div>

                    {/* Right: Properties */}
                    <div className="lg:col-span-1 flex flex-col gap-8 lg:pl-4">
                        
                        {/* 1. Classification */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">基础分类</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-slate-500 text-xs font-bold mb-2 block">一级领域</label>
                                    <select
                                        value={formData.category}
                                        onChange={handleCategoryChange}
                                        className="w-full neu-pressed rounded-lg h-12 px-4 text-slate-600 outline-none"
                                    >
                                        {Object.keys(categoryTree).map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-slate-500 text-xs font-bold mb-2 block">二级子类</label>
                                    <select
                                        value={formData.subCategory}
                                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                        className="w-full neu-pressed rounded-lg h-12 px-4 text-slate-600 outline-none disabled:opacity-50"
                                        disabled={subCategories.length === 0}
                                    >
                                        {subCategories.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 2. Advanced Properties (6-Dimensions) */}
                        <div className="space-y-4">
                            <div 
                                className="flex items-center justify-between cursor-pointer group"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                            >
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                                    高级属性 (6维)
                                </h3>
                                <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                            </div>
                            
                            {showAdvanced && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="col-span-1">
                                        <label className="text-slate-500 text-xs font-bold mb-1 block">来源</label>
                                        <input 
                                            list="source-options"
                                            value={formData.source}
                                            onChange={(e) => setFormData({...formData, source: e.target.value})}
                                            className="w-full neu-pressed rounded-lg h-10 px-3 text-sm" 
                                            placeholder="如: Way2agi"
                                        />
                                        <datalist id="source-options">{attributes.sources.map(o => <option key={o} value={o} />)}</datalist>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-slate-500 text-xs font-bold mb-1 block">作者</label>
                                        <input 
                                            list="author-options"
                                            value={formData.author}
                                            onChange={(e) => setFormData({...formData, author: e.target.value})}
                                            className="w-full neu-pressed rounded-lg h-10 px-3 text-sm" 
                                        />
                                        <datalist id="author-options">{attributes.authors.map(o => <option key={o} value={o} />)}</datalist>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-slate-500 text-xs font-bold mb-1 block">参数</label>
                                        <select 
                                            value={formData.parameterType}
                                            onChange={(e) => setFormData({...formData, parameterType: e.target.value as any})}
                                            className="w-full neu-pressed rounded-lg h-10 px-3 text-sm outline-none"
                                        >
                                            {attributes.parameterTypes.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-slate-500 text-xs font-bold mb-1 block">模型</label>
                                        <input 
                                            list="model-options"
                                            value={formData.model}
                                            onChange={(e) => setFormData({...formData, model: e.target.value})}
                                            className="w-full neu-pressed rounded-lg h-10 px-3 text-sm" 
                                        />
                                        <datalist id="model-options">{attributes.models.map(o => <option key={o} value={o} />)}</datalist>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-slate-500 text-xs font-bold mb-1 block">智能体</label>
                                        <input 
                                            list="agent-options"
                                            value={formData.agentPlatform}
                                            onChange={(e) => setFormData({...formData, agentPlatform: e.target.value})}
                                            className="w-full neu-pressed rounded-lg h-10 px-3 text-sm" 
                                            placeholder="选填"
                                        />
                                        <datalist id="agent-options">{attributes.agentPlatforms.map(o => <option key={o} value={o} />)}</datalist>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-slate-500 text-xs font-bold mb-1 block">场景</label>
                                        <input 
                                            list="scenario-options"
                                            value={formData.scenario}
                                            onChange={(e) => setFormData({...formData, scenario: e.target.value})}
                                            className="w-full neu-pressed rounded-lg h-10 px-3 text-sm" 
                                            placeholder="选填"
                                        />
                                        <datalist id="scenario-options">{attributes.scenarios.map(o => <option key={o} value={o} />)}</datalist>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Tags */}
                        <div className="space-y-4">
                             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">标签</h3>
                             <div className="neu-pressed rounded-xl p-3 flex flex-wrap gap-2 min-h-[60px] content-start">
                                {(formData.tags || []).map(tag => (
                                    <span key={tag} className="neu-tag px-3 py-1 text-sm font-medium text-indigo-600 flex items-center gap-1">
                                        #{tag}
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)} 
                                            className="hover:text-red-500 transition-colors"
                                        >
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                <input 
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="输入回车..."
                                    className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none min-w-[80px] flex-1"
                                />
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {recommendedTags.slice(0, 5).map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleAddTag(tag)}
                                        disabled={(formData.tags || []).includes(tag)}
                                        className="neu-btn px-3 py-1 text-xs text-slate-500 hover:text-indigo-600 disabled:opacity-50"
                                    >
                                        {tag}
                                    </button>
                                ))}
                             </div>
                        </div>

                        {/* 4. Rating */}
                        <div className="space-y-4 mt-auto">
                             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">评级</h3>
                             <div className="flex items-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="focus:outline-none hover:scale-110 transition-transform"
                                    >
                                        <StarIcon filled={(formData.rating || 0) >= star} className={`w-8 h-8 ${ (formData.rating || 0) >= star ? 'text-amber-400 drop-shadow-md' : 'text-slate-300'}`} />
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
