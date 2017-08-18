<template>
    <div>
        <mu-raised-button label="show Proto" class="demo-snackbar-button" @click="showToast" />
        <mu-toast v-if="toast" message="Proto" @close="hideToast" />
    </div>
</template>


<script>
export default {
    data () {
        return {
            toast: false
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
        }
    }
}
</script>

<style lang="css">
.demo-snackbar-button {
    margin: 12px;
}
</style>