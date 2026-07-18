import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "../../store";
import { Provider } from "react-redux";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
        <Component {...pageProps} />
      </GoogleOAuthProvider>
    </Provider>
  );
}