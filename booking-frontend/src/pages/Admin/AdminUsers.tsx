import { useEffect, useState } from "react";

import AdminUserService from "../../services/AdminUserService";

import type { AdminUser } from "../../types/AdminUser";

import "./AdminUsers.css";

const AdminUsers = () => {

    const [users, setUsers] =
        useState<AdminUser[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [roleFilter, setRoleFilter] =
        useState("ALL");


    useEffect(() => {

        loadUsers();

    }, []);


    async function loadUsers() {

        try {

            setLoading(true);
            setError("");

            const data =
                await AdminUserService.getUsers();

            setUsers(data);

        } catch (error) {

            console.error(
                "Failed to load admin users:",
                error
            );

            setError(
                "Unable to load users."
            );

        } finally {

            setLoading(false);

        }

    }


    const filteredUsers =
        users.filter((user) => {

            const fullName =
                `${user.firstName} ${user.lastName}`
                    .toLowerCase();

            const searchText =
                search.toLowerCase();

            const matchesSearch =
                fullName.includes(searchText) ||
                user.email
                    .toLowerCase()
                    .includes(searchText) ||
                user.phone
                    .toLowerCase()
                    .includes(searchText);

            const matchesRole =
                roleFilter === "ALL" ||
                user.role === roleFilter;

            return (
                matchesSearch &&
                matchesRole
            );

        });


    function getFullName(user: AdminUser) {

        const name =
            `${user.firstName || ""} ${user.lastName || ""}`
                .trim();

        return name || "Unnamed User";

    }


    function formatDate(
        value?: string
    ) {

        if (!value) {
            return "Never";
        }

        return new Date(value)
            .toLocaleDateString();
    }


    if (loading) {

        return (
            <section className="admin-users">

                <div className="admin-users-loading">

                    Loading users...

                </div>

            </section>
        );

    }


    if (error) {

        return (
            <section className="admin-users">

                <div className="admin-users-error">

                    {error}

                </div>

            </section>
        );

    }


    return (

        <section className="admin-users">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="admin-users-header">

                <div>

                    <h1>
                        Users
                    </h1>

                    <p>
                        Manage customers, vendors and administrators.
                    </p>

                </div>

            </div>


            {/* =========================================
                FILTERS
            ========================================= */}

            <div className="admin-users-toolbar">

                <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />


                <select
                    value={roleFilter}
                    onChange={(e) =>
                        setRoleFilter(e.target.value)
                    }
                >

                    <option value="ALL">
                        All Roles
                    </option>

                    <option value="CUSTOMER">
                        Customers
                    </option>

                    <option value="VENDOR_ADMIN">
                        Vendor Admins
                    </option>

                    <option value="VENDOR_USER">
                        Vendor Users
                    </option>

                    <option value="ADMIN">
                        Admins
                    </option>

                </select>

            </div>


            {/* =========================================
                USER COUNT
            ========================================= */}

            <div className="admin-users-count">

                Showing{" "}
                <strong>
                    {filteredUsers.length}
                </strong>{" "}
                of{" "}
                <strong>
                    {users.length}
                </strong>{" "}
                users

            </div>


            {/* =========================================
                USERS TABLE
            ========================================= */}

            <div className="admin-users-card">

                {filteredUsers.length === 0 ? (

                    <div className="admin-users-empty">

                        <div>
                            👥
                        </div>

                        <h3>
                            No users found
                        </h3>

                        <p>
                            No users match your current search or filter.
                        </p>

                    </div>

                ) : (

                    <div className="admin-users-table-wrapper">

                        <table className="admin-users-table">

                            <thead>

                                <tr>

                                    <th>
                                        User
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Phone
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Joined
                                    </th>

                                    <th>
                                        Last Login
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredUsers.map(
                                    (user) => (

                                        <tr
                                            key={user.id}
                                        >

                                            <td>

                                                <div className="admin-user-cell">

                                                    <div className="admin-user-avatar">

                                                        {getFullName(user)
                                                            .charAt(0)
                                                            .toUpperCase()}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {getFullName(user)}
                                                        </strong>

                                                        <span>
                                                            {user.id}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>
                                                {user.email}
                                            </td>


                                            <td>
                                                {user.phone || "—"}
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        `admin-role-badge ${user.role.toLowerCase()}`
                                                    }
                                                >
                                                    {user.role}
                                                </span>

                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        `admin-status-badge ${
                                                            user.status.toLowerCase()
                                                        }`
                                                    }
                                                >
                                                    {user.status}
                                                </span>

                                            </td>


                                            <td>
                                                {formatDate(
                                                    user.createdAt
                                                )}
                                            </td>


                                            <td>
                                                {formatDate(
                                                    user.lastLogin
                                                )}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </section>

    );

};

export default AdminUsers;