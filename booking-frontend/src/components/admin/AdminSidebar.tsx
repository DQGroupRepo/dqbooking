import { NavLink } from "react-router-dom";

import "./AdminSidebar.css";

const AdminSidebar = () => {

    return (

        <aside className="admin-sidebar">

            <div className="admin-sidebar-header">

                <h2>EventNest</h2>

                <span>Admin Panel</span>

            </div>


            <nav className="admin-navigation">

                <NavLink
                    to="/"
                    className="admin-nav-link"
                >
                    <span>⌂</span>
                    Home
                </NavLink>

                <NavLink
                    to="/admin/dashboard"
                    end
                    className={({ isActive }) =>
                        isActive
                            ? "admin-nav-link active"
                            : "admin-nav-link"
                    }
                >
                    <span>▣</span>
                    Dashboard
                </NavLink>


                <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                        isActive
                            ? "admin-nav-link active"
                            : "admin-nav-link"
                    }
                >
                    <span>◉</span>
                    Users
                </NavLink>

                <NavLink
                    to="/admin/bookings"
                    className={({ isActive }) =>
                        isActive
                            ? "admin-nav-link active"
                            : "admin-nav-link"
                    }
                >
                    <span>▤</span>
                    Bookings
                </NavLink>


                <NavLink
                    to="/admin/reviews"
                    className={({ isActive }) =>
                        isActive
                            ? "admin-nav-link active"
                            : "admin-nav-link"
                    }
                >
                    <span>★</span>
                    Reviews
                </NavLink>

                <NavLink
                    to="/admin/vendors"
                    className={({ isActive }) =>
                        isActive
                            ? "admin-nav-link active"
                            : "admin-nav-link"
                    }
                >
                    <span>◆</span>
                    Vendor Verification
                </NavLink>

            </nav>


            <div className="admin-sidebar-footer">

                <div className="admin-user">

                    <div className="admin-avatar">
                        A
                    </div>

                    <div>

                        <strong>
                            Administrator
                        </strong>

                        <span>
                            Admin
                        </span>

                    </div>

                </div>

            </div>

        </aside>

    );

};

export default AdminSidebar;