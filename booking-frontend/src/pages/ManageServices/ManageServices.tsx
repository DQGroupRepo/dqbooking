import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    FaEye,
    FaEdit,
    FaTrash,
    FaMapMarkerAlt,
    FaUsers,
    FaStar
} from "react-icons/fa";

import VendorServiceService from "../../services/VendorServiceService";
import Button from "../../components/common/ui/Button/Button";

import type { VendorService } from "../../types/VendorService";
import ConfirmationModal from "../../components/common/ui/ConfirmationModal/ConfirmationModal";

import toast from "react-hot-toast";

import "./ManageServices.css";

const ManageServices = () => {

    const [services, setServices] =
        useState<VendorService[]>([]);

    const [search, setSearch] =
        useState("");

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [selectedServiceId, setSelectedServiceId] =
        useState<string | null>(null);

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [categoryFilter, setCategoryFilter] =
        useState("All");

    const navigate = useNavigate();


    useEffect(() => {

        loadServices();

    }, []);


    const loadServices = async () => {

        try {

            const data =
                await VendorServiceService.getServices();

            setServices(data);

        } catch (error) {

            console.error(error);

            toast.error(
                "Unable to load services."
            );

        }

    };


    const categories = useMemo(() => {

        return [
            "All",
            ...new Set(
                services.map(
                    service => service.category
                )
            )
        ];

    }, [services]);


    const handleDelete = (id: string) => {

        setSelectedServiceId(id);

        setShowDeleteModal(true);

    };


    const confirmDelete = async () => {

        if (selectedServiceId === null)
            return;

        try {

            await VendorServiceService.deleteService(
                selectedServiceId
            );

            await loadServices();

            toast.success(
                "Service deleted successfully."
            );

            setShowDeleteModal(false);

            setSelectedServiceId(null);

        } catch (error) {

            console.error(error);

            toast.error(
                "Unable to delete service."
            );

        }

    };


    const filteredServices =
        services.filter(service => {

            const matchesSearch =
                service.serviceName
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );

            const matchesStatus =
                statusFilter === "All" ||
                (
                    statusFilter === "Active" &&
                    service.active
                ) ||
                (
                    statusFilter === "Inactive" &&
                    !service.active
                );

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

                        <h1>
                            Services
                        </h1>

                        <p>
                            Create, edit and manage
                            every service offered
                            by your business.
                        </p>

                    </div>


                    <Link
                        to="/vendor/create-listing"
                    >

                        <button
                            className="add-service-btn"
                        >
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
                            setCategoryFilter(
                                e.target.value
                            )
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
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >

                        <option>
                            All
                        </option>

                        <option>
                            Active
                        </option>

                        <option>
                            Inactive
                        </option>

                    </select>

                </div>


                <div className="services-grid">

                    {filteredServices.map(
                        service => {

                            const firstMedia =
                                service.imageUrls?.[0];

                            const isVideo =
                                firstMedia?.match(
                                    /\.(mp4|webm|ogg|mov)$/i
                                );


                            return (

                                <div
                                    key={service.id}
                                    className="service-list-card"
                                >

                                    {/* Service Media */}

                                    <div className="service-media">

                                        {firstMedia ? (

                                            isVideo ? (

                                                <video
                                                    className="service-media-content"
                                                    src={firstMedia}
                                                    muted
                                                    autoPlay
                                                    loop
                                                    playsInline
                                                />

                                            ) : (

                                                <img
                                                    className="service-media-content"
                                                    src={firstMedia}
                                                    alt={
                                                        service.serviceName
                                                    }
                                                />

                                            )

                                        ) : (

                                            <img
                                                className="service-media-content"
                                                src="/images/no-image.png"
                                                alt="No service media"
                                            />

                                        )}

                                    </div>


                                    {/* Service Details */}

                                    <div className="service-content">

                                        <div className="service-top">

                                            <span
                                                className={
                                                    service.active
                                                        ? "active-status"
                                                        : "draft-status"
                                                }
                                            >

                                                {
                                                    service.active
                                                        ? "Active"
                                                        : "Inactive"
                                                }

                                            </span>


                                            <div className="rating">

                                                <FaStar />

                                                {service.rating}

                                                <small>

                                                    (
                                                    {
                                                        service.reviewCount
                                                    }
                                                    )

                                                </small>

                                            </div>

                                        </div>


                                        <h2>
                                            {
                                                service.serviceName
                                            }
                                        </h2>


                                        <p>
                                            {
                                                service.category
                                            }
                                        </p>


                                        <p>

                                            <FaMapMarkerAlt />

                                            {" "}

                                            {
                                                service.contactInfo
                                                    ?.contactPerson
                                            }

                                        </p>


                                        <p>

                                            <FaUsers />

                                            {" "}

                                            {
                                                service.capacity > 0
                                                    ? `${service.capacity} Guests`
                                                    : "Package Service"
                                            }

                                        </p>


                                        <p>

                                            Starting from

                                            <strong>

                                                {" "}₹
                                                {
                                                    service.price
                                                        .toLocaleString()
                                                }

                                            </strong>

                                        </p>


                                        <div
                                            className="service-actions"
                                        >

                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    navigate(
                                                        `/vendor/services/${service.id}`
                                                    )
                                                }
                                            >

                                                <FaEye />

                                                Open Workspace

                                            </Button>


                                            <Button
                                                onClick={() =>
                                                    navigate(
                                                        `/vendor/services/edit/${service.id}`
                                                    )
                                                }
                                            >

                                                <FaEdit />

                                                Edit

                                            </Button>


                                            <Button
                                                variant="danger"
                                                onClick={() =>
                                                    handleDelete(
                                                        service.id
                                                    )
                                                }
                                            >

                                                <FaTrash />

                                                Delete

                                            </Button>

                                        </div>

                                    </div>

                                </div>

                            );

                        }
                    )}

                </div>

            </div>


            <ConfirmationModal

                isOpen={
                    showDeleteModal
                }

                title="Delete Service"

                message={
                    "Are you sure you want to delete this service? " +
                    "This action cannot be undone."
                }

                confirmText="Delete"

                cancelText="Cancel"

                onConfirm={
                    confirmDelete
                }

                onCancel={() => {

                    setShowDeleteModal(
                        false
                    );

                    setSelectedServiceId(
                        null
                    );

                }}

            />

        </section>

    );

};


export default ManageServices;