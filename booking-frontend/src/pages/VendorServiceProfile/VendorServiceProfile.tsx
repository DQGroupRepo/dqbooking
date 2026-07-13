import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaUsers,
    FaStar,
    FaCheckCircle,
    FaCalendarAlt,
    FaEdit,
    FaImage
} from "react-icons/fa";

import Button from "../../components/common/ui/Button/Button";

import VendorServiceService from "../../services/VendorServiceService";

import type { VendorService } from "../../types/VendorService";

import "./VendorServiceProfile.css";

export default function VendorServiceProfile() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [service, setService] = useState<VendorService>();

    const [gallery,setGallery] = useState<string[]>([]);

    const [selectedImage, setSelectedImage] = useState("");

    const [amenities, setAmenities] = useState<string[]>([]);

    useEffect(() => {

        loadService();

    }, [id]);

    const loadService = async () => {

        if (!id) return;
        try {
            const response =
                await VendorServiceService.getServiceById(id);

            if (!response) return;

            setService(response);

            setAmenities(response.amenities ?? []);

            setGallery(response.imageUrls ?? []);

            if (response.imageUrls?.length) {
                setSelectedImage(response.imageUrls[0]);
            }

            else {

                 setSelectedImage("/images/no-image.png");

            }
        }
        catch (error) {

                console.error(error);

            }

    };

    if (!service) {

        return <h2>Loading...</h2>;

    }
return (

<section className="service-profile">

    <button
        className="back-button"
        onClick={() => navigate(-1)}
    >
        <FaArrowLeft />
        Back
    </button>

    <div className="hero-card">

        <img
             src={selectedImage || "/images/no-image.png"}
            alt={service.serviceName}
            className="hero-image"
        />

        <div className="hero-overlay">

            <span className="status-badge">

                {service.active ? "Active" : "Inactive"}

            </span>

            <h1>

                {service.serviceName}

            </h1>

            <p>

                {service.category}

                <span className="dot">•</span>

                <FaMapMarkerAlt />

                {" "}

               {service.location}

            </p>

            <div className="rating">

                <FaStar />

                {service.rating ?? 0}

                <span>

                    ({service.reviewCount ?? 0} Reviews)

                </span>

            </div>

        </div>

    </div>

    {/* STATS */}

    <div className="stats-grid">

        <div className="stat-card">

            <h4>

                Starting Price

            </h4>

            <h2>

                ₹{service.price.toLocaleString()}

            </h2>

        </div>

        <div className="stat-card">

            <h4>

                Capacity

            </h4>

            <h2>

                <FaUsers />

                {" "}

                {service.capacity}

            </h2>

        </div>

        <div className="stat-card">

            <h4>

                Reviews

            </h4>

            <h2>

                {service.reviewCount ?? 0}

            </h2>

        </div>

        <div className="stat-card">

            <h4>

                Upcoming

            </h4>

            <h2>

                {/* service.upcomingBookings.length */}


            </h2>

        </div>

    </div>




            <div className="content-grid">

                <div className="left-column">

                    <div className="card">

                        <h2>

                            Overview

                        </h2>

                        <p>

                            {service.description}

                        </p>

                    </div>

                    <div className="card">

                        <h2>

                            <FaImage />

                            Gallery

                        </h2>

                        <div className="gallery">

                            {

                                service.imageUrls?.map(image => (
                                    <img
                                        key={image}
                                        src={image}
                                        alt="Gallery"
                                        onClick={() => setSelectedImage(image)}
                                    />
                                ))

                            }

                        </div>

                    </div>
                                        <div className="card">

                                            <h2>

                                                Packages

                                            </h2>



                                        </div>

                                    </div>

                                    <div className="right-column">

                                        <div className="card">

                                            <h2>

                                                Amenities

                                            </h2>

                                            {

                                                amenities.length > 0 ? (

                                                    amenities.map(item => (

                                                        <div

                                                            key={item}

                                                            className="amenity"

                                                        >

                                                            <FaCheckCircle />

                                                            {item}

                                                        </div>

                                                    ))

                                                ) : (

                                                    <p>

                                                        No amenities available.

                                                    </p>

                                                )

                                            }

                                        </div>

                                        <div className="card">

                                            <h2>

                                                <FaCalendarAlt />

                                                {" "}

                                                Upcoming Bookings

                                            </h2>



                                        </div>

                                        <div className="service-actions">

                                            <Button
                                                onClick={() =>
                                                    navigate(`/vendor/services/edit/${service.id}`)
                                                }
                                            >
                                                <FaEdit />
                                                Edit Service
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    navigate(`/vendor/services/${service.id}/slots`)
                                                }
                                            >
                                                Manage Booking Slots
                                            </Button>

                                        </div>

                                    </div>

                                </div>







                    </section>

                    );

                    }