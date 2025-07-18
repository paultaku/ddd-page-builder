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
}
