<template>
    <div>
        <mu-raised-button label="show Module" class="demo-snackbar-button" @click="showDialog" />
        <mu-toast v-if="toast" message="Module" @close="hideToast" />

        <mu-dialog :open="dialog" title="创建模块" @close="hideDialog">
            <mu-content-block class="demo-raised-button-container">
                <mu-text-field class="demo-text-field" label="请输入模块名称" hintText="模块名称" v-model="module_name" />
            </mu-content-block>
            <mu-content-block class="demo-raised-button-container">
                <mu-text-field class="demo-text-field" label="请输入模块中文名称" hintText="模块中文名称" v-model="module_cn_name" />
            </mu-content-block>

            <mu-flat-button slot="actions" @click="hideDialog" primary label="取消" />
            <mu-flat-button slot="actions" primary @click="hideDialog" label="确定" />
        </mu-dialog>
    </div>
</template>


<script>
export default {
    data () {
        return {
            toast: false,
            dialog: false,
            module_name: "",
            module_cn_name: ""
        }
    },
    methods: {
        showToast () {
            this.toast = true
            if (this.toastTimer) clearTimeout(this.toastTimer)
            this.toastTimer = setTimeout(() => { this.toast = false }, 2000)
        },
        hideToast () {
            this.toast = false
            if (this.toastTimer) clearTimeout(this.toastTimer)
        },
        showDialog () {
            this.dialog = true
        },
        hideDialog () {
            this.dialog = false
        }
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
</style>