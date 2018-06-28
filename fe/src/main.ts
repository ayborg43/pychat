import Vue from 'vue';

import './assets/sass/common.sass';
import './assets/smileys.js';
import App from './components/App.vue';
import {api, browserVersion, globalLogger, storage, ws} from './utils/singletons';
import store from './store';
import router from './router';
import loggerFactory from './utils/loggerFactory';


window.addEventListener('focus', () => {
  if (store.state.userInfo && ws.isWsOpen()) {
    // ws.pingServer();
  }
});
store.watch(s => s.userSettings && s.userSettings.theme || 'color-reg', (v, o) => {
  document.body.parentElement.className = v;
});

window.onerror = function (msg, url, linenumber, column, errorObj) {
  let message = `Error occurred in ${url}:${linenumber}\n${msg}`;
  if (!!store.state.userSettings || store.state.userSettings.sendLogs) {
    api.sendLogs(`${url}:${linenumber}:${column || '?'}\n${msg}\n\nOBJ:  ${errorObj || '?'}`, browserVersion);
  }
  store.dispatch('growlError', message);
  return false;
};

Vue.mixin({
  computed: {
    logger() {
      if (!this.__logger) {
        let name = this.$options['_componentTag'] || 'vue-comp';
        if (this.id) {
          name += `:${this.id}`;
        }
        this.__logger = loggerFactory.getLoggerColor(name, '#35495e');
      }
      return this.__logger;
    }
  },
  updated: function() {
    this.logger.debug('Updated')();
  },
  created: function() {
    this.logger.debug('Created')();
  },
});

Vue.prototype.$api = api;
Vue.prototype.$ws = ws;
document.addEventListener('DOMContentLoaded', function () {
  document.body.addEventListener('drop', e => e.preventDefault());
  document.body.addEventListener('dragover', e => e.preventDefault());
  storage.connect(finished => {
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app');
  });
});
