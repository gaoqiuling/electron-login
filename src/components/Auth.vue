<script setup lang="ts">
import { reactive, computed, onMounted } from "vue";
import copy from "copy-to-clipboard";
import { ElMessage } from "element-plus";
import { post } from "../network";
import { useStore } from "vuex";

const store = useStore();
const userNameList = computed(() => {
  let items = store.state.userGroups;
  if (items && items[form.systemName]) {
    return items[form.systemName].map((t) => t.name);
  }
  return [];
});

const form = reactive({
  systemName: "",
  name: "",
  password: "",
  auth: "",
});
const systemLoginUrlMap = new Map([
  ["zhigoufront", "http://39.107.45.229:8070/client/login"],
  ["zhigouadmin", "http://39.107.45.229:8070/login"],
  ["baoli", "http://39.107.45.229:8081/login"],
]);

onMounted(() => {
  form.systemName = "zhigoufront";
  let items = store.state.newest;
  console.log(items);
  if (items?.length === 3) {
    form.systemName = items[0];
    form.name = items[1];
    form.password = items[2];
    search();
  }
});

const systemChange = () => {
  form.name = "";
  form.password = "";
  form.auth = "";
};
const userChange = () => {
  let item = store.state.userGroups[form.systemName]?.filter(
    (user) => user.name === form.name
  );
  if (item.length > 0) {
    form.password = item[0].password;
    search();
  }
};
const search = async () => {
  if (!form.name || !form.password) {
    return;
  }
  form.auth = "";
  let res = await post({
    url: systemLoginUrlMap.get(form.systemName) ?? "",
    data: {
      username: form.name,
      password: form.password,
    },
  });
  form.auth = "Bearer " + res.token;
  store.dispatch("addUser", {
    type: form.systemName,
    name: form.name,
    password: form.password,
  });
};

const copyToClipboard = () => {
  copy(form.auth);
  ElMessage({
    message: "已复制到剪切板",
    type: "success",
  });
};

const copyPasswordToClipboard = () => {
  copy(form.password);
  ElMessage({
    message: "已复制到剪切板",
    type: "success",
  });
};
</script>

<template>
  <el-form :model="form" label-width="auto" style="max-width: 600px">
    <el-row>
      <el-form-item label="选择系统">
        <el-radio-group v-model="form.systemName" @change="systemChange()">
          <el-radio value="zhigoufront">智购前台</el-radio>
          <el-radio value="zhigouadmin">智购后台</el-radio>
          <el-radio value="baoli">保理后台</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-row>
    <el-row>
      <el-form-item label="用户名" :span="6">
        <el-select
          v-model="form.name"
          allow-create
          filterable
          clearable
          :reserve-keyword="false"
          @change="userChange()"
          placeholder=""
          class="input-width"
        >
          <el-option
            v-for="userName in userNameList"
            :key="userName"
            :value="userName"
          >
            {{ userName }}
          </el-option>
        </el-select>
      </el-form-item>
    </el-row>
    <el-row>
      <el-form-item label="密码">
        <el-col :span="8">
          <el-input v-model="form.password" class="input-width" />
        </el-col>
        <el-col :span="12">
          <el-button @click="copyPasswordToClipboard()" v-if="form.password"
            >复 制</el-button
          ></el-col
        >
      </el-form-item>
    </el-row>
    <el-row>
      <el-form-item>
        <el-button @click="search()" type="primary">查询</el-button>
      </el-form-item>
    </el-row>
    <el-divider>Authorization</el-divider>
    <el-row style="height: 200px">
      <el-form-item>
        <el-col>
          <span
            style="
              display: block;
              word-wrap: break-word;
              text-align: left;
              width: 500px;
            "
            v-text="form.auth"
          >
          </span>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-col>
          <el-button @click="copyToClipboard()" v-if="form.auth"
            >复 制</el-button
          ></el-col
        >
      </el-form-item>
    </el-row>
  </el-form>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
.divider-text::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #dcdfe6;
  transform: translateY(-50%);
}

.input-width {
  width: 200px;
}
</style>
