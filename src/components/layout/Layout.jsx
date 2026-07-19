// import Sidebar from "@/components/Sidebar/Sidebar";
import Sidebar from "../sidebar/Sidebar";
import styles from "./Layout.module.css";

export default function DashboardLayout({ children }) {
  return (

      <main className={styles.content}>
        {children}
      </main>

  );
}