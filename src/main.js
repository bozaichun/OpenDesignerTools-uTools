// 应用入口：挂载 Vue 实例，按规范顺序引入全局样式与路由
import { createApp } from "vue";
import "../rules/VariableFile/ThemeStyle.css";
import "../rules/VariableFile/SystemStyle.css";
import "../rules/VariableFile/ResetStyle.css";
import App from "./App.vue";
import router from "./router";
import "./iconfont/iconfont.css";

const app = createApp(App);
app.use(router);
app.mount("#app");
