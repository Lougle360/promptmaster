
import React, { useState } from 'react';
import { XIcon, CopyIcon, StarIcon, CheckIcon, EditIcon, TrashIcon, ChevronRightIcon, CubeIcon } from './Icons';
import { Prompt } from '../types';

interface PromptDetailModalProps {
  prompt: Prompt | null;
  onClose: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ prompt, onClose, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (confirm('确定要删除这条提示词吗？此操作无法撤销。')) {
      onDelete(prompt.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#EFF3F6]/80 backdrop-blur-sm p-4">
      <div className="neu-flat rounded-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start shrink-0">
          <div className="pr-8 w-full">
            {/* Breadcrumb & Rating */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="neu-pressed px-3 py-1 rounded-full text-xs font-bold text-indigo-500">
                {prompt.category}
              </span>
              <ChevronRightIcon className="w-3 h-3 text-slate-300" />
              <span className="text-xs font-medium text-slate-500">
                {prompt.subCategory}
              </span>
              <div className="flex items-center text-amber-400 ml-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <StarIcon key={star} filled={star <= prompt.rating} className="w-4 h-4" />
                ))}
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-slate-700 leading-tight mb-4">{prompt.title}</h2>
            
            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {prompt.tags.map(tag => (
                        <span key={tag} className="text-xs px-3 py-1 neu-tag text-slate-600 font-medium">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
          </div>
          <button onClick={onClose} className="neu-btn p-2 text-slate-400 hover:text-slate-600 shrink-0">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Metadata Grid (Advanced Fields) */}
        <div className="px-8 py-2">
          <div className="neu-pressed rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
             <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">来源</span>
                <span className="text-sm font-semibold text-slate-700">{prompt.source || '未指定'}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">作者</span>
                <span className="text-sm font-semibold text-slate-700">{prompt.author || '未知'}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">参数类型</span>
                <span className="text-sm font-semibold text-slate-700">{prompt.parameterType || '无参数'}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">大模型</span>
                <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                    <CubeIcon className="w-4 h-4 text-indigo-400" />
                    {prompt.model || '通用'}
                </div>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">智能体平台</span>
                <span className="text-sm font-semibold text-slate-700">{prompt.agentPlatform || '-'}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">场景</span>
                <span className="text-sm font-semibold text-slate-700">{prompt.scenario || '-'}</span>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          <div className="neu-pressed p-6 rounded-xl text-slate-700 font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-indigo-100">
            {prompt.content}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 flex justify-between items-center bg-[#EFF3F6] border-t border-slate-200/50">
            <div className="flex gap-4">
                 <button 
                    onClick={() => { onClose(); onEdit(prompt); }}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
                >
                    <EditIcon className="w-5 h-5" />
                    编辑
                </button>
                <button 
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 font-medium transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                    删除
                </button>
            </div>
         
          <button 
            onClick={handleCopy}
            className={`neu-btn flex items-center gap-2 px-6 py-3 font-bold transition-all ${
                copied ? 'text-green-600' : 'text-indigo-600'
            }`}
          >
            {copied ? (
              <>
                <CheckIcon className="w-5 h-5" /> 已复制
              </>
            ) : (
              <>
                <CopyIcon className="w-5 h-5" /> 复制内容
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
