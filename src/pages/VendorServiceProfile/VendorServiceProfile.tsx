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

import BasicInfoSection from "../../components/vendor/listing/BasicInfoSection/BasicInfoSection";
import AmenitiesSection from "../../components/vendor/listing/AmenitiesSection/AmenitiesSection";
import GallerySection from "../../components/vendor/listing/GallerySection/GallerySection";
import ContactSection from "../../components/vendor/listing/ContactSection/ContactSection";
import AvailabilitySection from "../../components/vendor/listing/AvailabilitySection/AvailabilitySection";
import BookingSettingsSection from "../../components/vendor/listing/BookingSettingsSection/BookingSettingsSection";
import CategorySpecificSection from "../../components/vendor/listing/category/CategorySpecificSection";

import VendorServiceService from "../../services/VendorServiceService";

import type { VendorService } from "../../types/VendorService";

import "./VendorServiceProfile.css";

export default function VendorServiceProfile() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [service, setService] = useState<VendorService>();

    const [formData, setFormData] = useState<VendorService>();

    const [isEditing, setIsEditing] = useState(false);

    const [gallery,setGallery] = useState<string[]>([]);

    const [selectedImage, setSelectedImage] = useState("");

    const [amenities, setAmenities] = useState<string[]>([]);

    const [editingAmenities, setEditingAmenities] = useState(false);

    const [editedAmenities, setEditedAmenities] = useState<string[]>([]);

    const [editingPackages, setEditingPackages] = useState(false);

    const [editedPackages, setEditedPackages] = useState(service?.packages || []);

    const [images, setImages] = useState<File[]>([]);

    const amenityList = [

        "AC Hall",

        "Parking",

        "Dining Area",

        "Stage",

        "Generator Backup",

        "Catering Available"

    ];

    useEffect(() => {

        loadService();

    }, [id]);

    const loadService = async () => {

        const response =
            await VendorServiceService.getServiceById(
                Number(id)
            );

        if (!response) return;

        setService(response);

        setFormData(response);

        setAmenities(response.amenities);

        if (response.gallery.length > 0) {

            setGallery(response.gallery);

            if(response.gallery.length>0){

                setSelectedImage(response.gallery[0]);

            }else{

                setSelectedImage(response.image);

            }

        }

        else {

            setSelectedImage(response.image);

        }

    };

    const toggleAmenity = (amenity: string) => {

        if (editedAmenities.includes(amenity)) {

            setEditedAmenities(
                editedAmenities.filter(item => item !== amenity)
            );

        } else {

            setEditedAmenities([
                ...editedAmenities,
                amenity
            ]);

        }

    };

    const removeExistingImage = (index:number)=>{

        const updated = gallery.filter(

            (_,i)=>i!==index

        );

        setGallery(updated);

        if(updated.length>0){

            setSelectedImage(updated[0]);

        }

    };

    const handleChange = (

        e: React.ChangeEvent<

            HTMLInputElement |

            HTMLTextAreaElement |

            HTMLSelectElement

        >

    ) => {

        if (!formData) return;

        setFormData({

            ...formData,

            [e.target.name]:

                e.target.type === "checkbox"

                    ? (e.target as HTMLInputElement).checked

                    : e.target.value

        });

    };

    const handleAmenityChange = (

        item: string

    ) => {

        if (amenities.includes(item)) {

            setAmenities(

                amenities.filter(

                    amenity => amenity !== item

                )

            );

        }

        else {

            setAmenities([

                ...amenities,

                item

            ]);

        }

    };

    const handleImages = (

        e: React.ChangeEvent<HTMLInputElement>

    ) => {

        setImages(

            Array.from(

                e.target.files || []

            )

        );

    };

    const removeImage = (index: number) => {

        setImages(

            images.filter((_, i) => i !== index)

        );

    };

    const handleSave = async () => {

        if (!formData) return;

        const updatedService = {

            ...formData,
            amenities: editedAmenities,
            amenities

        };

        await VendorServiceService.updateService(updatedService);

        setService(updatedService);

        setFormData(updatedService);

        setIsEditing(false);

    };

    const handleCancel = () => {

        if (!service) return;

        setFormData(service);

        setAmenities(service.amenities);

        setImages([]);

        setIsEditing(false);

    };

    if (!service || !formData) {

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

            <h1>

                {service.name}

            </h1>

            <p>

                {service.category}

                <span className="dot">•</span>

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

                {service.reviewCount}

            </h2>

        </div>

        <div className="stat-card">

            <h4>

                Upcoming

            </h4>

            <h2>

                {service.upcomingBookings.length}

            </h2>

        </div>

    </div>

    {

        isEditing ? (

            <div className="card">

                <BasicInfoSection

                    formData={formData}

                    handleChange={handleChange}

                />

                <CategorySpecificSection

                    category={formData.category}

                    formData={formData}

                    handleChange={handleChange}

                />

                <AmenitiesSection

                    amenities={amenities}

                    amenityList={amenityList}

                    handleAmenityChange={handleAmenityChange}

                />

              <GallerySection

              handleImages={handleImages}

              images={images}

              existingImages={gallery}

              removeImage={removeImage}

              removeExistingImage={removeExistingImage}

              />

                <ContactSection

                    formData={formData}

                    handleChange={handleChange}

                />

                <AvailabilitySection

                    formData={formData}

                    handleChange={handleChange}

                />

                <BookingSettingsSection

                    formData={formData}

                    handleChange={handleChange}

                />

            </div>

        ) : (

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

                                service.gallery.map(image => (

                                    <img

                                        key={image}

                                        src={image}

                                        alt="Gallery"

                                        onClick={() =>

                                            setSelectedImage(image)

                                        }

                                    />

                                ))

                            }

                        </div>

                    </div>
                                        <div className="card">

                                            <h2>

                                                Packages

                                            </h2>

                                            <div className="packages">

                                                {

                                                    service.packages.map(pkg => (

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

                                                    ))

                                                }

                                            </div>

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

                                            {

                                                service.upcomingBookings.length > 0 ? (

                                                    service.upcomingBookings.map(date => (

                                                        <div

                                                            key={date}

                                                            className="booking-date"

                                                        >

                                                            {date}

                                                        </div>

                                                    ))

                                                ) : (

                                                    <p>

                                                        No upcoming bookings.

                                                    </p>

                                                )

                                            }

                                        </div>

                                        <button

                                            className="edit-service-btn"

                                            onClick={() =>

                                                setIsEditing(true)

                                            }

                                        >

                                            <FaEdit />

                                            Edit Service

                                        </button>

                                    </div>

                                </div>

                            )

                        }

                        {

                            isEditing && (

                                <div

                                    style={{

                                        display: "flex",

                                        justifyContent: "flex-end",

                                        gap: "15px",

                                        marginTop: "30px"

                                    }}

                                >

                                    <Button

                                        variant="secondary"

                                        onClick={handleCancel}

                                    >

                                        Cancel

                                    </Button>

                                    <Button

                                        onClick={handleSave}

                                    >

                                        Save Changes

                                    </Button>

                                </div>

                            )

                        }

                    </section>

                    );

                    }