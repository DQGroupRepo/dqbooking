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

import VendorServiceService from "../../services/VendorServiceService";
import type { VendorService } from "../../types/VendorService";

import "./VendorServiceProfile.css";

export default function VendorServiceProfile() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [service, setService] = useState<VendorService>();

    const [selectedImage, setSelectedImage] = useState("");

    useEffect(() => {

        loadService();

    }, [id]);

    const loadService = async () => {

        const response =
            await VendorServiceService.getServiceById(Number(id));

        if (response) {

            setService(response);

            if (response.gallery.length > 0)
                setSelectedImage(response.gallery[0]);
            else
                setSelectedImage(response.image);

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
                    src={selectedImage}
                    alt={service.name}
                    className="hero-image"
                />

                <div className="hero-overlay">

                    <span className="status-badge">

                        {service.status}

                    </span>

                    <h1>{service.name}</h1>

                    <p>

                        {service.category}

                        <span className="dot">

                            •

                        </span>

                        <FaMapMarkerAlt />

                        {" "}

                        {service.city}

                    </p>

                    <div className="rating">

                        <FaStar />

                        {service.rating}

                        <span>

                            ({service.reviewCount} Reviews)

                        </span>

                    </div>

                </div>

            </div>

            <div className="stats-grid">

                <div className="stat-card">

                    <h4>Starting Price</h4>

                    <h2>

                        ₹{service.price.toLocaleString()}

                    </h2>

                </div>

                <div className="stat-card">

                    <h4>Capacity</h4>

                    <h2>

                        <FaUsers />

                        {" "}

                        {service.capacity}

                    </h2>

                </div>

                <div className="stat-card">

                    <h4>Reviews</h4>

                    <h2>

                        {service.reviewCount}

                    </h2>

                </div>

                <div className="stat-card">

                    <h4>Upcoming</h4>

                    <h2>

                        {service.upcomingBookings.length}

                    </h2>

                </div>

            </div>

            <div className="content-grid">

                <div className="left-column">

                    <div className="card">

                        <h2>Overview</h2>

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

                            {service.gallery.map(image => (

                                <img

                                    key={image}

                                    src={image}

                                    onClick={() =>
                                        setSelectedImage(image)
                                    }

                                    alt="Gallery"

                                />

                            ))}

                        </div>

                    </div>

                    <div className="card">

                        <h2>Packages</h2>

                        <div className="packages">

                            {service.packages.map(pkg => (

                                <div
                                    key={pkg.id}
                                    className="package-card"
                                >

                                    <h3>

                                        {pkg.name}

                                    </h3>

                                    <p>

                                        {pkg.description}

                                    </p>

                                    <h2>

                                        ₹{pkg.price.toLocaleString()}

                                    </h2>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

                <div className="right-column">

                    <div className="card">

                        <h2>Amenities</h2>

                        {service.amenities.map(item => (

                            <div
                                key={item}
                                className="amenity"
                            >

                                <FaCheckCircle />

                                {item}

                            </div>

                        ))}

                    </div>

                    <div className="card">

                        <h2>

                            <FaCalendarAlt />

                            Upcoming Bookings

                        </h2>

                        {service.upcomingBookings.map(date => (

                            <div
                                key={date}
                                className="booking-date"
                            >

                                {date}

                            </div>

                        ))}

                    </div>

                    <button className="edit-service-btn">

                        <FaEdit />

                        Edit Service

                    </button>

                </div>

            </div>

        </section>

    );

}