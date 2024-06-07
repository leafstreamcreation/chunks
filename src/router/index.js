import { createRouter, createWebHistory } from "vue-router";
// import Do from "../views/Do.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: "/do",
    //   name: "do",
    //   component: Do,
    // },
    // {
    //   path: "/eat",
    //   name: "eat",
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import("../views/Eat.vue"),
    // },
  ],
});

export default router;
