import Vue from 'vue'
import App from './App.vue'
import * as VueGoogleMaps from 'vue2-google-maps'
import router from './router'

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyDL9LEVyiiZF7rZOy6wRgRiKrdzva_hVmg',
    libraries: 'places',
  },
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
