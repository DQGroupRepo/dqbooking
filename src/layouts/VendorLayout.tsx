import { Outlet } from "react-router-dom";
import VendorSidebar from "../components/vendor/layout/Sidebar/VendorSidebar";
import VendorTopBar from "../components/vendor/layout/Topbar/VendorTopBar";

import "./VendorLayout.css";

export default function VendorLayout() {

    return (

        <div className="vendor-layout">

            <VendorSidebar />

            <div className="vendor-main">

                <VendorTopBar />

                <main className="vendor-content">
                    <Outlet />
                </main>

            </div>

        </div>

    );

}