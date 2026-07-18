import { useState } from "react";
import styles from "./Auth.module.css";
import { FORM_FIELDS } from "./utils";
import { GoogleLogin } from "@react-oauth/google";
import { useLoginViaGoogleMutation } from "./api/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { errorToast, successToast } from "@/services/slices/toastSlice";
import { useRouter } from "next/router";


export default function AuthPage() {
  // const [isLogin, setIsLogin] = useState(true);
  // const [formData, setFormData] = useState({
  //   name: "",
  //   email: "",
  //   password: "",
  // });


  const [loginViaGoogle] = useLoginViaGoogleMutation()
  const dispatch = useDispatch();
  const router = useRouter()
  // const toggleMode = () => { 
  //   setIsLogin((prev) => !prev);
  //   setFormData({ name: "", email: "", password: "" });
  // };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log(isLogin ? "Logging in:" : "Signing up:", formData);
  // };

  // const activeFields = FORM_FIELDS.filter((field) => {
  //   if (isLogin) {
  //     return field.showInLogin; 
  //   }
  //   return true; 
  // });



  const handleLogin  = async(credentialResponse) => {
    try {
      console.log('"hittttt" :>> ', "hittttt", );
        const isLoginSuccess = await loginViaGoogle(credentialResponse);
        console.log('isLoginSucess :>> ', isLoginSuccess);
        if(isLoginSuccess?.data?.success){
          dispatch(successToast({message: isLoginSuccess?.data?.message}))
          router.push('/dashboard')
        }else{
          dispatch(errorToast({message: "Something went wrong"}))
        }
    } catch (error) {
        dispatch(errorToast({message: error?.error}))
    }
  }

  return (
   <div className={styles.container}>
    <div className={styles.card}>
      <div className={styles.portalHeader}>
        <span className={styles.portalBrand}>Blogger</span>
        <span className={styles.portalBadge}>Client Portal</span>
      </div>

      <h1 className={styles.title}>{"Welcome Back" }</h1>
      <p className={styles.subtitle}>
        {"Please sign in to your account" }
      </p>

      
<GoogleLogin
  onSuccess={(credentialResponse) => {
    console.log(credentialResponse);
    handleLogin(credentialResponse)
  }}
  onError={() => {
    console.log("Login Failed");
  }}
/>

        {/* <p className={styles.toggleText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" className={styles.toggleBtn} onClick={toggleMode}>
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p> */}
      </div>
    </div>
  );
}