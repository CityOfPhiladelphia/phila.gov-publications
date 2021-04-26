import BrowserSupport from  "./browser-support.js";
BrowserSupport.isIE();

import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
