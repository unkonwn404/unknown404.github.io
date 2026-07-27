---
title: amis初探
date: 2025-03-12 15:21:35
categories:
  - 工作技巧
tags:
  - 低代码
---

公司要求用低代码来协助产品搭建一些简单的产品，通过一段时间有限的调研，选择了这个开源项目，开启了一段噩梦。
接下来是吐槽时间。

<!-- more -->

## 背景

现在 ai 盛行，老板希望能快速搭建一些 ai 产品推广。考虑对产品经理的友好性，需要选择一款合适的低代码开源项目。
但不搜不知道，一搜发现低代码平台还真是多啊，真是让人头疼。而且低代码其实还分前端、后端、应用各种类型的搭建
以下是各平台的不完整测评，就目前的体验来说是这样

### appsmith

似乎是创建应用的，个人感觉比较适合 B 端的数据展示和处理。支持写 js 代码，但我还是没办法快速弄清如何让一个按钮触发弹窗显示（是的这是我个人评判是否好用的标准）。而且似乎也导不出代码或者 json

### 华为 tinyEngine

不可思议的体验，我完全不能理解，提供的 demo 预览什么也看不到，我企图修改时模块总会莫名其妙消失，当我去组件树试图寻找时，点击某节点整个面板又自动滚到顶部了。。。完全感觉不到可用的可能，不知道这个 demo 是不是个死的。导出的话是整个 Vue 项目，有着清晰的结构

### 阿里 LowCodeEngine

文档十分不友好，内容少而不精准，在试图制作弹窗 demo 时发现使用`$`引用 dom 来控制弹窗开启和隐藏出了问题，然而这是官方文档提供的内容。极度依赖 React，交互没有 React 知识不好实现。估计得训练一下产品经理。

### 百度 amis

倒是对前端知识的门槛要求降低了，如果只是纯展示页面估计还不错。可惜一涉及到交互同样是噩梦。说明文档写的很差，提供的 demo 也全部是 json 配置，可视化配置表格找不到配置对应的位置。导出只能是页面的 json，页面通过引用 amis 的 sdk 对 json 做处理

经过了这番并不全面而详尽的尝试后，我实在没兴趣继续了。。。

## 低代码原理

低代码（Low-Code）平台的实现原理主要围绕 可视化开发、模型驱动架构、组件化、代码生成 等关键技术。它们通过拖拽式 UI、流程编排、数据绑定等方式，让开发者快速构建应用，而无需手写大量代码。详细解说原理前须先介绍平台的搭建特点：一般的低代码编辑器主要分为三个部分：页面左侧是物料区，也就是页面常用的组件，与 antd 库有几分类似，但不是所有都是有实体的组件，也有的物料是某种逻辑的抽离，例如在 amis 中的 service 组件就是；页面中间是画布，使用者可将左侧组件拖拽到画布中心构建页面结构；右侧则是配置区，针对页面中使用的组件做特点的逻辑配置和样式调整。
![](/img/amis/amis.jpg)

低代码实现的几个关键环节主要有这些：

### 协议

所谓协议，个人更感觉像是约定的规范，约定物料开发的规则、页面搭建的规则之类的。例如绝大多数低代码都是将组件涉及的样式、交互逻辑抽离成一个 json 配置，通过设定几个固定的属性来控制。这样当低代码的 SDK 解析到组件的 json 时可以将其转换为对应的代码逻辑。。。这种感觉。
例如：当在页面添加了一个按钮后、左侧的配置 schema 新增了一个新 json

```json
{
  "type": "button",
  "label": "按钮",
  "onEvent": {
    "click": {
      "actions": []
    }
  },
  "id": "u:7f7930162cae"
}
```

对应添加到页面的代码就是：

```jsx
import { Button } from "amis";
 // ...existing code...
 export default const page=(props)=>{
  return (
    // ...existing code...
    <Button label={props.label}/>
  )
 }
```

### 材料

个人更通俗的理解就是符合协议、可读取配置 json 完善逻辑的封装组件、组件对应的配置表单以及定制好的行为。在 amis 中就对应了这么几个文件夹：

