import { createApp } from "vue";
import "../rules/VariableFile/ThemeStyle.css";
import "../rules/VariableFile/SystemStyle.css";
import "../rules/VariableFile/ResetStyle.css";
import App from "./App.vue";
import router from "./router";
import './iconfont/iconfont.css'// 引入图标字体

const app = createApp(App);
app.use(router);
app.mount("#app");
