import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom";
import "./VendorServiceWorkspace.css";

export default function VendorServiceWorkspace() {
    const { serviceId } = useParams();
    const navigate = useNavigate();

    return (
        <section className="service-workspace">
            <div className="workspace-header">
                <div>
                    <h1>Service Workspace</h1>
                    <p>Manage every aspect of this service.</p>
                </div>
                <button type="button" className="workspace-back-btn" onClick={() => navigate("/vendor/manage-services")}>
                    ← Back to Services
                </button>
            </div>
            <nav className="workspace-tabs">
                <NavLink to={`/vendor/services/${serviceId}`} end>Overview</NavLink>
                <NavLink to={`/vendor/services/${serviceId}/pricing`}>Pricing</NavLink>
                <NavLink to={`/vendor/services/${serviceId}/slots`}>Booking Slots</NavLink>
                <NavLink to={`/vendor/services/${serviceId}/availability`}>Availability</NavLink>
                <NavLink to={`/vendor/services/${serviceId}/bookings`}>Bookings</NavLink>
                <NavLink to={`/vendor/services/${serviceId}/reviews`}>Reviews</NavLink>
                <NavLink to={`/vendor/services/${serviceId}/settings`}>Settings</NavLink>
            </nav>
            <div className="workspace-content"><Outlet /></div>
        </section>
    );
}
