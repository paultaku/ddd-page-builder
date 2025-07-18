import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit3, Eye, Download, Upload, Save } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                DDD Page Builder
              </h1>
            </div>
            <Button asChild>
              <a href="/editor">
                <Edit3 className="w-4 h-4 mr-2" />
                开始编辑
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 英雄区域 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            可视化页面编辑器
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            基于 Next.js、React、TailwindCSS 和 GrapeJS 构建的现代化页面编辑器。
            拖拽式编辑，实时预览，支持响应式设计。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/editor">
                <Edit3 className="w-5 h-5 mr-2" />
                立即开始
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">了解更多</a>
            </Button>
          </div>
        </div>

        {/* 功能特性 */}
        <div
          id="features"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Edit3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              可视化编辑
            </h3>
            <p className="text-gray-600">
              基于 GrapeJS 的可视化编辑器，支持拖拽式组件编辑和实时预览。
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Save className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              数据管理
            </h3>
            <p className="text-gray-600">
              本地存储保存/加载，导入/导出 HTML 文件，项目状态持久化。
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              实时预览
            </h3>
            <p className="text-gray-600">
              实时预览功能，支持响应式设计，所见即所得的编辑体验。
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              导入导出
            </h3>
            <p className="text-gray-600">
              支持导入/导出 HTML 和 JSON 文件，方便项目迁移和分享。
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">组件库</h3>
            <p className="text-gray-600">
              丰富的组件库，包括文本、图片、按钮、卡片等常用组件。
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              TailwindCSS
            </h3>
            <p className="text-gray-600">
              内置 TailwindCSS 支持，现代化的样式系统和响应式设计。
            </p>
          </div>
        </div>

        {/* 技术栈 */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            技术栈
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">N</span>
              </div>
              <h3 className="font-semibold text-gray-900">Next.js</h3>
              <p className="text-sm text-gray-600">15.4.1</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">R</span>
              </div>
              <h3 className="font-semibold text-gray-900">React</h3>
              <p className="text-sm text-gray-600">19.1.0</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-cyan-600 font-bold">T</span>
              </div>
              <h3 className="font-semibold text-gray-900">TailwindCSS</h3>
              <p className="text-sm text-gray-600">4.0</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">G</span>
              </div>
              <h3 className="font-semibold text-gray-900">GrapeJS</h3>
              <p className="text-sm text-gray-600">Studio SDK</p>
            </div>
          </div>
        </div>

        {/* CTA 区域 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            准备开始创建了吗？
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            立即体验现代化的页面编辑器，创建精美的网页。
          </p>
          <Button size="lg" asChild>
            <a href="/editor">
              <Edit3 className="w-5 h-5 mr-2" />
              开始编辑页面
            </a>
          </Button>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2024 DDD Page Builder. 基于 Next.js 和 GrapeJS 构建。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
