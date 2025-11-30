
import React, { useState } from 'react';
import { PromptFilter } from '../types';
import { ChevronDownIcon, ChevronRightIcon, FilterIcon, SettingsIcon } from './Icons';
import { DEFAULT_ATTRIBUTES } from '../constants';

interface AdvancedFilterProps {
  filter: PromptFilter;
  onChange: (newFilter: PromptFilter) => void;
  availableOptions: typeof DEFAULT_ATTRIBUTES;
  onManage: () => void;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ filter, onChange, availableOptions, onManage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      ...filter,
      source: undefined,
      author: undefined,
      parameterType: undefined,
      agentPlatform: undefined,
      scenario: undefined,
      model: undefined
    });
  };

  const hasActiveFilters = filter.source || filter.author || filter.parameterType || filter.agentPlatform || filter.scenario || filter.model;

  const toggleFilter = (key: keyof PromptFilter, value: string) => {
    const currentValue = filter[key];
    onChange({
      ...filter,
      [key]: currentValue === value ? undefined : value
    });
  };

  const FilterSection = ({ 
    title, 
    options, 
    selectedValue, 
    filterKey 
  }: { 
    title: string, 
    options: string[], 
    selectedValue?: string, 
    filterKey: keyof PromptFilter 
  }) => (
    <div className="flex flex-col gap-3">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{title}</h4>
      <div className="neu-pressed rounded-xl p-3 flex flex-wrap gap-2 content-start min-h-[60px]">
        {options.map(opt => {
          const isSelected = selectedValue === opt;
          return (
            <button
              key={opt}
              onClick={() => toggleFilter(filterKey, opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border border-transparent ${
                isSelected 
                  ? 'bg-indigo-500 text-white shadow-inner shadow-black/20 translate-y-[1px]' 
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50'
              }`}
            >
              {opt}
            </button>
          );
        })}
        {options.length === 0 && <span className="text-xs text-slate-400 italic p-1">暂无选项</span>}
      </div>
    </div>
  );

  return (
    <div className="mb-6 px-4">
      <div className="flex items-center gap-2 mb-2">
         <div 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex-1 neu-btn flex items-center justify-between px-6 py-4 cursor-pointer select-none transition-all ${isOpen ? 'neu-pressed' : ''}`}
        >
            <div className="flex items-center gap-3 text-slate-600">
            <div className={`p-1.5 rounded-lg ${hasActiveFilters ? 'text-indigo-500 bg-indigo-50' : 'text-slate-400'}`}>
                <FilterIcon className="w-5 h-5" />
            </div>
            <div>
                <span className="font-bold text-sm block">高级筛选器</span>
                <span className="text-xs text-slate-400 font-medium">按来源、模型、作者等 6 维检索</span>
            </div>
            </div>
            
            <div className="flex items-center gap-4">
                {hasActiveFilters && (
                    <button 
                        onClick={handleReset}
                        className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline px-2"
                    >
                        清除筛选
                    </button>
                )}
                {isOpen ? <ChevronDownIcon className="w-5 h-5 text-slate-400" /> : <ChevronRightIcon className="w-5 h-5 text-slate-400" />}
            </div>
        </div>
        
        {/* Manage Button */}
        {isOpen && (
             <button 
                onClick={onManage}
                className="neu-btn px-4 py-4 h-full text-slate-400 hover:text-indigo-600 flex flex-col items-center justify-center gap-1"
                title="管理属性"
            >
                <SettingsIcon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">管理</span>
            </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <FilterSection 
                title="来源渠道" 
                options={availableOptions.sources} 
                selectedValue={filter.source} 
                filterKey="source" 
            />
            <FilterSection 
                title="大模型" 
                options={availableOptions.models} 
                selectedValue={filter.model} 
                filterKey="model" 
            />
            <FilterSection 
                title="参数类型" 
                options={availableOptions.parameterTypes} 
                selectedValue={filter.parameterType} 
                filterKey="parameterType" 
            />
            <FilterSection 
                title="应用场景" 
                options={availableOptions.scenarios} 
                selectedValue={filter.scenario} 
                filterKey="scenario" 
            />
            <FilterSection 
                title="智能体平台" 
                options={availableOptions.agentPlatforms} 
                selectedValue={filter.agentPlatform} 
                filterKey="agentPlatform" 
            />
            <FilterSection 
                title="作者 / 贡献者" 
                options={availableOptions.authors} 
                selectedValue={filter.author} 
                filterKey="author" 
            />
          </div>
        </div>
      )}
    </div>
  );
};