- renderer：渲染组件
- plugin：组件的配置项设计
- action：定制行为
  一般的低代码平台会提供通用的物料。但是如果涉及到 C 端可能需要考虑更多个性化的内容：例如埋点，图片上传等，这些都是与公司自身的服务相挂钩的，都是需要自己开发扩展的

### 渲染

渲染方式主要有两个大类：

- 出码渲染
- 运行时渲染
  常见的低代码渲染都是运行时渲染，只有少数对性能要求较高的产品才会使用出码渲染的方式。

#### 出码渲染

出码渲染是将 schema 转化为 Vue 源码、React 源码或者其他语言的源码。

#### 运行时渲染

页面 schema 渲染成页面都是在浏览器中完成的，不存在预编译的过程。amis 就属于这种渲染。

## 低代码适用场景

个人理解是偏向于纯展示、低交互的页面，例如运营活动、B 端的表单，有复杂逻辑的页面就很难实现了。以下为几个代表

- 海报，纯展示
- H5 运营活动页，页面一次性，交互简单
- 中后台页面，表单页面，逻辑 curd 都在后端，前端不具备复杂逻辑

如果真涉及到稍复杂的 C 端页面，用起来就比较痛苦了：产品只知道她的展示逻辑，不理解要实现这些逻辑需要经历哪些环节，只希望需要配置的内容越少越简洁；开发知道如何用代码实现，但必须完全代入低代码的思维、理解平台开发者的设计逻辑、沿着他的思路去抽离逻辑。而且万一配置出错了，不具有前端经验的人很难 debug，即使是前端在报错信息不全的情况下也很难快速定位问题点。综上所述，我很难想象谁需要这个。

## amis 使用注意事项

### SDK 使用说明

虽然说明文档给出了 SDK 引入及自定义组件定义的说明，但实验时发现运行有问题，主要有以下几点：
**使用 import 方式导入 sdk.js 文件报错**
当前最新版的 sdk.js 文件依赖文件 rest.js，所以引入时需要将两个文件同时引入。如下：

```js
import "amis/sdk/sdk.js";
import "amis/sdk/rest.js";
import "amis/sdk/sdk.css";
import "amis/sdk/helper.css";
```

**自定义组件渲染失败**
amis 在 SDK 引入自定义组件的说明里存在错误，估计是由于架构变更没有及时更新的缘故，现在 Renderer 属于 amis-core，所以正确的引入逻辑是：

```js
// ...existing code...
const scoped = amisRequire("amis/embed");
const { normalizeLink, Renderer } = amisRequire("amis-core");
// 自定义组件，props 中可以拿到配置中的所有参数，比如 props.label 是 'Name'

let React = amisRequire("react");
function CustomComponent(props) {
  let dom = React.useRef(null);
  React.useEffect(function () {
    // 从这里开始写自定义代码，dom.current 就是新创建的 dom 节点
    // 可以基于这个 dom 节点对接任意 JavaScript 框架，比如 jQuery/Vue 等
    dom.current.innerHTML = "custom";
    // 而 props 中能拿到这个
  });
  return React.createElement("div", {
    ref: dom,
  });
}

//注册自定义组件，请参考后续对工作原理的介绍
Renderer({
  test: /(^|\/)my-custom-renderer/,
})(CustomComponent);
```

自定义组件注册完成后，使用时则是配置以下 json：

```json
{ "type": "my-custom-renderer" }
```

**hover 样式被 sdk 组件 hover 样式覆盖**
sdk 自动为渲染内容的容器元素添加了 amis-scope 的 class，同时将 css 文件的元素选择器全部添加了 amis-scope 的父元素，而在编辑器配置的 hover 属性没有自动附加 amis-scope 父元素，所以自定义的 hover 样式优先级反而劣于默认样式。只有手动写 hover 样式并加！important 才能实现
### amis-editor启动说明
虽然本地启动amis-editor-demo并不困难，但是到了部署一步却出了意外，因为amis依赖包里有个子依赖是个github仓库，所以docker镜像文件需要安装github镜像包，文件内容也就变成了：
```dockerFile
FROM node:20-alpine

ARG DIR=/opt/apps/static
RUN mkdir -p $DIR /opt/logs/nginx /var/run/nginx
WORKDIR $DIR
RUN apk update && apk add --no-cache nginx curl
RUN apk add --no-cache git

COPY . $DIR
RUN npm config set registry https://registry.npmmirror.com && npm install --legacy-peer-deps&& npm run release:test

# 创建目标目录 $DIR/static，如果目录不存在则创建
# 将 build 目录下的所有文件和子目录递归复制到 $DIR/static/ 目录下
RUN mkdir -p $DIR/static && cp -r dist/* $DIR/static/

# COPY ./nginx.conf $DIR/nginx.conf
COPY Dockerfile/start.sh /usr/local/bin/
# 启动 Nginx
CMD ["sh", "/usr/local/bin/start.sh"]
```

