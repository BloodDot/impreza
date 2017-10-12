import Router from 'vue-router'
import Vue from 'vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'client',
      component: require('@/components/Client')
    },
    {
      path: '/server',
      name: 'server',
      component: require('@/components/Server')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
