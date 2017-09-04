<template>
    <div>
        <mu-sub-header>Setting</mu-sub-header>
        <mu-content-block class="demo-raised-button-container">
            <mu-text-field label="设置作者" hintText="作者" v-model="client_author" />
        </mu-content-block>
        <mu-content-block class="demo-raised-button-container">
            <mu-text-field label="设置项目目录" hintText="项目目录" v-model="client_project_path" />
            <mu-raised-button label="选择" class="demo-raised-button" primary @click="onProjectPathClick" />
        </mu-content-block>
        <mu-content-block class="demo-raised-button-container">
            <mu-text-field label="设置协议目录" hintText="项目目录" v-model="client_proto_path" />
            <mu-raised-button label="选择" class="demo-raised-button" primary @click="onProtoPathClick" />
        </mu-content-block>

    </div>
</template>

<<script>
const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

export default {
    data () {
        return {
            client_author:"",
            client_project_path: "",
            client_proto_path:""
        }
    },
    methods: {
        onProjectPathClick () {
            ipcRenderer.send('open_client_project_path');
        },
        onProtoPathClick () {
            ipcRenderer.send('open_client_proto_path');
        },
    },
    watch: {
        client_author: function(val, oldVal) {
            if(val != oldVal) {
                remote.getGlobal('sharedObject').client_author = val;
                localStorage.setItem("client_author",val);
            }
        },
        client_project_path: function (val, oldVal) {
            if(val != oldVal){
                remote.getGlobal('sharedObject').client_project_path = val;
                localStorage.setItem("client_project_path",val);
            }
        },
        client_proto_path: function (val, oldVal) {
            if(val != oldVal){
                remote.getGlobal('sharedObject').client_proto_path = val;
                localStorage.setItem("client_proto_path",val);
            }
        },
    },
    mounted() {
        var author = localStorage.getItem("client_author");
        var project_path = localStorage.getItem("client_project_path");
        var proto_path = localStorage.getItem("client_proto_path");
        if(author){
            this.client_author = author;
        }
        if(project_path){
            this.client_project_path = project_path;
        }
        if(proto_path){
            this.client_proto_path = proto_path;
        }

        ipcRenderer.on('selected_client_project_path', function (event, path) {
            this.client_project_path = path[0];
        }.bind(this)),

        ipcRenderer.on('selected_client_proto_path', function (event, path) {
            this.client_proto_path = path[0];
        }.bind(this));
    }
}
</script>


<style lang="css">
.file-button {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    opacity: 0;
}

.demo-raised-button-container {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.demo-raised-button {
    margin: 12px;
}
</style>