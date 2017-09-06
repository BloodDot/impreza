<template>
    <div>
        <mu-raised-button label="生成json文件" class="demo-snackbar-button" @click="createJson" primary/>
        <mu-raised-button label="生成typescript类" class="demo-snackbar-button" @click="createTypescript" primary/>
        <mu-raised-button label="合成proto文件" class="demo-snackbar-button" @click="composeProto" primary/>

        <mu-card>
            <mu-card-title title="协议配置" subTitle="" />
            <div class="content">
                <div class="content-left">
                    <mu-content-block class="demo-raised-button-container">
                        <mu-select-field v-model="game_module_name" :labelFocusClass="['label-foucs']" label="选择游戏模块">
                            <mu-menu-item v-for="data,index in game_modules" :key="index" :value="data.moduleName" :title="data.moduleName" />
                        </mu-select-field>
                    </mu-content-block>
                    <mu-content-block class="demo-raised-button-container">
                        <mu-select-field v-model="proto_module_name" :labelFocusClass="['label-foucs']" label="选择协议模块">
                            <mu-menu-item v-for="data,index in proto_modules" :key="index" :value="data" :title="data" />
                        </mu-select-field>
                    </mu-content-block>
                    <mu-content-block class="demo-raised-button-container">
                        <mu-select-field v-model="proto_file_name" :labelFocusClass="['label-foucs']" label="选择协议文件">
                            <mu-menu-item v-for="data,index in protoFiles" :key="index" :value="data" :title="data" />
                        </mu-select-field>
                    </mu-content-block>
                </div>
                <div class="content-right">
                    <mu-table :fixedHeader="fixedHeader" :height="tableHeight" :showCheckbox="false">
                        <mu-thead>
                            <mu-tr>
                                <mu-th class="demo-table-proto">cmd</mu-th>
                                <mu-th>request</mu-th>
                                <mu-th>response</mu-th>
                            </mu-tr>
                        </mu-thead>
                        <mu-tbody>
                            <mu-tr v-for="cmd,index in proto_cmds" :key="index" :selected="cmd.selected">
                                <mu-td>{{cmd}}</mu-td>
                                <mu-td>
                                    <mu-select-field class="demo-table-item-select-field" :underlineShow="false" :maxHeight="tableItemHeight" v-on:change="requestInput(cmd, $event)">
                                        <mu-menu-item v-for="data,index in proto_messages" :key="index" :value="data.name" :title="data.name" />
                                    </mu-select-field>
                                </mu-td>
                                <mu-td>
                                    <mu-select-field class="demo-table-item-select-field" :underlineShow="false" :maxHeight="tableItemHeight" v-on:change="responseInput(cmd, $event)">
                                        <mu-menu-item v-for="data,index in proto_messages" :key="index" :value="data.name" :title="data.name" />
                                    </mu-select-field>
                                </mu-td>
                            </mu-tr>
                        </mu-tbody>
                    </mu-table>
                </div>
            </div>
            <mu-card-actions>
                <mu-raised-button label="生成" class="demo-snackbar-button" @click="protoSetting" primary/>
                <mu-raised-button label="清除" class="demo-snackbar-button" @click="clearData" backgroundColor="#e91e63" primary/>
            </mu-card-actions>
        </mu-card>

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
            fixedHeader: true,
            tableHeight: "500px",
            tableItemHeight: 300,
            project_path: "",
            proto_path: "",
            game_module_name: "",
            proto_module_name: "",
            proto_file_name: "",
            game_modules: [

            ],
            proto_modules: [

            ],
            protoFiles: [

            ],
            proto_cmds: [

            ],
            proto_messages: [

            ],
            proto_objs: [

            ],
            proto_cmd_class: "",
        }
    },
    watch: {
        proto_file_name: function (val, oldVal) {
            if (val != oldVal) {
                ipcRenderer.send('client_select_proto_file', val);
            }
        },
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
        },
        protoSetting () {
            ipcRenderer.send('client_setting_proto', this.game_module_name, this.proto_module_name, this.proto_cmd_class, this.proto_objs);
        },
        requestInput (cmd, request) {
            var hasCmd = false;
            for (var index = 0; index < this.proto_objs.length; index++) {
                var element = this.proto_objs[index];
                if (element.cmd == cmd) {
                    hasCmd = true;
                    element.request = request;
                    break;
                }
            }
            if (!hasCmd) {
                var obj = {};
                obj.cmd = cmd;
                obj.request = request;
                this.proto_objs.push(obj);
            }
        },
        responseInput (cmd, response) {
            var hasCmd = false;
            for (var index = 0; index < this.proto_objs.length; index++) {
                var element = this.proto_objs[index];
                if (element.cmd == cmd) {
                    hasCmd = true;
                    element.response = response;
                    break;
                }
            }
            if (!hasCmd) {
                var obj = {};
                obj.cmd = cmd;
                obj.response = response;
                this.proto_objs.push(obj);
            }
        },
        clearData () {
            this.game_module_name = "";
            this.proto_module_name = "";
            this.proto_file_name = "";
            this.proto_cmds = [];
            this.proto_messages = [];
            this.proto_objs = [];
            this.proto_cmd_class = "";
        }
    },
    mounted () {
        this.project_path = remote.getGlobal('sharedObject').client_project_path;
        this.proto_path = remote.getGlobal('sharedObject').client_proto_path;
        this.game_modules = remote.getGlobal('sharedObject').client_modules;
        this.proto_modules = remote.getGlobal('sharedObject').proto_modules;
        this.protoFiles = remote.getGlobal('sharedObject').proto_files;

        ipcRenderer.removeAllListeners(['client_init_complete', 'client_proto_refresh_complete']);

        ipcRenderer.on('client_proto_refresh_complete', function (event, modules, proto_modules, protoFiles) {
            this.game_modules = modules;
            this.proto_modules = proto_modules;
            this.protoFiles = protoFiles;
        }.bind(this));

        ipcRenderer.on('client_select_proto_file_complete', function (event, proto_cmd_class, proto_cmds, proto_messages) {
            this.proto_cmd_class = proto_cmd_class;
            this.proto_cmds = proto_cmds;
            this.proto_messages = proto_messages;
        }.bind(this));

        ipcRenderer.on('client_setting_proto_complete', function (event) {
            this.clearData();
        }.bind(this));


    }
}
</script>

<style lang="css">
.demo-snackbar-button {
    margin: 12px;
}

.demo-table-item-select-field {
    margin-top: 12px;
}

.content {
    overflow: hidden;
}

.content-left {
    width: 20%;
    float: left;
    background-color: white;
    margin-bottom: -4000px;
    padding-bottom: 4000px;
}

.content-right {
    width: 80%;
    display: inline-block;
    float: right;
    padding: 10px 20px;
    background-color: rgba(0, 0, 0, 0)
}

.demo-table-proto {
    /* width: 250px */
}
</style>