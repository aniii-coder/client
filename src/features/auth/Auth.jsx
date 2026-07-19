import { useState } from "react";
import styles from "./Auth.module.css";
import { FORM_FIELDS } from "./utils";
import { GoogleLogin } from "@react-oauth/google";
import { useLoginViaGoogleMutation } from "./api/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { errorToast, successToast } from "@/services/slices/toastSlice";
import { useRouter } from "next/router";


function AuthPage() {
  const [loginViaGoogle] = useLoginViaGoogleMutation();
  const dispatch = useDispatch();
  // const router = useRouter();

  const handleLogin = async (credentialResponse) => {
    console.log('credentialResponse :>> ', credentialResponse);
    localStorage.setItem("tempId", credentialResponse?.credential)
    localStorage.setItem("client", credentialResponse?.clientId)
    try {
      const isLoginSuccess = await loginViaGoogle(credentialResponse);
      // console.log('isLoginSuccess :>> ', JSON.stringify(isLoginSuccess));
      if (isLoginSuccess?.data?.success) {
        dispatch(
          successToast({
            message: isLoginSuccess?.data?.message,
          }),
        );

        window.location.href = "/dashboard";
      } else {
        dispatch(
          errorToast({
            message: "Something went wrong",
          }),
        );
      }
    } catch (error) {
      dispatch(
        errorToast({
          message: error?.message || "Login failed",
        }),
      );
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <div className={styles.portalHeader}>
          <span className={styles.portalBrand}>
            Blogger
          </span>

          <span className={styles.portalBadge}>
            Client Portal
          </span>
        </div>

        <h1 className={styles.title}>
          Welcome Back
        </h1>

        <p className={styles.subtitle}>
          Please sign in to your account
        </p>


        <GoogleLogin
          onSuccess={(credentialResponse) => {
            handleLogin(credentialResponse);
          }}
          onError={() => {
            dispatch(
              errorToast({
                message: "Google login failed",
              })
            );
          }}
        />

      </div>
    </div>
  );
}


AuthPage.noLayout = true;


export default AuthPage;