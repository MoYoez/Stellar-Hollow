import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { PersonalScrollPage } from "@/components/PersonalScrollPage";

function RootLayout() {
  return (
    <>
      <PersonalScrollPage />
      <Outlet />
    </>
  );
}

const EmptySlot = () => null;

const rootRoute = createRootRoute({
  component: RootLayout,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: EmptySlot,
});

const devicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/devices",
  component: EmptySlot,
});

const skillsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/skills",
  component: EmptySlot,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  component: EmptySlot,
});

const playRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/play",
  component: EmptySlot,
});

const socialRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/social",
  component: EmptySlot,
});

const fallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});

const routeTree = rootRoute.addChildren([
  aboutRoute,
  devicesRoute,
  skillsRoute,
  projectsRoute,
  playRoute,
  socialRoute,
  fallbackRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
