"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Eye, RotateCcw } from "lucide-react";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";

export default function EditorPage() {
  const [editor, setEditor] = useState<unknown>(null);

  const handleSave = () => {
    if (
      editor &&
      typeof editor === "object" &&
      editor !== null &&
      "getHtml" in editor &&
      "getCss" in editor
    ) {
      const html = (editor as { getHtml: () => string }).getHtml();
      const css = (editor as { getCss: () => string }).getCss();
      console.log("HTML:", html);
      console.log("CSS:", css);
      // 这里可以添加保存到服务器的逻辑
      alert("页面已保存！");
    }
  };

  const handlePreview = () => {
    if (
      editor &&
      typeof editor === "object" &&
      editor !== null &&
      "getHtml" in editor &&
      "getCss" in editor
    ) {
      const html = (editor as { getHtml: () => string }).getHtml();
      const css = (editor as { getCss: () => string }).getCss();
      const previewWindow = window.open("", "_blank");
      if (previewWindow) {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>页面预览</title>
              <style>${css}</style>
            </head>
            <body>${html}</body>
          </html>
        `);
        previewWindow.document.close();
      }
    }
  };

  const handleReset = () => {
    if (
      editor &&
      typeof editor === "object" &&
      editor !== null &&
      "DomComponents" in editor &&
      "CssComposer" in editor &&
      "setComponents" in editor
    ) {
      if (confirm("确定要重置编辑器吗？这将清除所有内容。")) {
        (
          editor as { DomComponents: { clear: () => void } }
        ).DomComponents.clear();
        (editor as { CssComposer: { clear: () => void } }).CssComposer.clear();
        (
          editor as { setComponents: (components: string) => void }
        ).setComponents(
          '<div class="section"><h2>欢迎使用页面编辑器</h2><p>开始创建您的页面吧！</p></div>'
        );
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 工具栏 */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
        <h1 className="text-xl font-semibold">页面编辑器</h1>
        <div className="flex gap-2">
          <Button onClick={handleSave} variant="default">
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
          <Button onClick={handlePreview} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            预览
          </Button>
          <Button onClick={handleReset} variant="destructive">
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
        </div>
      </div>

      {/* 编辑器容器 */}
      <div className="flex-1">
        <StudioEditor
          onEditor={(editorInstance) => setEditor(editorInstance)}
        />
      </div>
    </div>
  );
}
