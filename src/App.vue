<script setup lang="ts">
import { onMounted } from "vue";
import Auth from "./components/Auth.vue";

onMounted(() => {
  window.ipcRenderer.on(
    "upgrade_message",
    (event, { message, data, checkUpdateFromMenu }) => {
      console.log(
        "index.html收到更新相关消息,message: %s,data:%s,checkUpdateFromMenu:%s",
        message,
        data,
        checkUpdateFromMenu
      );
      if (message === "isUpdateNow") {
        if (window.confirm("是否现在更新？")) {
          window.ipcRenderer.send("updateNow");
        }
      }

      if (message === "update-available") {
        this.checkUpdateMessage((error, response, body) => {
          if (!error) {
            let versionJson = JSON.parse(body);
            if (versionJson.current.version === data.version) {
              data.releaseNotes = versionJson.current.desc;
            }
            console.log(versionJson);
          }
        });
      }
    }
  );
  window.ipcRenderer.send("update");
});
</script>

<template>
  <Auth />
</template>
