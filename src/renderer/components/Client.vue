<template>
    <div class="layout">
        <div class="header">
            <div class="logo">
                Muse-UI
            </div>
        </div>
        <div class="content">
            <div class="content-left">
                <mu-list @change="handleListChange" :value="activeList">
                    <mu-list-item title="Module" value="ClientModule">
                        <mu-icon slot="left" value="assignment" />
                    </mu-list-item>

                    <mu-list-item title="Proto" value="ClientProto">
                        <mu-icon slot="left" value="swap_vert" />
                    </mu-list-item>

                    <mu-divider/>
                    <mu-list-item title="Setting" value="ClientSetting">
                        <mu-icon slot="left" value="build" />
                    </mu-list-item>
                </mu-list>
            </div>
            <div class="content-right">
                <div class="body">
                    <component :is='currentView' keep-alive></component>
                </div>
            </div>
        </div>
        <div class="footer">
            Muse-UI ©2017 Created by Muse-UI
        </div>
    </div>
</template>
<script>
export default {
    data () {
        return {
            activeList: 'ClientModule',
            currentView: "ClientModule"
        }
    },
    methods: {
        handleListChange (val) {
            this.activeList = val
            this.currentView = val
        }
    },
    components: {
        "ClientModule": require('./Client/ClientModule'),
        "ClientProto": require('./Client/ClientProto'),
        "ClientSetting": require('./Client/ClientSetting')
    }
}
</script>
<style scoped>
.layout {
    background-color: rgb(236, 236, 236);
}

.header {
    background-color: #7e57c2;
}

.logo {
    font-size: 24px;
    color: white;
    display: inline-block;
    padding: 10px 20px;
}

.nav {
    display: inline-block;
    width: calc(100% - 150px);
    margin: 0 auto;
}

.tab {
    margin: 0 auto;
    width: 400px;
    background-color: rgba(0, 0, 0, 0);
}

.content {
    overflow: hidden;
}

.content-left {
    width: 30%;
    float: left;
    background-color: white;
    margin-bottom: -4000px;
    padding-bottom: 4000px;
}

.content-right {
    width: 70%;
    display: inline-block;
    float: right;
    padding: 10px 20px;
    background-color: rgba(0, 0, 0, 0)
}

.breadcrumb {
    margin: 10px 0;
}

.body {
    background-color: white;
    border-radius: 5px;
    min-height: 500px;
}

.footer {
    padding: 20px 0;
    text-align: center;
}
</style>