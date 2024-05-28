<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu"
    mode="horizontal"
    :ellipsis="false"
    router="true"
    @select="handleSelect"
  >
  <div class="flex-grow" /> 
    <el-menu-item index="1" route="/">首页</el-menu-item>
    <el-menu-item index="2" route="/setting">设置</el-menu-item>
  </el-menu>
  <router-view />
</template>
<script lang="ts" setup>
import { ref } from "vue";

const activeIndex = ref("1");
const handleSelect = (key: string, keyPath: string[]) => {
  
};
</script>
<style lang="scss">
#app {
}
.el-menu{

}
.flex-grow {
  flex-grow: 1;
}
</style>
