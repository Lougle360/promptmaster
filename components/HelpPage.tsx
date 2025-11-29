
import React from 'react';
import { SupportIcon } from './Icons';

export const HelpPage: React.FC = () => {
  const faqs = [
    {
      q: "我的数据存在哪里？会上传到云端吗？",
      a: "不会。PromptMaster 是纯本地应用。所有数据存储在您浏览器的 LocalStorage 中。只要不清除浏览器缓存，数据会一直保存。"
    },
    {
      q: "如何备份我的数据？",
      a: "目前建议定期通过复制关键内容或截屏保存。您可以联系技术支持获取 JSON 格式导出的协助。"
    },
    {
      q: "Markdown 导入支持图片吗？",
      a: "目前仅支持纯文本导入，Markdown 文件中的图片链接会被保留，但无法直接上传图片文件到本地存储。"
    },
    {
      q: "如何自定义分类？",
      a: "点击侧边栏“领域分类”旁边的齿轮图标，进入知识库设置，即可添加、重命名或删除分类。"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 w-full">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4 text-indigo-600">
            <SupportIcon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">帮助中心</h1>
        <p className="text-slate-500 mt-2">遇到问题？这里有您需要的答案。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
            <h3 className="font-bold text-slate-800 mb-2">入门指南</h3>
            <p className="text-sm text-slate-500 mb-4">了解如何快速开始使用 PromptMaster 构建您的知识库。</p>
            <a href="#" className="text-indigo-600 text-sm font-medium hover:underline">查看文档 &rarr;</a>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
            <h3 className="font-bold text-slate-800 mb-2">功能反馈</h3>
            <p className="text-sm text-slate-500 mb-4">有好的建议？或者发现了 Bug？请告诉我们。</p>
            <a href="#" className="text-indigo-600 text-sm font-medium hover:underline">提交反馈 &rarr;</a>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
            <h3 className="font-bold text-slate-800 mb-2">联系支持</h3>
            <p className="text-sm text-slate-500 mb-4">需要人工协助？请发送邮件至我们的支持团队。</p>
            <a href="mailto:support@promptmaster.com" className="text-indigo-600 text-sm font-medium hover:underline">support@promptmaster.com</a>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">常见问题 (FAQ)</h2>
        </div>
        <div className="divide-y divide-slate-100">
            {faqs.map((faq, index) => (
                <div key={index} className="p-6">
                    <h4 className="text-base font-medium text-slate-900 mb-2">{faq.q}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
            ))}
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-slate-400">
          PromptMaster v1.0.0
      </div>
    </div>
  );
};
