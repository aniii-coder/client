import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Provider } from "react-redux";
import { store } from "../../store";
import DashboardLayout from "@/components/layout/Layout";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const cookie = Cookies.get("user");

    if (cookie) {
      setUser(JSON.parse(cookie));
    }

    setMounted(true);
  }, []);

  if (!mounted) return null; 

  const showLayout = !!user && !Component.noLayout;

  return (
    <Provider store={store}>
      <GoogleOAuthProvider
        clientId={process.env.GOOGLE_CLIENT_ID}
      >
        {showLayout ? (
          <DashboardLayout>
            <Component {...pageProps} />
          </DashboardLayout>
        ) : (
          <Component {...pageProps} />
        )}
      </GoogleOAuthProvider>
    </Provider>
  );
}