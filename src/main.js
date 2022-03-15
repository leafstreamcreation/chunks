import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

let app;

if ("serviceWorker" in navigator) {
  // Register a service worker hosted at the root of the
  // site using the default scope.
  navigator.serviceWorker.register("/sw.js").then( function (registration) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data.ready) {
          app = createApp(App);
          app.use(router);
          app.mount("#app");
        }
      });
    },
    /*catch*/ function (error) {
      console.log("Service worker registration failed:", error);
    }
  );
} else {
  console.log("Service workers are not supported.");
}


