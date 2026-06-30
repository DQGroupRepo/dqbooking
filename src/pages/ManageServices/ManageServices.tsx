import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaEye,
    FaEdit,
    FaTrash,
    FaMapMarkerAlt,
    FaUsers,
    FaStar
} from "react-icons/fa";

import VendorServiceService from "../../services/VendorServiceService";

import type { VendorService } from "../../types/VendorService";

import "./ManageServices.css";

const ManageServices = () => {

    const [services, setServices] = useState<VendorService[]>([]);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");

    const [categoryFilter, setCategoryFilter] = useState("All");

    useEffect(() => {

        loadServices();

    }, []);

    const loadServices = async () => {

        const data = await VendorServiceService.getServices();

        setServices(data);

    };

    const categories = useMemo(() => {

        return [
            "All",
            ...new Set(services.map(service => service.category))
        ];

    }, [services]);

    const filteredServices = services.filter(service => {

        const matchesSearch =
            service.name.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "All" ||
            service.status === statusFilter;

        const matchesCategory =
            categoryFilter === "All" ||
            service.category === categoryFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
        );

    });

    return (

        <section className="manage-services">

            <div className="services-container">

                <div className="services-header">

                    <div>

                        <h1>Manage Services</h1>

                        <p>
                            View and manage all your EventNest listings.
                        </p>

                    </div>

                    <Link to="/vendor/create-listing">

                        <button className="add-service-btn">

                            + Add New Service

                        </button>

                    </Link>

                </div>

                <div className="service-filters">

                    <input

                        type="text"

                        placeholder="Search services..."

                        value={search}

                        onChange={(e) =>
                            setSearch(e.target.value)
                        }

                    />

                    <select
                        value={categoryFilter}
                        onChange={(e) =>
                            setCategoryFilter(e.target.value)
                        }
                    >

                        {categories.map(category => (

                            <option
                                key={category}
                                value={category}
                            >
                                {category}
                            </option>

                        ))}

                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                    >

                        <option>All</option>
                        <option>Active</option>
                        <option>Inactive</option>

                    </select>

                </div>

                <div className="services-grid">

                    {filteredServices.map(service => (

                        <div
                            key={service.id}
                            className="service-list-card"
                        >

                            <img
                                src={service.image}
                                alt={service.name}
                            />

                            <div className="service-content">

                                <div className="service-top">

                                    <span
                                        className={
                                            service.status === "Active"
                                                ? "active-status"
                                                : "draft-status"
                                        }
                                    >
                                        {service.status}
                                    </span>

                                    <div className="rating">

                                        <FaStar />

                                        {service.rating}

                                        <small>

                                            ({service.reviewCount})

                                        </small>

                                    </div>

                                </div>

                                <h2>{service.name}</h2>

                                <p>

                                    {service.category}

                                </p>

                                <p>

                                    <FaMapMarkerAlt />

                                    {" "}

                                    {service.city}

                                </p>

                                <p>

                                    <FaUsers />

                                    {" "}

                                    {service.capacity > 0
                                        ? `${service.capacity} Guests`
                                        : "Package Service"}

                                </p>

                                <p>

                                    Starting from

                                    <strong>

                                        {" "}₹{service.price.toLocaleString()}

                                    </strong>

                                </p>

                                <div className="service-actions">

                                    <Link to={`/vendor/services/${service.id}`}>

                                        <button className="view-btn">

                                            <FaEye />

                                            View

                                        </button>

                                    </Link>

                                    <button className="edit-btn">

                                        <FaEdit />

                                        Edit

                                    </button>

                                    <button className="delete-btn">

                                        <FaTrash />

                                        Delete

                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </section>

    );

};

export default ManageServices;