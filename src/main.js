import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

let app;

if ("serviceWorker" in navigator) {
  // Register a service worker hosted at the root of the
  // site using the default scope.
  navigator.serviceWorker
    .register("/sw.js")
    .then((/*registration*/) => navigator.serviceWorker.ready)
    .catch((error) => {
      console.log("Service worker registration failed:", error);
    })
    ?.then((/*registration*/) => {
      const vuetify = createVuetify({
        components,
        directives,
      });
      const pinia = createPinia();
      app = createApp(App);
      app.use(router);
      app.use(pinia);
      app.use(vuetify);
      app.mount("#app");
    });
} else {
  console.log("Service workers are not supported.");
}
