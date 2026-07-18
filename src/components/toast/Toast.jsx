import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { closeToast } from "@/redux/slices/toastSlice";
import styles from "./Toast.module.css";
import { closeToast } from "@/services/slices/toastSlice";

export default function Toast() {
  const dispatch = useDispatch();

  const { open, type, message } = useSelector(
    (state) => state.toast
  );

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      dispatch(closeToast());
    }, 3000);

    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      {message}
    </div>
  );
}