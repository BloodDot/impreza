<template>
    <div>
        <mu-raised-button label="生成json文件" class="demo-snackbar-button" @click="createJson" primary/>
        <mu-raised-button label="生成typescript类" class="demo-snackbar-button" @click="createTypescript" primary/>
        <mu-raised-button label="合成proto文件" class="demo-snackbar-button" @click="composeProto" primary/>
    </div>
</template>

<script>
var exec = require('child_process').exec;
const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;
const fs = require('fs');

export default {
    data () {
        return {
            project_path: "",
            proto_path: ""
        }
    },
    methods: {
        createJson () {
            var cmdStr = "pbjs " + this.proto_path + "/a_proto_list.md > " + this.project_path + "/assets/resources/proto/proto.json"
            exec(cmdStr, function (err, stdout, stderr) {
                if (err) {
                    ipcRenderer.send('client_show_message', "生成json错误");
                } else {
                    ipcRenderer.send('client_show_message', "生成json成功");
                }
            });
        },
        createTypescript () {
            var cmdStr = "proto2typescript --file " + this.project_path + "/assets/resources/proto/proto.json" + " > " + this.project_path + "/assets/script/game/net/proto/proto.d.ts";
            console.log(cmdStr);
            exec(cmdStr, function (err, stdout, stderr) {
                if (err) {
                    ipcRenderer.send('client_show_message', "生成typescript错误");
                } else {
                    ipcRenderer.send('client_show_message', "生成typescript成功");
                }
            });
        },
        composeProto () {
            var pa = fs.readdirSync(this.proto_path);
            var content = "";
            pa.forEach(function (ele, index) {
                var info = fs.statSync(this.proto_path + "/" + ele)
                if (info.isDirectory()) {
                    readDirSync(this.proto_path + "/" + ele);
                } else {
                    var t = ele.split(".")[1];
                    if (t == "proto") {
                        var eleContent = fs.readFileSync(this.proto_path + "/" + ele, "utf-8");
                        content += "// ----- from " + ele + " ---- \n";
                        content += eleContent + "\n";
                    }
                }
            }.bind(this));

            var ppath = this.project_path + "/assets/resources/proto/game.proto";
            fs.writeFile(ppath, content, function (err) {
                if (!err) {
                    ipcRenderer.send('client_show_message', "合成proto成功");
                }
            });
        }
    },
    mounted () {
        this.project_path = remote.getGlobal('sharedObject').client_project_path;
        this.proto_path = remote.getGlobal('sharedObject').client_proto_path;
    }
}
</script>

<style lang="css">
.demo-snackbar-button {
    margin: 12px;
}
</style>