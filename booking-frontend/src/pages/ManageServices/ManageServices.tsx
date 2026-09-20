import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    FaEye,
    FaEdit,
    FaMapMarkerAlt,
    FaUsers,
    FaStar,
    FaToggleOn,
    FaToggleOff,
    FaClock,
    FaCheckCircle,
    FaTimesCircle
} from "react-icons/fa";
import axios from "axios";

import VendorServiceService
    from "../../services/VendorServiceService";

import Button
    from "../../components/common/ui/Button/Button";

import type {
    VendorService
} from "../../types/VendorService";

import ConfirmationModal
    from "../../components/common/ui/ConfirmationModal/ConfirmationModal";

import toast from "react-hot-toast";

import "./ManageServices.css";


const ManageServices = () => {


    const [services, setServices] =
        useState<VendorService[]>([]);


    const [search, setSearch] =
        useState("");


    const [statusFilter, setStatusFilter] =
        useState("All");


    const [categoryFilter, setCategoryFilter] =
        useState("All");


    const [
        showStatusModal,
        setShowStatusModal
    ] = useState(false);


    const [
        selectedService,
        setSelectedService
    ] = useState<VendorService | null>(
        null
    );


    const [
        updatingStatus,
        setUpdatingStatus
    ] = useState(false);


    const navigate = useNavigate();


    /*
     * =========================================
     * LOAD SERVICES
     * =========================================
     */

    useEffect(() => {

        loadServices();

    }, []);


    const loadServices = async () => {

        try {

            const data =
                await VendorServiceService
                    .getServices();

            setServices(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(error);

            if (
                axios.isAxiosError(error) &&
                error.response?.status === 403
            ) {

                toast.error("You do not have permission to load this service."
                );

                return;

            }

            toast.error(
                "Unable to load services."
            );

        }

    };


    /*
     * =========================================
     * CATEGORIES
     * =========================================
     */

    const categories = useMemo(() => {

        return [

            "All",

            ...new Set(

                services
                    .map(
                        service =>
                            service.category
                    )
                    .filter(Boolean)

            )

        ];

    }, [services]);


    /*
     * =========================================
     * OPEN STATUS MODAL
     * =========================================
     */

    const handleStatusChange = (
        service: VendorService
    ) => {

        setSelectedService(
            service
        );

        setShowStatusModal(
            true
        );

    };


    /*
     * =========================================
     * CONFIRM STATUS CHANGE
     * =========================================
     */

    const confirmStatusChange =
        async () => {


            if (!selectedService) {

                return;

            }


            const newActiveStatus =
                !selectedService.active;


            try {

                setUpdatingStatus(
                    true
                );


                /*
                 * API RETURNS THE UPDATED SERVICE
                 */

                const updatedService =
                    await VendorServiceService
                        .changeStatus(

                            selectedService.id,

                            newActiveStatus

                        );


                /*
                 * UPDATE UI IMMEDIATELY
                 */

                setServices(
                    currentServices =>

                        currentServices.map(
                            service =>

                                service.id ===
                                updatedService.id

                                    ? {
                                        ...service,
                                        ...updatedService
                                    }

                                    : service
                        )
                );


                /*
                 * SUCCESS MESSAGE
                 */

                if (newActiveStatus) {

                    toast.success(
                        "Service activated. It is now pending admin approval."
                    );

                } else {

                    toast.success(
                        "Service made inactive."
                    );

                }


                setShowStatusModal(
                    false
                );


                setSelectedService(
                    null
                );


            } catch (error) {

                console.error(error);

                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 403
                ) {

                    toast.error("You do not have permission to update service status."
                    );

                    return;

                }


                toast.error(
                    "Unable to update service status."
                );


            } finally {

                setUpdatingStatus(
                    false
                );

            }

        };


    /*
     * =========================================
     * FILTER SERVICES
     * =========================================
     */

    const filteredServices =
        services.filter(
            service => {


                const matchesSearch =

                    service.serviceName
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        );


                const matchesStatus =

                    statusFilter === "All"

                    ||

                    (
                        statusFilter === "Active"
                        &&
                        service.active === true
                    )

                    ||

                    (
                        statusFilter === "Inactive"
                        &&
                        service.active === false
                    );


                const matchesCategory =

                    categoryFilter === "All"

                    ||

                    service.category ===
                    categoryFilter;


                return (

                    matchesSearch

                    &&

                    matchesStatus

                    &&

                    matchesCategory

                );

            }
        );


    /*
     * =========================================
     * MODERATION BADGE
     * =========================================
     */

    const renderModerationStatus = (
        moderationStatus?: string
    ) => {


        switch (
            moderationStatus
        ) {


            case "PENDING":

                return (

                    <span
                        className="
                            moderation-status
                            pending-approval-status
                        "
                    >

                        <FaClock />

                        Pending Approval

                    </span>

                );


            case "APPROVED":

                return (

                    <span
                        className="
                            moderation-status
                            approved-status
                        "
                    >

                        <FaCheckCircle />

                        Approved

                    </span>

                );


            case "REJECTED":

                return (

                    <span
                        className="
                            moderation-status
                            rejected-status
                        "
                    >

                        <FaTimesCircle />

                        Rejected

                    </span>

                );


            default:

                return null;

        }

    };


    return (


        <section className="manage-services">


            <div className="services-container">


                {/* HEADER */}

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


                {/* FILTERS */}

                <div className="service-filters">


                    <input
                        type="text"
                        placeholder="Search services..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
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

                        {categories.map(
                            category => (

                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>

                            )
                        )}

                    </select>


                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="All">
                            All
                        </option>

                        <option value="Active">
                            Active
                        </option>

                        <option value="Inactive">
                            Inactive
                        </option>

                    </select>


                </div>


                {/* SERVICES */}

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


                                    {/* MEDIA */}

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


                                    {/* CONTENT */}

                                    <div className="service-content">


                                        <div className="service-top">


                                            {/* STATUS BADGES */}

                                            <div className="service-status-group">


                                                <span
                                                    className={
                                                        service.active
                                                            ? "active-status"
                                                            : "draft-status"
                                                    }
                                                >

                                                    {service.active
                                                        ? "Active"
                                                        : "Inactive"}

                                                </span>


                                                {renderModerationStatus(
                                                    service.moderationStatus
                                                )}


                                            </div>


                                            {/* RATING */}

                                            <div className="rating">


                                                <FaStar />


                                                {service.rating ?? 0}


                                                <small>

                                                    (
                                                    {service.reviewCount ?? 0}
                                                    )

                                                </small>


                                            </div>


                                        </div>


                                        <h2>
                                            {service.serviceName}
                                        </h2>


                                        <p>
                                            {service.category}
                                        </p>


                                        <p>

                                            <FaMapMarkerAlt />

                                            {" "}

                                            {service.location ??
                                                "Location not available"}

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

                                                {" "}₹

                                                {(service.price ?? 0)
                                                    .toLocaleString(
                                                        "en-IN"
                                                    )}

                                            </strong>

                                        </p>


                                        {/* ACTIONS */}

                                        <div className="service-actions">


                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/vendor/services/${service.id}/pricing`
                                                    )
                                                }
                                            >

                                                Pricing

                                            </button>


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


                                            {/* ACTIVE / INACTIVE */}

                                            <Button
                                                variant={
                                                    service.active
                                                        ? "danger"
                                                        : "secondary"
                                                }
                                                onClick={() =>
                                                    handleStatusChange(
                                                        service
                                                    )
                                                }
                                            >

                                                {service.active ? (

                                                    <>

                                                        <FaToggleOff />

                                                        Make Inactive

                                                    </>

                                                ) : (

                                                    <>

                                                        <FaToggleOn />

                                                        Make Active

                                                    </>

                                                )}

                                            </Button>


                                        </div>


                                    </div>


                                </div>


                            );

                        }
                    )}


                    {filteredServices.length === 0 && (

                        <div className="no-services">

                            <h3>
                                No services found
                            </h3>

                            <p>
                                Try changing your filters
                                or create a new service.
                            </p>

                        </div>

                    )}


                </div>


            </div>


            {/* CONFIRMATION MODAL */}

            <ConfirmationModal

                isOpen={showStatusModal}

                title={
                    selectedService?.active
                        ? "Make Service Inactive"
                        : "Make Service Active"
                }

                message={
                    selectedService?.active
                        ? "Are you sure you want to make this service inactive? Customers will no longer be able to book this service."
                        : "Are you sure you want to make this service active? It will be pending admin approval and will not be visible to customers until approved."
                }

                confirmText={
                    selectedService?.active
                        ? "Make Inactive"
                        : "Make Active"
                }

                cancelText="Cancel"

                onConfirm={
                    confirmStatusChange
                }

                onCancel={() => {

                    if (updatingStatus) {
                        return;
                    }

                    setShowStatusModal(
                        false
                    );

                    setSelectedService(
                        null
                    );

                }}

            />


        </section>


    );

};


export default ManageServices;