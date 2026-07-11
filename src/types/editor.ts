// GrapeJS 编辑器实例接口
export interface EditorInstance {
  getHtml: () => string;
  getCss: () => string;
  DomComponents: {
    clear: () => void;
    add: (component: any) => void;
  };
  CssComposer: {
    clear: () => void;
    add: (style: any) => void;
  };
  setComponents: (components: string) => void;
  getComponents: () => any;
  getStyle: () => any;
  setStyle: (style: any) => void;
  store: () => void;
  load: (data: any) => void;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
  trigger: (event: string, data?: any) => void;
  destroy: () => void;
}

// 保存数据接口
export interface SaveData {
  html: string;
  css: string;
  components: any;
  styles: any;
  timestamp: string;
}

// 新的页面保存接口
export interface PageSaveData {
  uuid: string;
  html: string;
  css?: string;
  templateId?: string;
  metadata?: {
    pageTitle?: string;
  };
}

// 從伺服器讀回的頁面（GET /api/page/[uuid]）
export interface StoredPage {
  uuid: string;
  title: string;
  html: string;
  css: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
}

// API 响应接口
export interface ApiResponse {
  success: boolean;
  message: string;
  uuid?: string;
  savedAt?: string;
  error?: string;
}

// 编辑器配置接口
export interface EditorConfig {
  cssIcons?: string;
  components?: string;
  style?: string;
  panels?: any;
  blockManager?: any;
  deviceManager?: any;
  layerManager?: any;
  traitManager?: any;
  styleManager?: any;
}

// 保存状态类型
export type SaveStatus = "idle" | "saving" | "saved" | "error";

// 编辑器事件类型
export interface EditorEvents {
  "component:selected": (component: any) => void;
  "component:add": (component: any) => void;
  "component:remove": (component: any) => void;
  "component:update": (component: any) => void;
  "style:add": (style: any) => void;
  "style:remove": (style: any) => void;
  "style:update": (style: any) => void;
  "page:save": (data: PageSaveData) => void;
}
