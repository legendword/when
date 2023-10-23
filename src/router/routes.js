const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", name: "Schedule", component: () => import("pages/List.vue") },
      {
        path: "calendar",
        name: "Calendar",
        component: () => import("pages/Calendar.vue"),
      },
      {
        path: "deadlines",
        name: "Deadlines",
        component: () => import("pages/Deadlines.vue"),
      },
      {
        path: "support",
        name: "Support",
        component: () => import("pages/Support.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
