# MobieTV 项目概览

## 项目定位
- 面向移动端的教育类视频聚合应用，提供首页推荐、专题课程、学段专区、音频阅读等内容频道。
- 目标用户需先登录，随后可浏览课程列表、播放视频、搜索课程/教师，在不同学段间切换。

## 技术栈
- 前端框架：Vue 3 + `<script setup>` 单文件组件。
- 状态管理：Pinia（集中在 `src/stores`）。
- 路由：Vue Router 4，基于配置动态加载页面（`src/router/routes.ts:1`）。
- UI & 样式：Vant 组件库、Tailwind CSS 原子化样式、Less 自定义样式。
- 构建工具：Vite 5，配合 `@vitejs/plugin-vue`、`@vitejs/plugin-legacy` 兼容旧浏览器。
- 网络层：Axios + 自定义拦截器（`src/http/index.ts:1`），支持 RSA 加密、Token 注入、统一错误处理。
- 媒体播放：`hls.js` + 定制 `m3u8` 播放组件（`src/components/m3u8/vue3-m3u8-player.vue:1`）。
- 其他依赖：`jsencrypt`（加密）、`pinia`、`tailwindcss` 等。

## 环境与脚本
- 环境变量：`.env.development` 指向本地代理，`.env.production` 指向正式 API 域名。
- 常用脚本：`pnpm dev`、`pnpm build`、`pnpm preview`、`pnpm lint`、`pnpm build:check`。
- `clear-cache.js` 与 `src/utils/clearCache.ts` 用于开发时清理缓存，避免旧资源干扰。

## 目录结构要点
- `src/main.ts:1`：应用入口，挂载 Pinia/Vue Router/Vant 组件，并在认证初始化后再挂载应用。
- `src/router/index.ts:1`：基于 `routeConfigs` 生成路由表，设置页面标题、鉴权守卫与登录重定向。
- `src/stores`：
  - `auth.ts:1` 管理登录态、令牌、用户信息、应用配置。
  - `learning.ts:1` 负责 Tab 列表、页面详情、课程/教师搜索、热门课程、标签联动等状态。
  - `education.ts` 提供教学资源相关逻辑，配合自动分页等组合式函数。
- `src/http/api.ts:1`：集中定义 API Endpoint、URL 构造逻辑及业务方法。
- `src/views`：按业务划分页面，例如 `Home.vue`、`Learning.vue`、`SubjectCourse.vue:1`、`TeacherCourseList.vue` 等。
- `src/components`：公用组件（导航、加载、网络错误、搜索模块等）与专题组件（如专题课程列表、抽屉面板）。
- `src/composable`：组合式函数封装常用逻辑，包含 `useHttp.ts`、图像懒加载/占位处理（`useImageLoader.ts:1`、`useLazyImage.ts`）、课程 Tab 管理等。
- `src/utils`：函数式工具（`functional.ts`）、Cookie 管理、Mock API、搜索相关工具。
- `src/types`：HTTP 响应、路由定义以及第三方库类型声明。

## 核心业务模块

### 用户认证
- `src/stores/auth.ts:1` 使用 Pinia 维护登录状态，支持本地存储用户信息、Cookie 存储访问/刷新令牌。
- 登录流程通过 `apiService.login` 调用 `/api/user/api/register`，成功后写入状态与本地缓存。
- 响应拦截器在 401 时自动清除令牌并重定向登陆页。

### 学习与课程资源
- `learning` store 提供 Tab 列表、页面详情、热门课程、课程/教师搜索、年级/学科/出版社标签联动。
- `apiService` 中学习相关接口 (`getPageTabList`、`getSubjectCourseList` 等) 访问外部 API。
- 组合式函数 `useAutoPageEducation.ts` 与 `useTabItems.ts` 将 store 状态与页面组件逻辑解耦。

### 专题课程页
- `src/views/SubjectCourse.vue:1`：根据路由参数加载专题课程；左侧动态筛选 Tab、右侧课程网格、空状态与错误状态展示。
- 集成 `useImageLoader` 处理封面加载占位、错误回退；并与登录状态、用户信息联动。
- 支持点击课程跳转、重新加载、动态背景（根据 `subjectObj` 配置渐变/背景图）。

### 视频播放
- `src/components/m3u8/vue3-m3u8-player.vue:1`：基于 `hls.js` 封装 HLS 播放器，支持自定义控制条、事件监听。
- `VideoDetail.vue` 等页面可复用该组件播放流媒体资源。

### 搜索与数据管理
- `src/views/Search.vue` 配合 `learning` store 完成课程、教师搜索，记录搜索历史（`apiService.addCourseSearchRecord`）。
- `utils/search` 内封装历史记录管理、热词处理等逻辑。

## 状态与数据流
1. 入口初始化：`src/main.ts:1` 创建应用、加载认证状态，决定路由挂载时机。
2. 路由守卫：`src/router/index.ts:1` 在 `beforeEach` 中检查路由元信息 `requiresAuth`，未登录时跳转登录页并附带重定向参数。
3. 网络调用：组件或 store 调用 `apiService` 方法 → `src/http/index.ts:1` 处理请求 → 拦截器统一注入 Token、处理状态码。
4. 状态同步：Pinia store 更新响应式状态；页面与组合式函数通过 `computed`/`watch` 订阅，驱动 UI 更新。
5. 缓存策略：Token 使用 Cookie (`utils/cookies.ts`)，用户信息存 `localStorage`；开发环境可用 `clearCache` 清理。

## UI 与体验
- Vant 组件与 Tailwind 样式混合使用，配合 Less 写局部样式（如 `SubjectCourse.vue:200+` 中的布局与渐变背景）。
- 布局组件（`components/layout/NavBar.vue:1`、`TabBar.vue:1`）统一导航体验；`BottomDrawer.vue` 提供移动端抽屉交互。
- Loading、空状态、错误态组件集中在 `components/loading`、`components/common`，保持一致的用户反馈。

## 构建与部署
- Vite 生产构建输出至 `dist/`，支持 `pnpm preview` 本地预览。
- `@vitejs/plugin-legacy` 保障旧浏览器兼容；`vite.config.ts` 配置路径别名 `@` 指向 `src`。
- `.env.production` 中的 `VITE_API_BASE_URL` 用于线上 API，需确保与后端代理一致。
- `postcss.config.js`、`tailwind.config.js` 控制样式构建，支持按需 Purge。

## 可改进方向（观察到的潜在点）
- 补充接口错误提示的 UI 反馈，避免仅在控制台输出。
- 考虑拆分大型 store（如 `learning.ts`）为更小的模块，降低复杂度。
- 增加自动化测试（组件测试或端到端）以覆盖主要流程。
- 审视接口路径拼写（如 `courseSearchAdd` 缺少前斜杠）与 Mock/真实接口映射的一致性。
