<template>
    <div>        
        <mu-text-field label="当前版本号" hintText="当前版本号" v-model="oldEdition" disabled/><br />
        <mu-text-field label="新版本号" hintText="新版本号" v-model="newEdition" /><br />
        <mu-raised-button label="修改版本号" class="demo-snackbar-button" @click="modifyEdition" primary/>
        <mu-raised-button label="编译JS代码" class="demo-snackbar-button" @click="compileCode" primary/>
        <mu-raised-button label="生成版本" class="demo-snackbar-button" @click="generateEdition" primary/>
    </div>
</template>

<script>
const spawn = require("child_process").spawn;
const ipcRenderer = require("electron").ipcRenderer;
const remote = require("electron").remote;
const fs = require("fs");

export default {
  data() {
    return {
      oldEdition: "",
      newEdition: "",
      preModifyContent: "",
      endModifyContent: "",
      client_modify_edition_path: "",
      client_compile_code_path: "",
      client_generate_eidtion_path: ""
    };
  },
  methods: {
    modifyEdition() {
      if (!this.newEdition || this.newEdition == "") {
        ipcRenderer.send("client_show_message", "新版本号不能为空");
        return;
      }

      if (this.newEdition < this.oldEdition) {
        ipcRenderer.send("client_show_message", "新版本号过旧");
        return;
      }

      let content =
        this.preModifyContent +
        'cur_version = "' +
        this.newEdition +
        '"' +
        this.endModifyContent;

      fs.writeFile(this.client_modify_edition_path, content, function(err) {
        if (err) {
          console.log(err);
        }
      });

      let editionPathArr = this.client_modify_edition_path.split("\\");
      let editionPath = "";
      let fileName = editionPathArr.pop();
      for (let i = 0; i < editionPathArr.length; i++) {
        const element = editionPathArr[i];
        editionPath += element + "\\";
      }

      let process = spawn("python", [fileName], { cwd: editionPath });
      let self = this;
      process.stdout.on("data", function(data) {
        console.log("stdout: " + data);
      });
      process.stderr.on("data", function(data) {
        console.log("stderr: " + data);
      });
      process.on("exit", function(code) {
        if (code == 0) {
          console.log("修改版本号成功,错误码:" + code);
          ipcRenderer.send("client_show_snack", "修改版本号成功");
          self.loadVersion();
        } else {
          console.log("修改版本号失败,错误码:" + code);
        }
      });
    },

    compileCode() {
      let compilePathArr = this.client_compile_code_path.split("\\");
      let compilePath = "";
      let fileName = compilePathArr.pop();
      for (let i = 0; i < compilePathArr.length; i++) {
        const element = compilePathArr[i];
        compilePath += element + "\\";
      }

      let process = spawn("python", [fileName], { cwd: compilePath });
      process.stdout.on("data", function(data) {
        console.log("stdout: " + data);
      });
      process.stderr.on("data", function(data) {
        console.log("stderr: " + data);
      });
      process.on("exit", function(code) {
        if (code == 0) {
          console.log("编译代码成功,错误码:" + code);
          ipcRenderer.send("client_show_snack", "编译代码成功");
        } else {
          console.log("编译代码失败,错误码:" + code);
        }
      });
    },

    generateEdition() {
      let editionPathArr = this.client_generate_eidtion_path.split("\\");
      let editionPath = "";
      let fileName = editionPathArr.pop();
      for (let i = 0; i < editionPathArr.length; i++) {
        const element = editionPathArr[i];
        editionPath += element + "\\";
      }

      let process = spawn(fileName, [], { cwd: editionPath });
      process.stdout.on("data", function(data) {
        console.log("stdout: " + data);
      });
      process.stderr.on("data", function(data) {
        console.log("stderr: " + data);
      });
      process.on("exit", function(code) {
        if (code == 0) {
          console.log("生成版本成功,错误码:" + code);
          ipcRenderer.send("client_show_snack", "生成版本成功");
        } else {
          console.log("生成版本失败,错误码:" + code);
        }
      });
    },

    loadVersion() {
      let content = fs.readFileSync(this.client_modify_edition_path, "utf-8");
      let arr = content.split("cur_version");
      this.preModifyContent = arr.shift();
      let arr1 = arr.shift().split('"');
      arr1.shift();
      this.oldEdition = arr1.shift();
      this.endModifyContent = "";
      for (let i = 0; i < arr1.length; i++) {
        const element = arr1[i];
        if (i != arr1.length - 1) {
          this.endModifyContent += element + '"';
        } else {
          this.endModifyContent += element;
        }
      }

      this.endModifyContent += "cur_version";

      for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if (i != arr.length - 1) {
          this.endModifyContent += element + "cur_version";
        } else {
          this.endModifyContent += element;
        }
      }
    }
  },
  watch: {
    newEdition: function(val, oldVal) {
      val;
    }
  },
  mounted() {
    this.client_modify_edition_path = remote.getGlobal(
      "sharedObject"
    ).client_modify_edition_path;
    this.client_compile_code_path = remote.getGlobal(
      "sharedObject"
    ).client_compile_code_path;
    this.client_generate_eidtion_path = remote.getGlobal(
      "sharedObject"
    ).client_generate_eidtion_path;

    this.loadVersion();
  }
};
</script>