### 数据域与展示组件问题

amis 在解决组件数据绑定和数据传递方面提出了数据域和数据链结构，简单来说，有以下要点：

- 组件的 data 属性值是数据域的一种形式
- 顶级节点数据域，也就是 page 节点的 data 属性
- 不是所有组件都有数据域这一特点，主要是表单类；展示组件如文本、富文本没有该属性
- 数据链的规则是：当前组件在遇到获取变量的场景（例如模板渲染、展示表单数据、渲染列表等等）时，首先会先尝试在当前组件的数据域中寻找变量，没有找到变量时，则向上寻找，直到顶级节点

因此当出现异步请求后需要更新页面内容的情况，如果涉及的组件是展示类的，行为‘变量赋值‘是无法直接赋值给组件的，唯一的办法就是展示组件配置时绑定父层或顶层数据域变量，让行为‘变量赋值‘去改变绑定的变量

### 数据表达式

在前端编程中，通过单击按钮控制侧边栏的显隐是通过绑定的 click 函数，让显示状态赋值为当前状态的取反值。然而在 amis 中，由于配置是用 json 存储，所以 visible 变量初始赋值为 false 其实是字符串的 false，取反后变量为 false，所以第一次触发点击事件被该状态控制的组件不会显示。visible 变量初始赋值空字符串可以解决问题。

## amis 的扩展

针对 C 端丰富多彩的需求，扩展是很难避免的，尤其是当产品缺乏开发知识时。以下是关于如何扩展的说明。

### plugin 扩展

amis 提供了关于 plugin 的定义，以下是基本定义，在编写自定义组件的配置表单 plugin 时也可以参考；amis 包里的 plugin 插件则是对这个定义的进一步封装为了 BasePlugin 这个基类。

