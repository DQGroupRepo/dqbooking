import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom";

import "./VendorServiceWorkspace.css";

export default function VendorServiceWorkspace() {

    const { id } = useParams();

    const navigate = useNavigate();

    return (

        <section className="service-workspace">

            <div className="workspace-header">

                <div>

                    <h1>

                        Service Workspace

                    </h1>

                    <p>

                        Manage every aspect of this service.

                    </p>

                </div>
                <button
                        className="workspace-back-btn"
                        onClick={() => navigate("/vendor/manage-services")}
                    >

                        ← Back to Services

                    </button>

            </div>

            <nav className="workspace-tabs">

                <NavLink
                    to={`/vendor/services/${id}`}
                    end
                >
                    Overview
                </NavLink>

                <NavLink
                    to={`/vendor/services/${id}/slots`}
                >
                    Booking Slots
                </NavLink>

                <NavLink
                    to={`/vendor/services/${id}/availability`}
                >
                    Availability
                </NavLink>

                <NavLink
                    to={`/vendor/services/${id}/bookings`}
                >
                    Bookings
                </NavLink>

                <NavLink
                    to={`/vendor/services/${id}/reviews`}
                >
                    Reviews
                </NavLink>

                <NavLink
                    to={`/vendor/services/${id}/settings`}
                >
                    Settings
                </NavLink>

            </nav>

            <div className="workspace-content">

                <Outlet />

            </div>

        </section>

    );

}