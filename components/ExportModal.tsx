import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Prompt } from '../types';
import { XIcon, DownloadIcon, FileCodeIcon } from './Icons';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, prompts }) => {
  const [format, setFormat] = useState<'json' | 'csv' | 'xlsx'>('json');

  if (!isOpen) return null;

  const handleExport = () => {
    const filename = `prompt_master_export_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(prompts, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = ['ID', 'Title', 'Content', 'Category', 'SubCategory', 'Rating', 'Tags', 'Source', 'Author', 'Model', 'ParamType', 'Scenario'];
      const rows = prompts.map(p => [
        p.id,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${(p.content || '').replace(/"/g, '""')}"`,
        p.category,
        p.subCategory,
        p.rating,
        `"${(p.tags || []).join('|')}"`,
        p.source || '',
        p.author || '',
        p.model || '',
        p.parameterType || '',
        p.scenario || ''
      ].join(','));
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'xlsx') {
       const worksheet = XLSX.utils.json_to_sheet(prompts.map(p => ({
        ID: p.id,
        Title: p.title,
        Content: p.content,
        Category: p.category,
        SubCategory: p.subCategory,
        Rating: p.rating,
        Tags: (p.tags || []).join(', '),
        Source: p.source,
        Author: p.author,
        Model: p.model,
        ParameterType: p.parameterType,
        Scenario: p.scenario,
        CreatedAt: new Date(p.createdAt).toLocaleDateString(),
        UpdatedAt: new Date(p.updatedAt).toLocaleDateString()
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Prompts");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#EFF3F6]/80 backdrop-blur-sm p-4">
      <div className="neu-flat rounded-2xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-700">导出数据</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">选择格式</label>
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => setFormat('json')}
                className={`neu-btn flex flex-col items-center justify-center p-4 gap-2 transition-all ${format === 'json' ? 'neu-pressed text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                <FileCodeIcon className="w-6 h-6" />
                <span className="text-xs font-bold">JSON</span>
              </button>
              <button 
                onClick={() => setFormat('csv')}
                className={`neu-btn flex flex-col items-center justify-center p-4 gap-2 transition-all ${format === 'csv' ? 'neu-pressed text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                <FileCodeIcon className="w-6 h-6" />
                <span className="text-xs font-bold">CSV</span>
              </button>
              <button 
                onClick={() => setFormat('xlsx')}
                className={`neu-btn flex flex-col items-center justify-center p-4 gap-2 transition-all ${format === 'xlsx' ? 'neu-pressed text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                <DownloadIcon className="w-6 h-6" />
                <span className="text-xs font-bold">Excel</span>
              </button>
            </div>
          </div>

          <div className="neu-pressed p-4 rounded-xl text-xs text-slate-500">
             <p className="mb-1"><span className="font-bold">JSON:</span> 完整备份，包含所有元数据，适合迁移。</p>
             <p className="mb-1"><span className="font-bold">Excel:</span> 适合在 Excel/WPS 中查看和编辑。</p>
             <p><span className="font-bold">CSV:</span> 通用表格格式，兼容性最好。</p>
          </div>
        </div>

        <div className="p-6 bg-[#EFF3F6] border-t border-slate-200/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors">取消</button>
          <button onClick={handleExport} className="neu-btn neu-btn-primary px-6 py-2 rounded-xl font-bold flex items-center gap-2">
            <DownloadIcon className="w-5 h-5" />
            确认导出
          </button>
        </div>
      </div>
    </div>
  );
};