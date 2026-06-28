import {
  FaCalendarCheck,
  FaChartLine,
  FaPlusCircle
} from "react-icons/fa";

import styles from "./DashboardHero.module.css";

interface DashboardHeroProps {
  vendorName: string;
}

export default function DashboardHero({
  vendorName,
}: DashboardHeroProps) {

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (

    <section className={styles.hero}>

      <div className={styles.left}>

        <span className={styles.date}>
          {today}
        </span>

        <h1>
          Welcome back,
          <br />
          {vendorName}
        </h1>

        <p>
          Here's what's happening with your business today.
        </p>

        <div className={styles.actions}>

          <button>

            <FaPlusCircle />

            Create Listing

          </button>

          <button className={styles.secondary}>

            <FaCalendarCheck />

            View Bookings

          </button>

        </div>

      </div>

      <div className={styles.right}>

        <div className={styles.statCard}>

          <span>Today's Revenue</span>

          <h2>₹28,500</h2>

          <small>
            +12.8%
          </small>

        </div>

        <div className={styles.statCard}>

          <span>This Month</span>

          <h2>₹4.8 L</h2>

          <small>

            <FaChartLine />

            Growing

          </small>

        </div>

      </div>

    </section>

  );

}