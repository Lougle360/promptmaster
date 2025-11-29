
import React, { useState } from 'react';
import { XIcon, UploadIcon, CheckIcon } from './Icons';
import { Prompt, CategoryTree } from '../types';
import { storageService } from '../services/storageService';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (newPrompts: Prompt[]) => void;
  categoryTree: CategoryTree;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportComplete, categoryTree }) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'markdown'>('csv');
  
  // CSV State
  const [csvContent, setCsvContent] = useState('');
  
  // Markdown State
  const [mdFiles, setMdFiles] = useState<File[]>([]);
  
  // Shared Preview
  const [preview, setPreview] = useState<Partial<Prompt>[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // --- CSV Handlers ---
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) throw new Error("CSV 文件为空或缺少表头");

      const parsedData: Partial<Prompt>[] = lines.slice(1).map((line) => {
        const parts: string[] = [];
        let currentPart = '';
        let inQuotes = false;
        
        for(let i=0; i<line.length; i++) {
            const char = line[i];
            if(char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) {
                parts.push(currentPart.trim());
                currentPart = '';
            } else currentPart += char;
        }
        parts.push(currentPart.trim());

        const cleanParts = parts.map(p => p.replace(/^"|"$/g, '').replace(/""/g, '"'));

        if (cleanParts.length < 2) return null;

        const title = cleanParts[0];
        const content = cleanParts[1];
        let category = cleanParts[2] || '其他';
        let subCategory = cleanParts[3] || '通用';
        const ratingStr = cleanParts[4] || '1';
        
        // Tags can be 6th column, comma separated
        const tagsStr = cleanParts[5] || '';
        const tags = tagsStr ? tagsStr.split('|').map(t => t.trim()) : [];

        if (!categoryTree[category]) {
            category = '其他';
            subCategory = '通用';
        }

        return { title, content, category, subCategory, rating: parseInt(ratingStr) || 1, tags };
      }).filter(Boolean) as Partial<Prompt>[];

      setPreview(parsedData);
      setError(null);
    } catch (err) {
      setError("CSV 解析失败。请检查格式。");
    }
  };

  // --- Markdown Handlers ---
  const handleMdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files).slice(0, 8); // Max 8
          setMdFiles(files);
          
          const newPreviews: Partial<Prompt>[] = [];
          
          for (const file of files) {
              const text = await file.text();
              const fileName = file.name.replace(/\.md$/i, '');
              
              // Simple parser: Title is filename or first header
              let title = fileName;
              let content = text;
              
              // Check for first line header
              const lines = text.split('\n');
              if (lines[0].startsWith('# ')) {
                  title = lines[0].substring(2).trim();
                  content = lines.slice(1).join('\n').trim();
              }
              
              newPreviews.push({
                  title,
                  content,
                  category: '其他',
                  subCategory: '通用',
                  rating: 3,
                  tags: []
              });
          }
          setPreview(newPreviews);
          setError(null);
      }
  };

  const handleImport = () => {
    const newPrompts: Prompt[] = preview.map(p => ({
      id: storageService.generateId(),
      title: p.title || '无标题',
      content: p.content || '',
      category: p.category || '其他',
      subCategory: p.subCategory || '通用',
      rating: p.rating || 1,
      tags: p.tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));

    onImportComplete(newPrompts);
    setPreview([]);
    setCsvContent('');
    setMdFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">批量导入提示词</h2>
            <p className="text-sm text-slate-500">支持 CSV 表格或 Markdown 文档批量上传</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
            <button 
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'csv' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => { setActiveTab('csv'); setPreview([]); setError(null); }}
            >
                CSV 导入
            </button>
            <button 
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'markdown' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => { setActiveTab('markdown'); setPreview([]); setError(null); }}
            >
                Markdown 导入
            </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!preview.length ? (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept={activeTab === 'csv' ? ".csv" : ".md"}
                multiple={activeTab === 'markdown'}
                onChange={activeTab === 'csv' ? handleCsvUpload : handleMdUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadIcon className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-700">
                  {activeTab === 'csv' ? '点击上传 CSV 文件' : '拖拽或点击上传 .md 文件 (最多8个)'}
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                  {activeTab === 'csv' ? '格式: 标题, 内容, 分类, 子类, 星级, 标签(用|分隔)' : '文件名作为标题，文件内容作为提示词'}
              </p>
              {error && <p className="text-red-500 text-sm mt-4 font-medium">{error}</p>}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-slate-600">成功解析 {preview.length} 条</span>
                <button 
                  onClick={() => { setPreview([]); setCsvContent(''); setMdFiles([]); }}
                  className="text-sm text-red-500 hover:underline"
                >
                  清空并重新上传
                </button>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-500 font-medium">
                    <tr>
                      <th className="p-3">标题</th>
                      <th className="p-3">内容预览</th>
                      <th className="p-3 w-16">标签</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {preview.slice(0, 5).map((p, i) => (
                      <tr key={i}>
                        <td className="p-3 truncate max-w-xs">{p.title}</td>
                        <td className="p-3 truncate max-w-xs text-slate-500">{p.content}</td>
                        <td className="p-3 text-indigo-600">{p.tags?.length}个</td>
                      </tr>
                    ))}
                    {preview.length > 5 && (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-slate-500 italic">... 还有 {preview.length - 5} 条</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors">取消</button>
          <button 
            onClick={handleImport}
            disabled={preview.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
          >
            <CheckIcon className="w-4 h-4" />
            确认导入
          </button>
        </div>
      </div>
    </div>
  );
};
