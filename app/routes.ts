import { index, layout, type RouteConfig } from "@react-router/dev/routes"

export default [
  layout("pages/AppLayout.tsx", [
    index("pages/HomePage.tsx")
  ])
] satisfies RouteConfig
