import styles from "./DashboardPanel.module.css";

interface DashboardPanelProps {
  title: string;
  children: React.ReactNode;
}

export default function DashboardPanel({
  title,
  children,
}: DashboardPanelProps) {
  return (
    <div className={styles.panel}>
      <h3>{title}</h3>

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}