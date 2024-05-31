<template>
  <el-col>
    <el-row class="setting_item">
      <el-descriptions title="数据">
        <el-descriptions-item>
          <el-popconfirm
            title="确认备份数据？"
            @confirm="onClickDbExport"
            confirm-button-text="确定"
            cancel-button-text="取消"
          >
            <template #reference>
              <el-button :icon="DocumentCopy" v-loading="exportLoading"
                >数据备份</el-button
              >
            </template>
          </el-popconfirm>
          <el-button :icon="CopyDocument" @click="importDialogVisible = true"
            >数据恢复</el-button
          >
        </el-descriptions-item>
      </el-descriptions>
    </el-row>
  </el-col>
  <el-dialog v-model="importDialogVisible" title="数据恢复" width="500">
    <div>
      <el-text class="mx-1" type="danger">注意：原数据会被清除!!!</el-text>
    </div>
    <div>
      <el-text class="mx-1" type="info">请选择备份文件</el-text>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-row>
          <input
            type="file"
            accept=".zip"
            ref="importFileInput"
            @change="handleFileImport"
          />
        </el-row>
        <el-row class="dialog_menu">
          <el-button type="primary" @click="confirmFileImport">
            确定
          </el-button>
        </el-row>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="reloadDialogVisible"
    title="数据恢复成功"
    width="500"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <span>点击确定按钮重启插件</span>
    <template #footer>
      <el-row class="dialog_menu">
        <el-button type="primary" @click="reloadExtension"> 确定 </el-button>
      </el-row>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import dayjs from "dayjs";
import { dbExport, dbImport } from "@/api/common";
import { base64ToBytes, bytesToBase64 } from "@/utils/base64.js";
import { ElMessage, ElLoading } from "element-plus";
import { DocumentCopy, CopyDocument } from "@element-plus/icons-vue";

const activeName = ref("export");
const exportLoading = ref(false);
const importDialogVisible = ref(false);
const importFileInput = ref<HTMLInputElement | null>(null);
const files = ref();
const reloadDialogVisible = ref(false);

const handleFileImport = async () => {
  files.value = importFileInput.value?.files;
};

const reloadExtension = async () => {
  chrome.runtime.reload();
};

const confirmFileImport = async () => {
  let loading;
  try {
    if (files.value && files.value.length > 0) {
      loading = ElLoading.service({
        lock: true,
        text: "数据恢复中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      const reader = new FileReader();
      reader.readAsArrayBuffer(files.value[0]);
      reader.onload = async function (event) {
        let arrayBuffer = event.target.result;
        try {
          let base64String = bytesToBase64(
            new Uint8Array(arrayBuffer as ArrayBuffer)
          );
          await dbImport(base64String);
          importDialogVisible.value = false;
          reloadDialogVisible.value = true;
        } catch (e) {
          ElMessage({
            message: "恢复备份文件失败[" + e.message + "]",
            type: "error",
          });
        }
      };
      reader.onerror = function (event) {
        ElMessage({
          message: "读取备份文件失败",
          type: "error",
        });
      };
    } else {
      ElMessage("请选择有效的备份文件");
    }
  } finally {
    if (loading) {
      loading.close();
    }
  }
};

const onClickDbImport = async () => {
  importDialogVisible.value = false;
};

const onClickDbExport = async () => {
  let result = await dbExport();
  exportLoading.value = true;
  try {
    downloadBlob(
      base64ToBytes(result),
      dayjs(new Date()).format("YYYYMMDDHHmmss") + ".zip",
      "application/octet-stream"
    );
  } finally {
    exportLoading.value = false;
  }
};

const downloadBlob = function (data, fileName, mimeType) {
  let blob, url;
  blob = new Blob([data], {
    type: mimeType,
  });
  url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(function () {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

const downloadURL = function (data, fileName) {
  let a;
  a = document.createElement("a");
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style = "display: none";
  a.click();
  a.remove();
};
</script>
<style lang="scss">
.setting_item {
  padding: 10px;
}
.dialog_menu {
  justify-content: end;
}
</style>
