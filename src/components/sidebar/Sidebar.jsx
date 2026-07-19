"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import sidebarItems from "./utils";
// import sidebarItems from "./sidebarConfig";

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/auth";
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        Admin
      </div>

      <nav className={styles.nav}>
        {sidebarItems?.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.link} ${
              pathname === item.href ? styles.active : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className={styles.logout}
      >
        Logout
      </button>
    </aside>
  );
}