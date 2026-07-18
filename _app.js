// src/pages/_app.js

import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "../store";
import Toast from "@/common-components/toast/Toast";
import RootLayout from "@/common-components/root-layout/RootLayout";
export default function App({ Component, pageProps, router }) {
  const isAdminRoute = router.pathname.startsWith("/admin");

  return (
    <Provider store={store}>
      <Toast />

      {isAdminRoute ? (
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
      ) : (
        <Component {...pageProps} />
      )}
    </Provider>
  );
}