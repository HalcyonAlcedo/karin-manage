import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import VueApexCharts from 'vue3-apexcharts';
import VueTablerIcons from 'vue-tabler-icons';
import Terminal from 'vue-web-terminal';
import { VueMasonryPlugin } from 'vue-masonry';
import { fakeBackend } from '@/utils/helpers/fake-backend';

// print
import print from 'vue3-print-nb';

import 'vue-web-terminal/lib/theme/dark.css'
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
fakeBackend();
app.use(router);
app.use(PerfectScrollbar);
app.use(pinia);
app.use(VueTablerIcons);
app.use(print);
app.use(VueApexCharts);
app.use(Terminal);
app.use(VueMasonryPlugin);
app.use(vuetify).mount('#app');
