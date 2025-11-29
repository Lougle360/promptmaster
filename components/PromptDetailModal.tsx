
import React, { useState } from 'react';
import { XIcon, CopyIcon, StarIcon, CheckIcon, EditIcon, TrashIcon, ChevronRightIcon } from './Icons';
import { Prompt } from '../types';
import { CATEGORY_COLORS } from '../constants';

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

  // Safe color lookup
  const colorClass = CATEGORY_COLORS[prompt.category] || 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div className="pr-8 w-full">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                {prompt.category}
              </span>
              <ChevronRightIcon className="w-3 h-3 text-slate-300" />
              <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                {prompt.subCategory}
              </span>
              <div className="flex items-center text-amber-400 ml-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <StarIcon key={star} filled={star <= prompt.rating} className="w-4 h-4" />
                ))}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-3">{prompt.title}</h2>
            
            {/* Tags Display */}
            {prompt.tags && prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {prompt.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
            <XIcon className="w-8 h-8" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="prose prose-slate max-w-none whitespace-pre-wrap font-mono text-sm bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-slate-700">
            {prompt.content}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-white rounded-b-xl flex justify-between items-center">
            <div className="flex gap-2">
                 <button 
                    onClick={() => { onClose(); onEdit(prompt); }}
                    className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium border border-transparent hover:border-slate-200"
                >
                    <EditIcon className="w-5 h-5" />
                    编辑
                </button>
                <button 
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium border border-transparent hover:border-red-100"
                >
                    <TrashIcon className="w-5 h-5" />
                    删除
                </button>
            </div>
         
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white transition-all transform active:scale-95 shadow-lg ${
                copied ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {copied ? (
              <>
                <CheckIcon className="w-5 h-5" /> 已复制!
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