```ts
/**
 * 插件的 interface 定义
 */
export interface PluginInterface
  extends Partial<BasicRendererInfo>,
    Partial<BasicSubRenderInfo>,
    PluginEventListener {
  readonly manager: EditorManager;

  order?: number;

  /**
   * 插件作用场景
   */
  scene?: Array<string>;

  // 是否可绑定数据，一般容器类型就没有
  withDataSource?: boolean;

  /**
   * 渲染器的名字，关联后不用自己实现 getRendererInfo 了。
   */
  rendererName?: string;

  /**
   * 默认的配置面板信息
   */
  panelIcon?: string;
  panelTitle?: string;

  /**
   * 新增属性，用于判断是否出现在组件面板中，默认为false，为ture则不展示
   */
  disabledRendererPlugin?: boolean;

  /**
   * @deprecated 用 panelBody
   */
  panelControls?: Array<any>;
  panelBody?: Array<any>;
  panelDefinitions?: any;
  panelApi?: any;
  panelSubmitOnChange?: boolean;

  /**
   * 隐藏右侧面板表单项Tab
   * TODO: 正式上线后要干掉这个属性
   */
  notRenderFormZone?: boolean;

  /**
   *
   * 事件定义集合
   */
  events?: RendererPluginEvent[] | ((schema: any) => RendererPluginEvent[]);

  /**
   *
   * 专有动作定义集合
   */
  actions?: RendererPluginAction[];

  /**
   * 右侧面板是否需要两端对齐布局
   */
  panelJustify?: boolean;

  /**
   * panelBodyAsyncCreator设置后异步加载层的配置项
   */
  async?: AsyncLayerOptions;

  /**
   * 拖拽模式
   */
  dragMode?: string;

  /**
   * 有数据域的容器，可以为子组件提供读取的字段绑定页面
   */
  getAvailableContextFields?: (
    // 提供数据域的容器节点
    scopeNode: EditorNodeType,
    // 数据域的应用节点
    target: EditorNodeType,
    // 节点所属的容器region
    region?: EditorNodeType
  ) => Promise<SchemaCollection | void>;

  /** 配置面板表单的 pipeOut function */
  panelFormPipeOut?: (value: any, oldValue: any) => any;

  /**
   * @deprecated 用 panelBodyCreator
   */
  panelControlsCreator?: (context: BaseEventContext) => Array<any>;
  panelBodyCreator?: (context: BaseEventContext) => SchemaCollection;
  /**
   * 配置面板内容区的异步加载方法，设置后优先级大于panelBodyCreator
   */
  panelBodyAsyncCreator?: (
    context: BaseEventContext
  ) => Promise<SchemaCollection>;

  popOverBody?: Array<any>;
  popOverBodyCreator?: (context: BaseEventContext) => Array<any>;

  /**
   * 返回渲染器信息。不是每个插件都需要。
   */
  getRendererInfo?: (
    context: RendererInfoResolveEventContext
  ) => BasicRendererInfo | void;

  /**
   * 生成节点的 JSON Schema 的 uri 地址。
   */
  buildJSONSchema?: (
    context: RendererJSONSchemaResolveEventContext
  ) => void | string;

  /**
   * 构建右上角功能按钮集合
   */
  buildEditorToolbar?: (
    context: BaseEventContext,
    toolbars: Array<BasicToolbarItem>
  ) => void;

  /**
   * 构建右键菜单项
   */
  buildEditorContextMenu?: (
    context: ContextMenuEventContext,
    menus: Array<ContextMenuItem>
  ) => void;

  /**
   * 构建编辑器面板。
   */
  buildEditorPanel?: (
    context: BuildPanelEventContext,
    panels: Array<BasicPanelItem>
  ) => void;

  /**
   * 构建子渲染器信息集合。
   */
  buildSubRenderers?: (
    context: RendererEventContext,
    subRenderers: Array<SubRendererInfo>,
    renderers: Array<RendererConfig>
  ) =>
    | BasicSubRenderInfo
    | Array<BasicSubRenderInfo>
    | void
    | Promise<BasicSubRenderInfo | Array<BasicSubRenderInfo> | void>;

  /**
   * 更新NPM自定义组件分类和排序[异步方法]
   * 备注：目前主要在npm自定义组件的分类和排序更新中使用
   */
  asyncUpdateCustomSubRenderersInfo?: (
    context: RendererEventContext,
    subRenderers: Array<SubRendererInfo>,
    renderers: Array<RendererConfig>
  ) => void;

  markDom?: (dom: HTMLElement | Array<HTMLElement>, props: any) => void;

  /**
   * 获取上下文数据结构
   *
   * @param node 当前容器节点
   * @param region 所属容器节点
   */
  buildDataSchemas?: (
    node: EditorNodeType,
    region?: EditorNodeType,
    trigger?: EditorNodeType,
    parent?: EditorNodeType
  ) => any | Promise<any>;

  rendererBeforeDispatchEvent?: (
    node: EditorNodeType,
    e: any,
    data: any
  ) => void;

  /**
   * 给 schema 打补丁，纠正一下 schema 配置。
   * @param schema
   * @param renderer
   * @param props
   * @returns
   */
  patchSchema?: (
    schema: Schema,
    renderer: RendererConfig,
    props?: any
  ) => Schema | void;

  dispose?: () => void;

  /**
   * 组件 ref 回调，mount 和 unmount 的时候都会调用
   * @param ref
   * @returns
   */
  componentRef?: (node: EditorNodeType, ref: any) => void;
}
export abstract class BasePlugin implements PluginInterface {
  constructor(readonly manager: EditorManager) {}

  static scene = ["global"];

  name?: string;
  rendererName?: string;

  /**
   * 如果配置里面有 rendererName 自动返回渲染器信息。
   * @param renderer
   */
  getRendererInfo({
    renderer,
    schema,
  }: RendererInfoResolveEventContext): BasicRendererInfo | void {
    const plugin: PluginInterface = this;

    if (
      schema.$$id &&
      plugin.name &&
      plugin.rendererName &&
      plugin.rendererName === renderer.name // renderer.name 会从 renderer.type 中取值
    ) {
      let curPluginName = plugin.name;
      if (schema?.isFreeContainer) {
        curPluginName = "自由容器";
      } else if (schema?.isSorptionContainer) {
        curPluginName = "吸附容器";
      }
      // 复制部分信息出去
      return {
        name: curPluginName,
        regions: plugin.regions,
        inlineEditableElements: plugin.inlineEditableElements,
        patchContainers: plugin.patchContainers,
        vRendererConfig: plugin.vRendererConfig,
        wrapperProps: plugin.wrapperProps,
        wrapperResolve: plugin.wrapperResolve,
        filterProps: plugin.filterProps,
        $schema: plugin.$schema,
        renderRenderer: plugin.renderRenderer,
        multifactor: plugin.multifactor,
        scaffoldForm: plugin.scaffoldForm,
        disabledRendererPlugin: plugin.disabledRendererPlugin,
        isBaseComponent: plugin.isBaseComponent,
        isListComponent: plugin.isListComponent,
        rendererName: plugin.rendererName,
        memberImmutable: plugin.memberImmutable,
        getSubEditorVariable: plugin.getSubEditorVariable,
      };
    }
  }

  /**
   * 配置了 panelControls 自动生成配置面板
   * @param context
   * @param panels
   */
  buildEditorPanel(
    context: BuildPanelEventContext,
    panels: Array<BasicPanelItem>
  ) {
    const plugin: PluginInterface = this;
    const store = this.manager.store;

    // 没有选中元素 或者 多选时不处理
    if (!store.activeId || context.selections.length) {
      return;
    }

    if (
      !context.info.hostId &&
      (plugin.panelControls ||
        plugin.panelControlsCreator ||
        plugin.panelBody ||
        plugin.panelBodyCreator ||
        plugin.panelBodyAsyncCreator) &&
      context.info.plugin === this
    ) {
      const enableAsync = !!(
        plugin.panelBodyAsyncCreator &&
        typeof plugin.panelBodyAsyncCreator === "function"
      );
      const body = plugin.panelBodyAsyncCreator
        ? plugin.panelBodyAsyncCreator(context)
        : plugin.panelBodyCreator
        ? plugin.panelBodyCreator(context)
        : plugin.panelBody!;

      this.manager.trigger("after-build-panel-body", {
        context,
        data: body,
        plugin,
      });

      const baseProps = {
        definitions: plugin.panelDefinitions,
        submitOnChange: plugin.panelSubmitOnChange,
        api: plugin.panelApi,
        controls: plugin.panelControlsCreator
          ? plugin.panelControlsCreator(context)
          : plugin.panelControls!,
        justify: plugin.panelJustify,
        panelById: store.activeId,
        pipeOut: plugin.panelFormPipeOut?.bind?.(plugin),
      };

      panels.push({
        key: "config",
        icon: plugin.panelIcon || plugin.icon || "fa fa-cog",
        pluginIcon: plugin.pluginIcon,
        title: plugin.panelTitle || "设置",
        render: enableAsync
          ? makeAsyncLayer(async () => {
              const panelBody = await (body as Promise<SchemaCollection>);

              return this.manager.makeSchemaFormRender({
                ...baseProps,
                body: panelBody,
              });
            }, omit(plugin.async, "enable"))
          : this.manager.makeSchemaFormRender({
              ...baseProps,
              body: body as SchemaCollection,
            }),
      });
    } else if (
      context.info.plugin === this &&
      context.info.hostId &&
      (plugin.vRendererConfig?.panelControls ||
        plugin.vRendererConfig?.panelControlsCreator ||
        plugin.vRendererConfig?.panelBody ||
        plugin.vRendererConfig?.panelBodyCreator)
    ) {
      panels.push({
        key: context.info.multifactor ? "vconfig" : "config",
        icon: plugin.vRendererConfig.panelIcon || "fa fa-cog",
        title: plugin.vRendererConfig.panelTitle || "设置",
        render: this.manager.makeSchemaFormRender({
          submitOnChange: plugin.panelSubmitOnChange,
          api: plugin.panelApi,
          definitions: plugin.vRendererConfig.panelDefinitions,
          controls: plugin.vRendererConfig.panelControlsCreator
            ? plugin.vRendererConfig.panelControlsCreator(context)
            : plugin.vRendererConfig.panelControls!,
          body: plugin.vRendererConfig.panelBodyCreator
            ? plugin.vRendererConfig.panelBodyCreator(context)
            : plugin.vRendererConfig.panelBody!,
          justify: plugin.vRendererConfig.panelJustify,
          panelById: store.activeId,
        }),
      });
    }

    // 如果是个多重身份证
    if (context.info.plugin === this && context.info.multifactor) {
      const sameIdChild: EditorNodeType = context.node.sameIdChild;

      if (sameIdChild) {
        const subPanels = this.manager.collectPanels(sameIdChild, false, true);
        subPanels.forEach((panel) => {
          if (panel.key === "config" || panel.key === "vconfig") {
            panels.push({
              ...panel,
              key: `sub-${panel.key}`,
              icon: sameIdChild.info?.plugin?.icon || panel.icon,
            });
          }
        });
      }
    }
  }

  /**
   * 默认什么组件都加入的子组件里面，子类里面可以复写这个改变行为。
   * @param context
   * @param subRenderers
   */
  buildSubRenderers(
    context: RendererEventContext,
    subRenderers: Array<SubRendererInfo>,
    renderers: Array<RendererConfig>
  ): BasicSubRenderInfo | Array<BasicSubRenderInfo> | void {
    const plugin: PluginInterface = this;

    if (Array.isArray(plugin.scaffolds)) {
      return plugin.scaffolds.map((scaffold) => ({
        name: (scaffold.name ?? plugin.name)!,
        icon: scaffold.icon ?? plugin.icon,
        pluginIcon: plugin.pluginIcon,
        description: scaffold.description ?? plugin.description,
        previewSchema: scaffold.previewSchema ?? plugin.previewSchema,
        tags: scaffold.tags ?? plugin.tags,
        docLink: scaffold.docLink ?? plugin.docLink,
        type: scaffold.type ?? plugin.type,
        scaffold: scaffold.scaffold ?? plugin.scaffold,
        scaffoldForm: plugin.scaffoldForm,
        disabledRendererPlugin: plugin.disabledRendererPlugin,
        isBaseComponent: plugin.isBaseComponent,
        rendererName: plugin.rendererName,
      }));
    } else if (plugin.name && plugin.description) {
      return {
        searchKeywords: plugin.searchKeywords,
        name: plugin.name,
        icon: plugin.icon,
        description: plugin.description,
        previewSchema: plugin.previewSchema,
        tags: plugin.tags,
        docLink: plugin.docLink,
        type: plugin.type,
        scaffold: plugin.scaffold,
        scaffoldForm: plugin.scaffoldForm,
        disabledRendererPlugin: plugin.disabledRendererPlugin,
        isBaseComponent: plugin.isBaseComponent,
        pluginIcon: plugin.pluginIcon,
        rendererName: plugin.rendererName,
      };
    }
  }

  renderPlaceholder(text: string, key?: any, style?: any) {
    return React.createElement("div", {
      key,
      className: "wrapper-sm b-a b-light m-b-sm",
      style: style,
      children: React.createElement("span", {
        className: "text-muted",
        children: text,
      }),
    });
  }

  getPlugin(rendererNameOrKlass: string | typeof BasePlugin) {
    return find(this.manager.plugins, (plugin) =>
      typeof rendererNameOrKlass === "string"
        ? plugin.rendererName === rendererNameOrKlass
        : plugin instanceof rendererNameOrKlass
    );
  }

  buildDataSchemas(
    node: EditorNodeType,
    region?: EditorNodeType,
    trigger?: EditorNodeType,
    parent?: EditorNodeType
  ) {
    return {
      type: "string",
      rawType: RAW_TYPE_MAP[node.schema.type as SchemaType] || "string",
      title:
        typeof node.schema.label === "string"
          ? node.schema.label
          : node.schema.name,
      originalValue: node.schema.value, // 记录原始值，循环引用检测需要
    } as any;
  }

  getKeyAndName() {
    return {
      key: this.rendererName,
      name: this.name,
    };
  }
}
```

