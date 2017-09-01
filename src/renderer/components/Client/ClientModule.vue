<template>
    <div>
        <mu-raised-button label="创建模块" class="demo-snackbar-button" @click="showDialog" primary/>

        <mu-sub-header>模块列表</mu-sub-header>
        <mu-table :fixedHeader="fixedHeader" :height="tableHeight" :enableSelectAll="enableSelectAll" :multiSelectable="multiSelectable" :selectable="selectable" :showCheckbox="showCheckbox">
            <mu-thead>
                <mu-tr>
                    <mu-th class="demo-table-module">模块</mu-th>
                    <mu-th>关联窗口</mu-th>
                </mu-tr>
            </mu-thead>
            <mu-tbody>
                <mu-tr v-for="item,index in tableData" :key="index" :selected="item.selected">
                    <mu-td>{{item.moduleName}}</mu-td>
                    <mu-td> {{ item.windows }}</mu-td>
                </mu-tr>
            </mu-tbody>
        </mu-table>

        <mu-toast v-if="toast" :message="toastContent" @close="hideToast" />

        <mu-dialog :open="dialog" title="创建模块" @close="hideDialog">
            <mu-content-block class="demo-raised-button-container">
                <mu-text-field class="demo-text-field" label="请输入模块名称" hintText="模块名称" v-model="module_name" />
            </mu-content-block>
            <mu-content-block class="demo-raised-button-container">
                <mu-text-field class="demo-text-field" label="请输入模块中文名称" hintText="模块中文名称" v-model="module_cn_name" />
            </mu-content-block>

            <mu-flat-button slot="actions" @click="hideDialog" primary label="取消" />
            <mu-flat-button slot="actions" primary @click="createModule" label="确定" />
        </mu-dialog>
    </div>
</template>


<script>
const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

export default {
    data () {
        return {
            module_name: "",
            module_cn_name: "",

            toast: false,
            toastContent: "",
            dialog: false,


            tableHeight: "750px",
            fixedHeader: true,
            selectable: false,
            multiSelectable: false,
            enableSelectAll: false,
            showCheckbox: false,
            tableData: [

            ]
        }
    },
    methods: {
        showToast (content = "") {
            this.toastContent = content;
            this.toast = true;
            if (this.toastTimer) {
                clearTimeout(this.toastTimer);
            }
            this.toastTimer = setTimeout(() => { this.toast = false }, 2000);
        },
        hideToast () {
            this.toast = false;
            if (this.toastTimer) clearTimeout(this.toastTimer);
        },
        showDialog () {
            this.dialog = true;
        },
        hideDialog () {
            this.dialog = false;
            this.module_name = "";
            this.module_cn_name = "";
        },
        createModule () {
            if (!this.module_name) {
                this.showToast("模块名不能为空");
                return;
            }

            if (!this.module_cn_name) {
                this.showToast("模块中文名不能为空");
                return;
            }

            for (var i = 0; i < this.tableData.length; i++) {
                if (this.tableData[i].moduleName == this.module_name) {
                    this.showToast("已存在该模块");
                    this.hideDialog();
                    return;
                }
            }

            ipcRenderer.send('client_create_module', this.module_name, this.module_cn_name);

            this.hideDialog();
        },
    },
    mounted () {
        this.tableData = remote.getGlobal('sharedObject').client_modules;

        ipcRenderer.on('client_init_complete', function (event, modules) {
            this.tableData = modules;
        }.bind(this))

        ipcRenderer.on('client_module_refresh_complete', function (event, modules) {
            this.tableData = modules;
        }.bind(this))
    }
}
</script>

<style lang="css">
.demo-snackbar-button {
    margin: 12px;
}

.demo-raised-button-container {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.demo-table-module {
    width: 80px
}
</style>