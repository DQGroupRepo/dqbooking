import { useEffect, useState } from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

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

import Button
    from "../../components/common/ui/Button/Button";

import VendorServiceService
    from "../../services/VendorServiceService";

import type {
    VendorService
} from "../../types/VendorService";

import MediaViewer, {
    type MediaItem
} from "../../components/common/media/MediaViewer/MediaViewer";

import "./VendorServiceProfile.css";


type ServiceDetailAttribute = {

    key: string;

    value: string;

};


type ServiceDetailSection = {

    key: string;

    title: string;

    attributes: ServiceDetailAttribute[];

};


export default function VendorServiceProfile() {


    const { serviceId } =
        useParams();


    const navigate =
        useNavigate();


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


    /*
     * =========================================
     * FORMAT DETAIL LABEL
     * =========================================
     *
     * Converts:
     *
     * hallCapacity -> Hall Capacity
     * diningHall   -> Dining Hall
     * lightingInfra -> Lighting Infra
     *
     * No labels are hardcoded here.
     */
    const formatDetailLabel = (
        key: string
    ): string => {


        return key

            .replace(
                /([A-Z])/g,
                " $1"
            )

            .replace(
                /^./,
                character =>
                    character.toUpperCase()
            )

            .trim();

    };


    /*
     * =========================================
     * FORMAT DETAIL VALUE
     * =========================================
     */
    const formatDetailValue = (
        value: string
    ): string => {


        if (
            value === "true"
        ) {

            return "Available";

        }


        if (
            value === "false"
        ) {

            return "Not Available";

        }


        return value;

    };


    useEffect(() => {

        loadService();

    }, [serviceId]);


    /*
     * =========================================
     * LOAD SERVICE
     * =========================================
     */
    const loadService = async () => {


        if (!serviceId) {

            return;

        }


        try {


            const response =
                await VendorServiceService
                    .getServiceById(
                        serviceId
                    );


            if (!response) {

                return;

            }


            console.log(
                "Service response:",
                response
            );


            setService(
                response
            );


            setAmenities(
                response.amenities ?? []
            );


            const mediaUrls =
                response.imageUrls ?? [];


            setGallery(
                mediaUrls
            );


            if (
                mediaUrls.length > 0
            ) {


                setSelectedImage(
                    mediaUrls[0]
                );


                setSelectedIndex(
                    0
                );


            } else {


                setSelectedImage(
                    "/images/no-image.png"
                );


                setSelectedIndex(
                    0
                );

            }


        } catch (error) {


            console.error(
                "Failed to load service:",
                error
            );


        }


    };


    /*
     * =========================================
     * DETECT VIDEO
     * =========================================
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
     * =========================================
     * MEDIA VIEWER ITEMS
     * =========================================
     */
    const mediaItems: MediaItem[] =
        gallery.map(
            url => ({

                src: url,

                type:
                    isVideo(url)
                        ? "video"
                        : "image"

            })
        );


    /*
     * =========================================
     * OPEN MEDIA VIEWER
     * =========================================
     */
    const openViewer = (
        index: number
    ) => {


        if (
            gallery.length === 0
        ) {

            return;

        }


        setViewerIndex(
            index
        );


        setViewerOpen(
            true
        );


    };


    if (!service) {


        return (

            <h2>
                Loading...
            </h2>

        );


    }


    /*
     * Response extension.
     *
     * This keeps the existing VendorService usage
     * unchanged while reading the new response fields.
     */
    const serviceResponse =
        service as VendorService & {

            detailSections?:
            ServiceDetailSection[];

        };


    return (


        <section className="service-profile">


            {/* BACK */}


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


                {

                    isVideo(
                        selectedImage
                    )

                        ? (

                            <video

                                src={
                                    selectedImage
                                }

                                muted

                                autoPlay

                                loop

                                playsInline

                                className="hero-image"

                                onClick={() =>
                                    openViewer(
                                        selectedIndex
                                    )
                                }

                            />

                        )

                        : (

                            <img

                                src={
                                    selectedImage ||
                                    "/images/no-image.png"
                                }

                                alt={
                                    service.serviceName
                                }

                                className="hero-image"

                                onClick={() =>

                                    gallery.length > 0 &&

                                    openViewer(
                                        selectedIndex
                                    )

                                }

                            />

                        )

                }


                <div className="hero-overlay">


                    <span className="status-badge">


                        {
                            service.active
                                ? "Active"
                                : "Inactive"
                        }


                    </span>


                    <h1>

                        {
                            service.serviceName
                        }

                    </h1>


                    <p>


                        {
                            service.category
                        }


                        <span className="dot">

                            •

                        </span>


                        <FaMapMarkerAlt />


                        {" "}


                        {
                            service.location
                        }


                    </p>


                    <div className="rating">


                        <FaStar />


                        {
                            service.rating ?? 0
                        }


                        <span>


                            (
                            {
                                service.reviewCount ?? 0
                            }
                            {" "}
                            Reviews)


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

                        ₹
                        {
                            Number(
                                service.startingPrice ?? 0
                            ).toLocaleString()
                        }

                    </h2>


                </div>


                <div className="stat-card">


                    <h4>

                        Capacity

                    </h4>


                    <h2>


                        <FaUsers />


                        {" "}


                        {
                            service.capacity ?? "-"
                        }


                    </h2>


                </div>


                <div className="stat-card">


                    <h4>

                        Reviews

                    </h4>


                    <h2>


                        {
                            service.reviewCount ?? 0
                        }


                    </h2>


                </div>


                <div className="stat-card">


                    <h4>

                        Upcoming

                    </h4>


                    <h2>


                        {/* Upcoming booking count */}


                    </h2>


                </div>


            </div>


            <div className="content-grid">


                {/* LEFT COLUMN */}


                <div className="left-column">


                    {/* OVERVIEW */}


                    <div className="card">


                        <h2>

                            Overview

                        </h2>


                        <p>

                            {
                                service.description ||
                                "No description available."
                            }

                        </p>


                    </div>


                    {/* SERVICE DETAIL SECTIONS */}


                    {

                        serviceResponse.detailSections &&
                        serviceResponse.detailSections.length > 0 && (

                            <>

                                {

                                    serviceResponse.detailSections.map(
                                        section => (

                                            <div

                                                key={
                                                    section.key
                                                }

                                                className="card service-detail-section"

                                            >


                                                <h2>

                                                    {
                                                        section.title
                                                    }

                                                </h2>


                                                <div className="attributes-grid">


                                                    {

                                                        section.attributes.map(
                                                            (
                                                                attribute,
                                                                index
                                                            ) => (

                                                                <div

                                                                    key={
                                                                        `${attribute.key}-${index}`
                                                                    }

                                                                    className="attribute-item"

                                                                >


                                                                    <span>

                                                                        {

                                                                            formatDetailLabel(
                                                                                attribute.key
                                                                            )

                                                                        }

                                                                    </span>


                                                                    <strong>

                                                                        {

                                                                            formatDetailValue(
                                                                                attribute.value
                                                                            )

                                                                        }

                                                                    </strong>


                                                                </div>

                                                            )

                                                        )

                                                    }


                                                </div>


                                            </div>

                                        )

                                    )

                                }

                            </>

                        )

                    }


                    {/* GALLERY */}


                    <div className="card">


                        <h2>


                            <FaImage />


                            Gallery


                        </h2>


                        {

                            gallery.length > 0

                                ? (

                                    <div className="gallery">


                                        {

                                            gallery.map(

                                                (
                                                    media,
                                                    index
                                                ) => {


                                                    const mediaIsVideo =
                                                        isVideo(
                                                            media
                                                        );


                                                    return (


                                                        <div

                                                            key={
                                                                `${media}-${index}`
                                                            }

                                                            className="service-media-item"

                                                            onClick={() =>
                                                                openViewer(
                                                                    index
                                                                )
                                                            }

                                                        >


                                                            {

                                                                mediaIsVideo

                                                                    ? (

                                                                        <video

                                                                            src={
                                                                                media
                                                                            }

                                                                            muted

                                                                            playsInline

                                                                            className="service-media"

                                                                        />

                                                                    )

                                                                    : (

                                                                        <img

                                                                            src={
                                                                                media
                                                                            }

                                                                            alt={
                                                                                `${service.serviceName}-${index}`
                                                                            }

                                                                            className="service-media"

                                                                        />

                                                                    )

                                                            }


                                                        </div>


                                                    );


                                                }

                                            )

                                        }


                                    </div>

                                )

                                : (

                                    <p>

                                        No gallery images available.

                                    </p>

                                )

                        }


                    </div>


                    {/* PACKAGES */}


                    <div className="card">


                        <h2>

                            Packages

                        </h2>


                        {

                            service.packages &&
                                service.packages.length > 0

                                ? (

                                    <div className="packages">


                                        {

                                            service.packages.map(
                                                pkg => (

                                                    <div

                                                        key={
                                                            pkg.id
                                                        }

                                                        className={
                                                            `package-card ${!pkg.active
                                                                ? "inactive-package"
                                                                : ""
                                                            }`
                                                        }

                                                    >


                                                        <div className="package-type">


                                                            {
                                                                pkg.type
                                                            }


                                                        </div>


                                                        <h2>

                                                            ₹
                                                            {
                                                                Number(
                                                                    pkg.price ?? 0
                                                                ).toLocaleString()
                                                            }

                                                        </h2>


                                                        <div className="package-status">


                                                            {

                                                                pkg.active

                                                                    ? "Available"

                                                                    : "Currently Unavailable"

                                                            }


                                                        </div>


                                                        {

                                                            pkg.features &&
                                                            pkg.features.length > 0 && (

                                                                <ul className="package-features">


                                                                    {

                                                                        pkg.features.map(
                                                                            feature => (

                                                                                <li

                                                                                    key={
                                                                                        feature
                                                                                    }

                                                                                >


                                                                                    <FaCheckCircle />


                                                                                    {
                                                                                        feature
                                                                                    }


                                                                                </li>

                                                                            )

                                                                        )

                                                                    }


                                                                </ul>

                                                            )

                                                        }


                                                    </div>

                                                )

                                            )

                                        }


                                    </div>

                                )

                                : (

                                    <p>

                                        No packages available.

                                    </p>

                                )

                        }


                    </div>


                </div>


                {/* RIGHT COLUMN */}


                <div className="right-column">


                    {/* AMENITIES */}


                    <div className="card">


                        <h2>

                            Amenities

                        </h2>


                        {

                            amenities.length > 0

                                ? (

                                    amenities.map(
                                        item => (

                                            <div

                                                key={
                                                    item
                                                }

                                                className="amenity"

                                            >


                                                <FaCheckCircle />


                                                {
                                                    item
                                                }


                                            </div>

                                        )

                                    )

                                )

                                : (

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


                        <p>

                            No upcoming bookings.

                        </p>


                    </div>


                    {/* ACTIONS */}


                    <div className="service-actions">


                        <Button

                            onClick={() =>

                                navigate(
                                    `/vendor/services/${serviceId}/pricing`
                                )

                            }

                        >

                            Pricing

                        </Button>


                        <Button

                            onClick={() =>

                                navigate(
                                    `/vendor/services/edit/${serviceId}`
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
                                    `/vendor/services/${serviceId}/slots`
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

                        media={
                            mediaItems
                        }

                        initialIndex={
                            viewerIndex
                        }

                        onClose={() =>
                            setViewerOpen(
                                false
                            )
                        }

                    />

                )

            }


        </section>


    );


}