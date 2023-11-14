import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import { routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";

import Header from "~/components/template/header/header";
import Footer from "~/components/template/footer/footer";

import styles from "./styles.css?inline";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export const useIsConncted = routeLoader$(({ cookie }) => {
  const user = cookie.get('user')?.json();
  return {
    isConnected: !!user,
  };
});

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export const useLogoutAction = routeAction$((_, { redirect, cookie }) => {
  cookie.delete('user');
  redirect(301, '/');
});

export default component$(() => {
  useStyles$(styles);
  const isConnected = useIsConncted();
  const logoutAction = useLogoutAction();

  return (
    <>
      <Header
        isConnected={isConnected.value.isConnected}
        handleLogout={logoutAction}
      />
      <main>
        <Slot />
      </main>
      <Footer />
    </>
  );
});