这里有几个比较重要的属性必须命名：

- rendererName：关联的渲染组件名，与渲染器的名称一致配置结果才会赋值给渲染器的 props
- name：组件名称（即组件面板显示的 Title）
- tags：决定会在编辑器左侧组件面板哪个 tab 下面显示的
- scaffold：拖入组件里面时的初始数据
- panelTitle：右侧面板名称
- panelControls、panelBodyCreator：右侧面板内容展示配置，符合 amis 的 json 渲染页面规则

如果是设置自定义组件的 plugin，按照上面的属性编写即可，而如果是希望在已有的组件上增加一些配置，可以通过直接继承原有 plugin 进行改写，例如如果希望 service 组件可以增加一个模式，在该模式下直接填写一些请求相关参数，则可以采用继承原有的 ServicePlugin、改写目标属性，例如下写法：

```ts
class CustomServicePlugin extends ServicePlugin {
  // 需要显式声明静态属性
  static id = "ServicePlugin";
  constructor(manager: EditorManager) {
    super(manager); // 这会调用父类构造函数，初始化 dsManager
    // 如果需要，可以在这里添加自定义初始化逻辑
  }

  // 覆写方法
  panelBodyCreator = (context: BaseEventContext) => {
    const dsManager = this.dsManager;
    /** 数据源控件 */
    const generateDSControls = () => {
      const dsTypeSelector = dsManager.getDSSelectorSchema(
        {
          type: "select",
          mode: "horizontal",
          horizontal: {
            justify: true,
            left: "col-sm-4",
          },
          onChange: (value: any, oldValue: any, model: any, form: any) => {
            if (value !== oldValue) {
              const data = form.data;
              Object.keys(data).forEach((key) => {
                if (
                  key?.toLowerCase()?.endsWith("fields") ||
                  key?.toLowerCase().endsWith("api")
                ) {
                  form.deleteValueByName(key);
                }
              });
              form.deleteValueByName("__fields");
              form.deleteValueByName("__relations");
              form.setValueByName("api", undefined);
            }
            return value;
          },
        },
        { schema: context?.schema, sourceKey: "api" }
      );
      /** 默认数据源类型 */
      const defaultDsType = dsTypeSelector.value;
      const dsSettings = dsManager.buildCollectionFromBuilders(
        (builder, builderKey) => {
          return {
            type: "container",
            visibleOn: `data.dsType == null ? '${builderKey}' === '${
              defaultDsType || ApiDSBuilderKey
            }' : data.dsType === '${builderKey}'`,
            body: flattenDeep([
              builder.makeSourceSettingForm({
                feat: "View",
                renderer: "service",
                inScaffold: false,
                sourceSettings: {
                  name: "api",
                  label: "接口配置",
                  mode: "horizontal",
                  ...(builderKey === "api" || builderKey === "apicenter"
                    ? {
                        horizontalConfig: {
                          labelAlign: "left",
                          horizontal: {
                            justify: true,
                            left: 4,
                          },
                        },
                      }
                    : {}),

                  useFieldManager: builderKey === ModelDSBuilderKey,
                },
              }),
            ]),
          };
        }
      );
      dsSettings[0].body[0].value = `\${
    isDIFY ? {
      url: 'http://dify.com/adaptor/workflows/run',
      method: 'post',
      requestAdaptor:
        'function getUUID() {\n  function generateRand(len = 7) {\n    const rands =\n      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";\n    return Array.from(Array(len))\n      .map(() => rands[parseInt((Math.random() * rands.length).toString())])\n      .join("");\n  }\n\n  return new Date().getTime() + generateRand(7);\n}\napi.data.request_id = getUUID()\nreturn api',
      adaptor: ''
    } : {
      
    }
  }`;
      return [dsTypeSelector, ...dsSettings];
    };

    return getSchemaTpl("tabs", [
      {
        title: "属性",
        className: "p-none",
        body: [
          getSchemaTpl("collapseGroup", [
            {
              title: "基本",
              body: [
                getSchemaTpl("layout:originPosition", { value: "left-top" }),
                getSchemaTpl("switch", {
                  label: "是否使用dify",
                  name: "isDIFY",
                  value: true,
                }),
                ...generateDSControls(),
              ],
            },
          ]),
        ],
      },
      // ...existing code...
    ]);
  };
}
```

这里 id 需要注明，因为 ServicePlugin 的 id 是静态变量不会被继承。这里因为要改写的方法 panelBodyCreator 使用了 dsManager，所以要在构造函数调用父类构造函数。这里首先增加了一个 isDIFY 的配置，用于控制是否要填入一个默认的 API 配置。原代码的 dsTypeSelector 是用于设置数据来源的配置、即 dsType；dsSettings 用于配置 api 的 json 内容，所以可以等 dsSettings 返回后再做 api 配置修改。
以上修改逻辑较为粗糙，适用于配置嵌套比较浅的组件 plugin，如果是嵌套比较深的例如 Container 的背景图片上传配置，则由于配置很难全部透传到 input-image 组件内部，所以修改无效。
完成 plugin 编写后，如果是自定义组件的 plugin，直接用 registerEditorPlugin 全局注册组件即可；如果是扩展已有组件，需要用`unRegisterEditorPlugin(id:string)`注销掉原组件，再全局注册新的即可

### 自定义组件扩展

自定义组件扩展需要注意两件事：

1. 需要在编辑器添加自定义组件的 plugin 和 renderer
2. 需要在 SDK 添加自定义组件的 renderer

plugin 的开发在上一节已经叙述，过程是一致的。而 renderer 的开发简单来说是将 plugin 配置的变量作为 props 的入参，和默认参数结合，最终将数据渲染进组件进行展示。由于 amis 开发依赖 react，所以 renderer 利用 react 开发最为有利，如果要使用 Vue 开发，就需要利用 amis-widget 的包装函数进行一层转换，而且还是转 React。。。

我个人在开发时就遇到了问题：在 nuxt 3 项目引入 renderer 文件时整个页面都阻塞无法展示，不确定是不是因为 nuxt 3 对 react 有什么排斥的

### action 扩展

关于如何开发 action 的内容较少，只能根据源码内容进行推测。

```js
export interface RendererAction {
  // 运行这个 Action，每个类型的 Action 都只有一个实例，run 函数是个可重入的函数
  run: (
    action: ListenerAction,
    renderer: ListenerContext,
    event: RendererEvent<any>,
    mergeData?: any // 有些Action内部需要通过上下文数据处理专有逻辑，这里的数据是事件数据+渲染器数据
  ) => Promise<RendererEvent<any> | void>;
}
```

action 的基本结构如上所示，action 传入内容应该为 json 配置内容；renderer 不太明确，似乎是获取组件渲染内部的方法，通过 renderer.props 访问；event 应该是获取外部配置的一些函数，在编辑器的 demo 和 sdk 的 embed 都配置了一些函数，如请求 fetcher、跳转 jumpTo 等，在这个函数里可以通过 event.context.env 来访问到。
amis 提供了函数`registerAction(type: string, action: RendererAction)`当使用时就成功注册了一种行为动作，调用时使用形如`actionType: 'ajax'`的格式就可以实现。

如果要在编辑器动作配置弹窗里出现配置的内容，则需要使用`registerActionPanel(actionType: string,actionPanel?: ActionPanel)`函数，其中 actionType 对应于注册动作的 type 内容，actionPanel 则大致包含如下内容：

- label：功能说明，对应于动作配置弹窗左侧菜单选项名
- tag：所属大类，对应于动作配置弹窗左侧菜单选项集合名
- description：对应动作说明
- supportComponents：支持的组件类型
- schema：动作对应的 json

## 参考文献

（1）[低代码渲染那些事](https://mp.weixin.qq.com/s/yqYey76qLGYPfDtpGkVFfA)
