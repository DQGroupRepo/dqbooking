import { useState } from "react";
import { useParams } from "react-router-dom";

import "./VendorAddService.css";

import BasicInfoSection from "../../components/vendor/listing/BasicInfoSection/BasicInfoSection";
import AmenitiesSection from "../../components/vendor/listing/AmenitiesSection/AmenitiesSection";
import GallerySection from "../../components/vendor/listing/GallerySection/GallerySection";
import ContactSection from "../../components/vendor/listing/ContactSection/ContactSection";
import AvailabilitySection from "../../components/vendor/listing/AvailabilitySection/AvailabilitySection";
import BookingSettingsSection from "../../components/vendor/listing/BookingSettingsSection/BookingSettingsSection";
import FormActions from "../../components/vendor/listing/FormActions/FormActions";

import CategorySpecificSection from "../../components/vendor/listing/category/CategorySpecificSection";
import BackButton from "../../components/common/ui/BackButton/BackButton";

import FormProgress from "../../components/common/ui/FormProgress/FormProgress";
import calculateListingProgress from "../../util/calculateListingProgress";
import toast from "react-hot-toast";

const AddService = () => {

    const { category } = useParams();

    const [formData, setFormData] = useState({

        category: category ?? "",

        serviceName: "",

        location: "",

        price: "",

        capacity: "",

        description: "",

        hallCapacity: "",

        diningCapacity: "",

        parkingCapacity: "",

        rooms: "",

        contactPerson: "",

        mobile: "",

        email: "",

        availableFrom: "",

        availableTo: "",

        maxSimultaneousBookings: "1",

        bundleOfferEnabled: false

    });

    const [amenities, setAmenities] = useState<string[]>([]);

    const [images, setImages] = useState<File[]>([]);

    const amenityList = [

        "AC Hall",

        "Parking",

        "Dining Area",

        "Stage",

        "Generator Backup",

        "Catering Available"

    ];

    const handleChange = (

        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >

    ) => {

        setFormData({

            ...formData,

            [e.target.name]:

                e.target.type === "checkbox"

                    ? (e.target as HTMLInputElement).checked

                    : e.target.value

        });

    };

    const handleAmenityChange = (item: string) => {

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

        const files = Array.from(e.target.files || []);

        setImages(prev => [

            ...prev,

            ...files

        ]);

    };

    const removeImage = (

        index:number

    )=>{

        setImages(

            images.filter((_,i)=>i!==index)

        );

    };

    function validateForm() {

        const validationErrors:string[]=[];

        if(!formData.serviceName.trim())
            validationErrors.push("Service Name");

        if(!formData.location.trim())
            validationErrors.push("Location");

        if(!formData.price)
            validationErrors.push("Price");

        if(!formData.contactPerson.trim())
            validationErrors.push("Contact Person");

        if(!formData.mobile.trim())
            validationErrors.push("Mobile");

        if(!formData.email.trim())
            validationErrors.push("Email");

        setErrors(validationErrors);

        return validationErrors.length===0;

    }

    const handleSubmit = async (

        e:React.FormEvent

    )=>{

        e.preventDefault();

        if(!validateForm()){

            toast.error("Please complete all required fields.");

            return;

        }

        setPublishing(true);

        await new Promise(

            resolve=>setTimeout(resolve,2000)

        );

        setPublishing(false);

        toast.success("Listing Published Successfully 🎉");

    };

    const progress = calculateListingProgress(

        formData,

        amenities,

        images

    );

    const [publishing, setPublishing] = useState(false);

    const [saved, setSaved] = useState(false);

    const [errors, setErrors] = useState<string[]>([]);

    function saveDraft(){

        localStorage.setItem(

            "vendorListingDraft",

            JSON.stringify({

                formData,

                amenities

            })

        );

        setSaved(true);

        setTimeout(

            ()=>setSaved(false),

            2500

        );

    }

    return (

        <section className="vendor-form-section">

            <div className="vendor-form-container">

                <div className="vendor-form-card">

                    <BackButton

                        label="Back to Categories"

                        to="/vendor/create-listing"

                    />

                    <h1>

                        Add New Service

                    </h1>

                    <p>

                        Create a new listing that customers can discover and book.

                    </p>

                    <FormProgress

                        progress={progress} Complete

                    />
                    <div className="vendor-form-card">

                        <BackButton
                            label="Back to Categories"
                            to="/vendor/create-listing"
                        />

                        <h1>
                            Add New Service
                        </h1>

                        <p>
                            Create a new listing that customers can discover and book.
                        </p>

                        <FormProgress
                            progress={progress}
                        />

                        <form onSubmit={handleSubmit}>

                            <BasicInfoSection
                                formData={formData}
                                handleChange={handleChange}
                            />

                            ...

                        </form>

                    </div>

                    <form onSubmit={handleSubmit}>

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

                            removeImage={removeImage}

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

                        <FormActions

                            onSaveDraft={saveDraft}

                            publishing={publishing}

                        />

                    </form>

                </div>

            </div>

        </section>

    );

};

export default AddService;
