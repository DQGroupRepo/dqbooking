import styles from "./SectionHeader.module.css";

interface Props {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({
  title,
  subtitle,
}: Props) {
  return (
    <div className={styles.header}>
      <h2>{title}</h2>

      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}