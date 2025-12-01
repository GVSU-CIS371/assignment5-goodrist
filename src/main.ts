import { createApp } from "vue";
import "./styles/mug.scss";
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import App from "./App.vue";

import { useBeverageStore } from "./stores/beverageStore";

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

const app = createApp(App);
app.use(pinia);

// Initialize store (NO .then())
const store = useBeverageStore();
store.init();

// Mount app
app.mount("#app");
