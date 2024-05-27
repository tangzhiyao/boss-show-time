import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import sidepanel from './App.vue'
import  router  from "./router";
import { initBridge } from '@/api/common';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

async function init(){
    await initBridge();
    const app = createApp(sidepanel)
    app.use(ElementPlus)
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        app.component(key, component)
      }
    app.use(router)
    app.mount('#app');
}
init();