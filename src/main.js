import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { create } from "lodash";

let app;

if ("serviceWorker" in navigator) {
  // Register a service worker hosted at the root of the
  // site using the default scope.
  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => navigator.serviceWorker.ready)
    .catch((error) => {
      console.log("Service worker registration failed:", error);
    })
    ?.then((registration) => {
      const pinia = createPinia();
      app = createApp(App);
      app.use(router);
      app.use(pinia);
      app.mount("#app");
    });
} else {
  console.log("Service workers are not supported.");
}
