import { useNavigate } from "react-router-dom";

import DashboardPanel from "../DashboardPanel/DashboardPanel";

import styles from "./QuickActions.module.css";
import {
   FaConciergeBell
} from "react-icons/fa";

export default function QuickActions() {

    const navigate = useNavigate();

    return (

        <DashboardPanel title="Quick Actions">

            <div className={styles.actions}>

                <button
                    onClick={() => navigate("/vendor/create-listing")}
                >
                    Create Listing
                </button>

                <button
                    onClick={() => navigate("/vendor/manage-services")}
                >

                    <FaConciergeBell />

                    Services

                </button>

                <button
                    onClick={() => navigate("/vendor/bookings")}
                >
                    View Bookings
                </button>

            </div>

        </DashboardPanel>

    );

}