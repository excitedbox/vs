import Vue from "vue";
import "./scss/style.scss";
import Fragment from 'vue-fragment';

Vue.use(Fragment.Plugin);
Vue.component('app', require('./component/App.vue').default);

// Start application
new Vue({
    el: '#app',
    data(): {} {
        return {};
    }
});