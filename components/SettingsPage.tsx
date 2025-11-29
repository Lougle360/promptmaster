
import React from 'react';
import { UserIcon, LockIcon } from './Icons';

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 w-full">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">账户设置</h1>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="bg-white shadow rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-medium text-slate-800">基本信息</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">用户名</label>
                    <input 
                        type="text" 
                        defaultValue="Alex Hartman" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">邮箱地址</label>
                    <input 
                        type="email" 
                        defaultValue="alex@promptmaster.com" 
                        disabled
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" 
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">职业/角色</label>
                    <input 
                        type="text" 
                        defaultValue="高级产品经理" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    保存修改
                </button>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white shadow rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <LockIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-medium text-slate-800">安全设置</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">当前密码</label>
                <input type="password" className="w-full md:w-1/2 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">新密码</label>
                    <input type="password" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">确认新密码</label>
                    <input type="password" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
            </div>
             <div className="flex justify-end">
                <button className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    更新密码
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
