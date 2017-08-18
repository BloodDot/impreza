
<template>
    <div>
        <mu-sub-header>Setting</mu-sub-header>
        <mu-content-block class="demo-raised-button-container">
            <mu-text-field class="demo-text-field" :hintText="pathLabel" />
            <mu-raised-button label="选择目录" class="demo-raised-button" primary @click="onPathClick" />
        </mu-content-block>
    
    </div>
</template>

<<script>
const ipcRenderer = require('electron').ipcRenderer;

export default {
    data () {
        return {
            toast: false,
            pathLabel: "选择目录"
        }
    },
    methods: {
        onPathClick () {
            ipcRenderer.send('open-file-dialog');
        }
    },
    watch: {
        pathLabel: function (val, oldVal) {
            console.log('val:' + val);
        }
    },
    mounted () {
        ipcRenderer.on('selected-directory', function (event, path) {
                this.pathLabel = path;
            })
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

.demo-text-field {
    top: 5px
}
</style>