import styles from "./DashboardCard.module.css";
import type { IconType } from "react-icons";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: IconType;
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
}: DashboardCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconContainer}>
        <Icon className={styles.icon} />
      </div>

      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <h2 className={styles.value}>{value}</h2>
      </div>
    </div>
  );
}