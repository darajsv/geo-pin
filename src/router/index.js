import Vue from 'vue'
import VueRouter from 'vue-router'
import GoogleMapsView from '../views/GoogleMapsView.vue'
import HomePageView from '../views/HomePageView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: HomePageView,
  },
  {
    path: '/maps',
    component: GoogleMapsView,
    beforeEnter: (to, from, next) => {
      if (to.query.id) {
        next();
      }
      
    },
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
