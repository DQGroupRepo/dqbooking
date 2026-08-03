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

import MediaViewer, {
    type MediaItem
} from "../../components/common/media/MediaViewer/MediaViewer";

import "./VendorServiceProfile.css";


export default function VendorServiceProfile() {


    const { serviceId } = useParams();


    const navigate = useNavigate();


    const [service, setService] =
        useState<VendorService>();


    const [gallery, setGallery] =
        useState<string[]>([]);


    const [selectedImage, setSelectedImage] =
        useState("");


    const [selectedIndex, setSelectedIndex] =
        useState(0);


    const [viewerOpen, setViewerOpen] =
        useState(false);


    const [viewerIndex, setViewerIndex] =
        useState(0);


    const [amenities, setAmenities] =
        useState<string[]>([]);


    useEffect(() => {

        loadService();

    }, [serviceId]);


    const loadService = async () => {


        if (!serviceId) return;


        try {


            const response =
                await VendorServiceService
                    .getServiceById(serviceId);


            if (!response) return;


            setService(response);


            setAmenities(
                response.amenities ?? []
            );


            const mediaUrls =
                response.imageUrls ?? [];


            setGallery(mediaUrls);


            if (mediaUrls.length > 0) {


                setSelectedImage(
                    mediaUrls[0]
                );


                setSelectedIndex(0);


            } else {


                setSelectedImage(
                    "/images/no-image.png"
                );


                setSelectedIndex(0);

            }


        }

        catch (error) {


            console.error(error);


        }


    };


    /*
     * Detect whether the media URL
     * represents a video.
     */
    const isVideo = (
        url: string
    ): boolean => {


        const cleanUrl =
            url
                .split("?")[0]
                .toLowerCase();


        return (

            cleanUrl.endsWith(".mp4") ||

            cleanUrl.endsWith(".webm") ||

            cleanUrl.endsWith(".mov") ||

            cleanUrl.endsWith(".avi") ||

            cleanUrl.endsWith(".ogg")

        );

    };


    /*
     * Convert gallery URLs into
     * MediaViewer items.
     *
     * This gives MediaViewer the
     * complete gallery, allowing
     * Previous / Next navigation.
     */
    const mediaItems: MediaItem[] =
        gallery.map(url => ({

            src: url,

            type:
                isVideo(url)
                    ? "video"
                    : "image"

        }));


    /*
     * Open the full media viewer
     * starting at the selected item.
     */
    const openViewer = (
        index: number
    ) => {


        if (gallery.length === 0) return;


        setViewerIndex(index);


        setViewerOpen(true);


    };


    if (!service) {


        return <h2>Loading...</h2>;


    }


    return (


        <section className="service-profile">


            <button

                className="back-button"

                onClick={() =>
                    navigate(-1)
                }

            >

                <FaArrowLeft />

                Back

            </button>


            {/* HERO */}


            <div className="hero-card">


                {isVideo(selectedImage) ? (


                    <video

                        src={selectedImage}

                        muted

                        autoPlay

                        loop

                        playsInline

                        className="hero-image"

                        onClick={() =>
                            openViewer(selectedIndex)
                        }

                    />


                ) : (


                    <img

                        src={
                            selectedImage ||
                            "/images/no-image.png"
                        }

                        alt={service.serviceName}

                        className="hero-image"

                        onClick={() =>
                            gallery.length > 0 &&
                            openViewer(selectedIndex)
                        }

                    />


                )}


                <div className="hero-overlay">


                    <span className="status-badge">


                        {service.active
                            ? "Active"
                            : "Inactive"}


                    </span>


                    <h1>


                        {service.serviceName}


                    </h1>


                    <p>


                        {service.category}


                        <span className="dot">

                            •

                        </span>


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


                    {/* OVERVIEW */}


                    <div className="card">


                        <h2>

                            Overview

                        </h2>


                        <p>

                            {service.description}

                        </p>


                    </div>


                    {/* GALLERY */}


                    <div className="card">


                        <h2>


                            <FaImage />


                            Gallery


                        </h2>


                        <div className="gallery">


                            {gallery.map(

                                (media, index) => {


                                    const mediaIsVideo =
                                        isVideo(media);


                                    return (


                                        <div

                                            key={media}

                                            className="service-media-item"

                                            onClick={() =>
                                                openViewer(index)
                                            }

                                        >


                                            {mediaIsVideo ? (


                                                <video

                                                    src={media}

                                                    muted

                                                    playsInline

                                                    className="service-media"

                                                />


                                            ) : (


                                                <img

                                                    src={media}

                                                    alt={`${service.serviceName}-${index}`}

                                                    className="service-media"

                                                />


                                            )}


                                        </div>


                                    );


                                }

                            )}


                        </div>


                    </div>


                    {/* PACKAGES */}


                    <div className="card">


                        <h2>

                            Packages

                        </h2>


                    </div>


                </div>


                <div className="right-column">


                    {/* AMENITIES */}


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


                    {/* UPCOMING BOOKINGS */}


                    <div className="card">


                        <h2>


                            <FaCalendarAlt />


                            {" "}


                            Upcoming Bookings


                        </h2>


                    </div>


                    {/* ACTIONS */}


                    <div className="service-actions">

                        <Button
                                onClick={() =>
                                    navigate(`/vendor/services/${service.serviceId}/pricing`)
                                }
                            >
                                Pricing
                        </Button>

                        <Button

                            onClick={() =>

                                navigate(

                                    `/vendor/services/edit/${service.serviceId}`

                                )

                            }

                        >

                            <FaEdit />

                            Edit Service

                        </Button>


                        <Button

                            variant="secondary"

                            onClick={() =>

                                navigate(

                                    `/vendor/services/${service.serviceId}/slots`

                                )

                            }

                        >

                            Manage Booking Slots

                        </Button>


                    </div>


                </div>


            </div>


            {/* FULL MEDIA VIEWER */}


            {


                viewerOpen &&

                mediaItems.length > 0 && (


                    <MediaViewer

                        media={mediaItems}

                        initialIndex={viewerIndex}

                        onClose={() =>

                            setViewerOpen(false)

                        }

                    />


                )


            }


        </section>


    );


}