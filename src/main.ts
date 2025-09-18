import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import pinia from "./stores"; // 导入Pinia实例

// Import Vant
import {
  Button,
  Cell,
  CellGroup,
  Tabbar,
  TabbarItem,
  Search,
  Tag,
  Toast,
  NavBar,
  Swipe, 
  SwipeItem,
  Icon,
  Field,
  Checkbox,
  Dialog
} from "vant";
import "vant/lib/index.css";

// Import Tailwind CSS
import "./assets/styles/index.css";

// Import HTTP service
import http from "./http";
import { apiService } from "./http/api";
import { useAuthStore } from "./stores/auth";

// Import cache utilities for development
import "./utils/clearCache";

const app = createApp(App);

app.use(pinia); // 注册Pinia
app.use(router);
app.use(Button);
app.use(Cell);
app.use(CellGroup);
app.use(Tabbar);
app.use(TabbarItem);
app.use(Search);
app.use(Tag);
app.use(Toast);
app.use(NavBar);
app.use(Swipe);
app.use(SwipeItem);
app.use(Icon);
app.use(Field);
app.use(Checkbox);
app.use(Dialog);

// 全局注册 HTTP 服务
app.config.globalProperties.$http = http;
app.config.globalProperties.$api = apiService;

// 初始化认证状态
const authStore = useAuthStore();
authStore.initializeAuth().then(() => {
  app.mount("#app");
}).catch(() => {
  // 即使初始化失败也要挂载应用
  app.mount("#app");
});
