import { createApp } from "vue";
import "./main.css";
import App from "./App.vue";
import router from "./router";
import './iconfont/iconfont.css'// 引入图标字体

const app = createApp(App);
app.use(router);
app.mount("#app");
