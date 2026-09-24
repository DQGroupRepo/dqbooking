import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import axios from "axios";

import "./VendorAddService.css";

import type {
    VendorServiceForm
} from "../../types/VendorServiceForm";

import {
    getCategorySections
} from "../../util/ServiceDetailSectionUtil";

import VendorServiceMapper
    from "../../mapper/VendorServiceMapper";

import BasicInfoSection
    from "../../components/vendor/listing/BasicInfoSection/BasicInfoSection";

import ImageUploader
    from "../../components/common/imageUpload/ImageUploader";

import UploadService
    from "../../services/UploadService";

import ContactSection
    from "../../components/vendor/listing/ContactSection/ContactSection";

import ServiceDetailsSection
    from "../../components/vendor/listing/ServiceDetailsSection/ServiceDetailsSection";

import FormActions
    from "../../components/vendor/listing/FormActions/FormActions";

import CategorySpecificSection
    from "../../components/vendor/listing/category/CategorySpecificSection";

import BackButton
    from "../../components/common/ui/BackButton/BackButton";

import VendorServiceService
    from "../../services/VendorServiceService";

import VendorServiceFormFactory
    from "../../util/VendorServiceFormFactory";

import FormProgress
    from "../../components/common/ui/FormProgress/FormProgress";

import calculateListingProgress
    from "../../util/calculateListingProgress";

import type {
    CateringMenuItem
} from "../../types/CateringMenuItem";

import VendorCateringMenuService
    from "../../services/VendorCateringMenuService";

import toast
    from "react-hot-toast";

import type {
    MediaItem,
    ExistingMediaItem
} from "../../components/common/imageUpload/ImageUploader.types";


const AddService = () => {

    const {
        id,
        category
    } = useParams();


    const isEditMode =
        !!id;


    const navigate =
        useNavigate();


    /*
     * =========================
     * Form Data
     * =========================
     */

    const [
        formData,
        setFormData
    ] = useState<VendorServiceForm>(
        VendorServiceFormFactory.create(
            category ?? ""
        )
    );


    /*
     * =========================
     * Unified Media State
     * =========================
     */

    const [
        media,
        setMedia
    ] = useState<MediaItem[]>([]);


    /*
     * =========================
     * UI State
     * =========================
     */

    const [
        publishing,
        setPublishing
    ] = useState(false);


    const [
        saved,
        setSaved
    ] = useState(false);


    const [
        errors,
        setErrors
    ] = useState<string[]>([]);


    /*
     * =========================
     * Catering Helpers
     * =========================
     */

    const isCateringCategory = (
        serviceCategory?: string
    ) => {

        return (
            serviceCategory
                ?.toLowerCase()
                .trim() ===
            "catering"
        );

    };


    /*
     * Convert backend catering menu
     * response into frontend menu items.
     *
     * Backend response:
     *
     * standard dish:
     *   dishId
     *   name
     *
     * custom dish:
     *   custom === true
     *   name
     *
     * The frontend also needs:
     *   customName
     *   selected
     *   pricePerPerson as string
     */

    const mapCateringMenuResponseToForm = (
        items: CateringMenuItem[]
    ): CateringMenuItem[] => {

        return items.map(
            item => ({

                id:
                    item.id,

                dishId:
                    item.dishId,

                customName:
                    item.custom
                        ? (
                            item.customName ??
                            item.name
                        )
                        : undefined,

                name:
                    item.name,

                cuisine:
                    item.cuisine,

                category:
                    item.category,

                foodType:
                    item.foodType,

                pricePerPerson:
                    String(
                        item.pricePerPerson
                    ),

                active:
                    item.active,

                custom:
                    item.custom,

                selected:
                    true

            })
        );

    };


    /*
     * =========================
     * Build Catering Menu Request
     * =========================
     *
     * The backend menu API owns
     * vendor-specific menu items.
     *
     * Temporary frontend custom IDs
     * such as:
     *
     * custom-123456-ab12cd
     *
     * must NOT be sent as persisted IDs.
     *
     * Existing backend UUIDs are
     * preserved.
     */

    const buildCateringMenuRequest = () => {

        if (
            !formData.cateringDetails
        ) {

            return {
                items: []
            };

        }


        const items =
            formData
                .cateringDetails
                .menuItems
                .map(
                    item => {

                        const trimmedPrice =
                            item.pricePerPerson
                                .trim();


                        const price =
                            Number(
                                trimmedPrice
                            );


                        if (
                            trimmedPrice === "" ||
                            !Number.isFinite(price) ||
                            price < 0
                        ) {

                            throw new Error(
                                `Invalid price for "${item.name}". Please enter a valid price per person.`
                            );

                        }


                        /*
                         * Only IDs returned by the
                         * backend are persisted.
                         *
                         * New custom dishes use
                         * temporary custom-* IDs.
                         */

                        const persistedId =
                            item.id &&
                            !item.id.startsWith(
                                "custom-"
                            )
                                ? item.id
                                : undefined;


                        /*
                         * Custom dish
                         */

                        if (
                            item.custom
                        ) {

                            const customName =
                                (
                                    item.customName ??
                                    item.name
                                ).trim();


                            if (
                                !customName
                            ) {

                                throw new Error(
                                    "Custom dish name cannot be empty."
                                );

                            }


                            return {

                                ...(persistedId
                                    ? {
                                        id:
                                            persistedId
                                    }
                                    : {}),

                                customName,

                                cuisine:
                                    item.cuisine,

                                category:
                                    item.category,

                                foodType:
                                    item.foodType,

                                pricePerPerson:
                                    price,

                                active:
                                    item.active

                            };

                        }


                        /*
                         * Standard master-catalog dish
                         */

                        if (
                            !item.dishId
                        ) {

                            throw new Error(
                                `Dish "${item.name}" is missing its catalog reference.`
                            );

                        }


                        return {

                            ...(persistedId
                                ? {
                                    id:
                                        persistedId
                                }
                                : {}),

                            dishId:
                                item.dishId,

                            pricePerPerson:
                                price,

                            active:
                                item.active

                        };

                    }
                );


        return {
            items
        };

    };


    /*
     * =========================
     * Load Existing Service
     * =========================
     */

    useEffect(() => {

        if (!isEditMode) {

            return;

        }


        loadService();

    }, [id]);


    const loadService =
        async () => {

            if (!id) {

                return;

            }


            try {

                /*
                 * =============================
                 * Load Vendor Service
                 * =============================
                 */

                const service =
                    await VendorServiceService
                        .getServiceById(
                            id
                        );


                const mappedForm =
                    VendorServiceMapper
                        .responseToForm(
                            service
                        );


                /*
                 * =============================
                 * Load Catering Menu
                 * =============================
                 *
                 * Catering menu is stored
                 * separately from VendorService.
                 */

                if (
                    isCateringCategory(
                        service.category
                    )
                ) {

                    try {

                        const cateringMenu =
                            await VendorCateringMenuService
                                .getMenu(
                                    id
                                );


                        const menuItems =
                            mapCateringMenuResponseToForm(
                                cateringMenu.items
                            );


                        if (
                            mappedForm.cateringDetails
                        ) {

                            mappedForm.cateringDetails = {

                                ...mappedForm.cateringDetails,

                                menuItems

                            };

                        }

                    }
                    catch (menuError) {

                        console.error(
                            "Failed to load catering menu:",
                            menuError
                        );


                        /*
                         * The service itself loaded
                         * successfully, so keep the
                         * listing editable.
                         *
                         * An empty menu is safer than
                         * blocking the entire edit page.
                         */

                        if (
                            axios.isAxiosError(
                                menuError
                            ) &&
                            menuError.response?.status === 403
                        ) {

                            toast.error(
                                "You do not have permission to load the catering menu."
                            );

                        }
                        else {

                            toast.error(
                                "Unable to load the existing catering menu."
                            );

                        }

                    }

                }


                setFormData(
                    mappedForm
                );


                /*
                 * =============================
                 * Existing Media
                 * =============================
                 */

                const existingMedia:
                    MediaItem[] =
                    (
                        service.imageUrls ?? []
                    ).map(
                        (
                            url,
                            index
                        ) => ({

                            id:
                                `existing-${index}-${url}`,

                            kind:
                                "existing",

                            url

                        })
                    );


                setMedia(
                    existingMedia
                );

            }
            catch (error) {

                console.error(
                    "Failed to load service:",
                    error
                );


                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 403
                ) {

                    toast.error(
                        "You do not have permission to load this service."
                    );

                    return;

                }


                toast.error(
                    "Unable to load service."
                );

            }

        };


    /*
     * =========================
     * Form Changes
     * =========================
     */

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => {

        setFormData(
            previous => ({

                ...previous,

                [e.target.name]:

                    e.target.type ===
                    "checkbox"

                        ? (
                            e.target as
                            HTMLInputElement
                        ).checked

                        : e.target.value

            })
        );

    };


    /*
     * =========================
     * Detail Changes
     * =========================
     */

    const handleDetailChange = (

        sectionKey: string,

        attributeKey: string,

        value: string | boolean

    ) => {

        setFormData(
            previous => {

                const sectionDefinitions =
                    getCategorySections(
                        previous.category
                    );


                const sectionDefinition =
                    sectionDefinitions.find(
                        section =>
                            section.key ===
                            sectionKey
                    );


                const existingSection =
                    previous.detailSections.find(
                        section =>
                            section.key ===
                            sectionKey
                    );


                let updatedSections;


                if (
                    existingSection
                ) {

                    updatedSections =
                        previous.detailSections.map(
                            section => {

                                if (
                                    section.key !==
                                    sectionKey
                                ) {

                                    return section;

                                }


                                const attributeExists =
                                    section.attributes.some(
                                        attribute =>
                                            attribute.key ===
                                            attributeKey
                                    );


                                return {

                                    ...section,

                                    attributes:

                                        attributeExists

                                            ? section.attributes.map(
                                                attribute =>

                                                    attribute.key ===
                                                    attributeKey

                                                        ? {

                                                            ...attribute,

                                                            value:
                                                                String(
                                                                    value
                                                                )

                                                        }

                                                        : attribute
                                            )

                                            : [

                                                ...section.attributes,

                                                {

                                                    key:
                                                        attributeKey,

                                                    value:
                                                        String(
                                                            value
                                                        )

                                                }

                                            ]

                                };

                            }
                        );

                }
                else {

                    updatedSections = [

                        ...previous.detailSections,

                        {

                            key:
                                sectionKey,

                            title:
                                sectionDefinition?.title ??
                                sectionKey,

                            attributes: [

                                {

                                    key:
                                        attributeKey,

                                    value:
                                        String(
                                            value
                                        )

                                }

                            ]

                        }

                    ];

                }


                return {

                    ...previous,

                    detailSections:
                        updatedSections

                };

            }
        );

    };


    /*
     * =========================
     * Catering Details
     * =========================
     */

    const handleCateringDetailsChange = (

        field: string,

        value: boolean | string[]

    ) => {

        setFormData(
            previous => {

                if (
                    !previous.cateringDetails
                ) {

                    return previous;

                }


                return {

                    ...previous,

                    cateringDetails: {

                        ...previous.cateringDetails,

                        [field]:
                            value

                    }

                };

            }
        );

    };


    const handleCateringMenuItemsChange = (
        items: CateringMenuItem[]
    ) => {

        setFormData(
            previous => {

                if (
                    !previous.cateringDetails
                ) {

                    return previous;

                }


                return {

                    ...previous,

                    cateringDetails: {

                        ...previous.cateringDetails,

                        menuItems:
                            items

                    }

                };

            }
        );

    };


    /*
     * =========================
     * Amenities
     * =========================
     */

    const handleAmenityChange = (
        item: string
    ) => {

        setFormData(
            previous => ({

                ...previous,

                amenities:
                    previous.amenities.includes(
                        item
                    )

                        ? previous.amenities.filter(
                            amenity =>
                                amenity !== item
                        )

                        : [
                            ...previous.amenities,
                            item
                        ]

            })
        );

    };


    /*
     * =========================
     * Validation
     * =========================
     */

    function validateForm() {

        const validationErrors:
            string[] = [];


        if (
            !formData.serviceName.trim()
        ) {

            validationErrors.push(
                "Service Name"
            );

        }


        if (
            !formData.location.trim()
        ) {

            validationErrors.push(
                "Location"
            );

        }


        if (
            !formData.address.trim()
        ) {

            validationErrors.push(
                "Address"
            );

        }


        if (
            !formData.description.trim()
        ) {

            validationErrors.push(
                "About Your Service"
            );

        }


        if (
            !formData.contactPerson.trim()
        ) {

            validationErrors.push(
                "Contact Person"
            );

        }


        if (
            !formData.mobile.trim()
        ) {

            validationErrors.push(
                "Mobile"
            );

        }


        if (
            !formData.email.trim()
        ) {

            validationErrors.push(
                "Email"
            );

        }


        setErrors(
            validationErrors
        );


        return (
            validationErrors.length ===
            0
        );

    }


    /*
     * =========================
     * Remove Existing Media
     * =========================
     */

    const handleRemoveExistingMedia = (
        item: ExistingMediaItem
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to remove this image/video? The change will be saved only when you click Update."
            );


        if (!confirmed) {

            return;

        }


        setMedia(
            currentMedia =>
                currentMedia.filter(
                    currentItem =>
                        currentItem.id !==
                        item.id
                )
        );

    };


    /*
     * =========================
     * Save Catering Menu
     * =========================
     */

    const saveCateringMenu = async (
        serviceId: string
    ) => {

        if (
            !isCateringCategory(
                formData.category
            )
        ) {

            return;

        }


        if (
            !formData.cateringDetails
        ) {

            throw new Error(
                "Catering details are missing."
            );

        }


        const request =
            buildCateringMenuRequest();


        await VendorCateringMenuService
            .updateMenu(
                serviceId,
                request
            );

    };


    /*
     * =========================
     * Submit
     * =========================
     */

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();


        if (!validateForm()) {

            toast.error(
                "Please complete all required fields."
            );

            return;

        }


        setPublishing(
            true
        );


        let serviceId = "";


        try {

            /*
             * =============================
             * Upload new media
             * =============================
             */

            const newMediaItems =
                media.filter(
                    item =>
                        item.kind ===
                        "new"
                );


            const uploadedUrls:
                string[] =
                newMediaItems.length > 0

                    ? await UploadService
                        .uploadImages(
                            newMediaItems.map(
                                item =>
                                    item.kind ===
                                    "new"

                                        ? item.file

                                        : new File(
                                            [],
                                            ""
                                        )
                            )
                        )

                    : [];


            /*
             * =============================
             * Preserve media order
             * =============================
             */

            let uploadedIndex =
                0;


            const finalImageUrls:
                string[] =
                media.map(
                    item => {

                        if (
                            item.kind ===
                            "existing"
                        ) {

                            return item.url;

                        }


                        const uploadedUrl =
                            uploadedUrls[
                                uploadedIndex
                            ];


                        uploadedIndex++;


                        return uploadedUrl;

                    }
                );


            /*
             * =============================
             * Build request
             * =============================
             */

            const request =
                VendorServiceMapper
                    .formToRequest(
                        formData
                    );


            request.imageUrls =
                finalImageUrls;


            /*
             * =============================
             * UPDATE
             * =============================
             */

            if (isEditMode) {

                const updatedService =
                    await VendorServiceService
                        .updateService(
                            id!,
                            request
                        );


                serviceId =
                    updatedService.id;


                /*
                 * Catering menu is persisted
                 * separately after the service
                 * has been successfully updated.
                 */

                if (
                    isCateringCategory(
                        updatedService.category
                    )
                ) {

                    await saveCateringMenu(
                        serviceId
                    );

                }


                toast.success(
                    "Service updated successfully."
                );

            }


            /*
             * =============================
             * CREATE
             * =============================
             */

            else {

                const createdService =
                    await VendorServiceService
                        .createService(
                            request
                        );


                serviceId =
                    createdService.id;


                /*
                 * The service ID now exists,
                 * so the vendor catering menu
                 * can be created/updated.
                 */

                if (
                    isCateringCategory(
                        createdService.category
                    )
                ) {

                    await saveCateringMenu(
                        serviceId
                    );

                }


                toast.success(
                    "Listing published successfully 🎉"
                );

            }


            /*
             * =============================
             * Navigate only after BOTH
             * service + catering menu
             * have been persisted.
             * =============================
             */

            navigate(
                `/vendor/services/${serviceId}/pricing`
            );

        }
        catch (error) {

            console.error(
                "Failed to save service:",
                error
            );


            /*
             * =================================
             * Catering menu validation error
             * =================================
             */

            if (
                error instanceof Error &&
                !axios.isAxiosError(error)
            ) {

                toast.error(
                    error.message
                );

                return;

            }


            /*
             * =================================
             * CENTRALIZED 403 USER MESSAGE
             * =================================
             */

            if (
                axios.isAxiosError(error) &&
                error.response?.status === 403
            ) {

                toast.error(

                    isEditMode

                        ? "You do not have permission to edit this service."

                        : "You do not have permission to create a service."

                );

                return;

            }


            toast.error(
                "Unable to save listing."
            );

        }
        finally {

            setPublishing(
                false
            );

        }

    };


    /*
     * =========================
     * Progress
     * =========================
     */

    const progress =
        calculateListingProgress(
            formData,
            formData.amenities,
            media
                .filter(
                    item =>
                        item.kind ===
                        "new"
                )
                .map(
                    item =>
                        item.kind ===
                        "new"

                            ? item.file

                            : new File(
                                [],
                                ""
                            )
                )
        );


    /*
     * =========================
     * Save Draft
     * =========================
     */

    function saveDraft() {

        localStorage.setItem(
            "vendorListingDraft",
            JSON.stringify(
                formData
            )
        );


        setSaved(
            true
        );


        toast.success(
            "Draft saved successfully."
        );


        setTimeout(
            () =>
                setSaved(
                    false
                ),
            2500
        );

    }


    /*
     * =========================
     * Scroll helper
     * =========================
     */

    const scrollToSection = (
        sectionId: string
    ) => {

        document
            .getElementById(
                sectionId
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    };


    return (

        <section className="vendor-form-section">

            <div className="vendor-form-container">

                {/* =========================================
                    PAGE HEADER
                ========================================= */}

                <div className="vendor-form-page-header">

                    <BackButton
                        label="Back to Categories"
                        to="/vendor/create-listing"
                    />


                    <div className="vendor-form-heading">

                        <div>

                            <h1>

                                {
                                    isEditMode
                                        ? "Edit Service"
                                        : "Add New Service"
                                }

                            </h1>


                            <p>

                                {
                                    isEditMode
                                        ? "Update your listing details and keep your service information current."
                                        : "Create a professional listing that customers can discover and book."
                                }

                            </p>

                        </div>


                        {
                            formData.category && (

                                <div className="category-badge">

                                    {formData.category}

                                </div>

                            )
                        }

                    </div>

                </div>


                {/* =========================================
                    PROGRESS
                ========================================= */}

                <div className="vendor-form-progress-card">

                    <div>

                        <div className="progress-title">

                            <strong>
                                Listing progress
                            </strong>

                            <span>
                                {progress}% Complete
                            </span>

                        </div>


                        <div className="progress-track">

                            <div
                                className="progress-value"
                                style={{
                                    width: `${progress}%`
                                }}
                            />

                        </div>


                        <p>

                            Complete the required information
                            before publishing your listing.

                        </p>

                    </div>

                </div>


                {/* =========================================
                    MAIN WORKSPACE
                ========================================= */}

                <div className="vendor-form-workspace">


                    {/* =====================================
                        MAIN FORM
                    ===================================== */}

                    <main className="vendor-form-main">

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >


                            {/* =================================
                                BASIC INFORMATION
                            ================================= */}

                            <section
                                id="basic-information"
                                className="vendor-form-section-card"
                            >

                                <div className="form-section-heading">

                                    <div className="section-number">
                                        1
                                    </div>

                                    <div>

                                        <h2>
                                            Basic Information
                                        </h2>

                                        <p>
                                            Start with the essential
                                            information customers need.
                                        </p>

                                    </div>

                                </div>


                                <BasicInfoSection

                                    formData={
                                        formData
                                    }

                                    handleChange={
                                        handleChange
                                    }

                                />

                            </section>


                            {/* =================================
                                SERVICE DETAILS
                            ================================= */}

                            <section
                                id="service-details"
                                className="vendor-form-section-card"
                            >

                                <div className="form-section-heading">

                                    <div className="section-number">
                                        2
                                    </div>

                                    <div>

                                        <h2>
                                            Service Details
                                        </h2>

                                        <p>
                                            Tell customers more about
                                            your service and location.
                                        </p>

                                    </div>

                                </div>


                                <ServiceDetailsSection

                                    formData={
                                        formData
                                    }

                                    handleChange={
                                        handleChange
                                    }

                                />

                            </section>


                            {/* =================================
                                CATEGORY DETAILS
                            ================================= */}

                            <section
                                id="category-details"
                                className="vendor-form-section-card"
                            >

                                <div className="form-section-heading">

                                    <div className="section-number">
                                        3
                                    </div>

                                    <div>

                                        <h2>
                                            Category Specific Details
                                        </h2>

                                        <p>
                                            Add details specific to your
                                            selected service category.
                                        </p>

                                    </div>

                                </div>


                                <CategorySpecificSection
                                    category={
                                        formData.category
                                    }
                                    formData={
                                        formData
                                    }
                                    onDetailChange={
                                        handleDetailChange
                                    }
                                    amenities={
                                        formData.amenities
                                    }
                                    handleAmenityChange={
                                        handleAmenityChange
                                    }
                                    onCateringDetailsChange={
                                        handleCateringDetailsChange
                                    }
                                    onCateringMenuItemsChange={
                                        handleCateringMenuItemsChange
                                    }
                                    serviceId={id}
                                />

                            </section>


                            {/* =================================
                                IMAGES
                            ================================= */}

                            <section
                                id="service-media"
                                className="vendor-form-section-card"
                            >

                                <div className="form-section-heading">

                                    <div className="section-number">
                                        4
                                    </div>

                                    <div>

                                        <h2>
                                            Service Images & Videos
                                        </h2>

                                        <p>
                                            Add photos and videos that
                                            showcase your service.
                                        </p>

                                    </div>

                                </div>


                                <ImageUploader

                                    media={
                                        media
                                    }

                                    onChange={
                                        setMedia
                                    }

                                    onRemoveExisting={
                                        handleRemoveExistingMedia
                                    }

                                />

                            </section>


                            {/* =================================
                                CONTACT
                            ================================= */}

                            <section
                                id="contact-information"
                                className="vendor-form-section-card"
                            >

                                <div className="form-section-heading">

                                    <div className="section-number">
                                        5
                                    </div>

                                    <div>

                                        <h2>
                                            Contact Information
                                        </h2>

                                        <p>
                                            Customers will use these
                                            details to reach you.
                                        </p>

                                    </div>

                                </div>


                                <ContactSection

                                    formData={
                                        formData
                                    }

                                    handleChange={
                                        handleChange
                                    }

                                />

                            </section>


                            {/* =================================
                                VALIDATION SUMMARY
                            ================================= */}

                            {
                                errors.length > 0 && (

                                    <div className="vendor-form-validation">

                                        <strong>
                                            Please complete the following:
                                        </strong>


                                        <ul>

                                            {
                                                errors.map(
                                                    error => (

                                                        <li
                                                            key={error}
                                                        >
                                                            {error}
                                                        </li>

                                                    )
                                                )
                                            }

                                        </ul>

                                    </div>

                                )
                            }


                            {/* =================================
                                ACTIONS
                            ================================= */}

                            <div
                                id="review-publish"
                                className="vendor-form-actions-card"
                            >

                                <div>

                                    <strong>
                                        Ready to publish?
                                    </strong>

                                    <p>

                                        You can save this listing as
                                        a draft and continue later.

                                    </p>

                                </div>


                                <FormActions

                                    onSaveDraft={
                                        saveDraft
                                    }

                                    publishing={
                                        publishing
                                    }

                                    isEditMode={
                                        isEditMode
                                    }

                                />

                            </div>


                        </form>

                    </main>


                    {/* =====================================
                        RIGHT SIDEBAR
                    ===================================== */}

                    <aside className="vendor-form-sidebar">


                        <div className="vendor-sidebar-card">

                            <div className="vendor-sidebar-card-header">

                                <h3>
                                    Listing Progress
                                </h3>

                                <span>
                                    {progress}%
                                </span>

                            </div>


                            <div className="sidebar-progress-track">

                                <div
                                    className="sidebar-progress-value"
                                    style={{
                                        width: `${progress}%`
                                    }}
                                />

                            </div>


                            <p>
                                Complete all required sections
                                before publishing.
                            </p>

                        </div>


                        {/* =================================
                            QUICK NAVIGATION
                        ================================= */}

                        <div className="vendor-sidebar-card">

                            <h3>
                                Quick Navigation
                            </h3>


                            <nav className="vendor-form-navigation">

                                <button
                                    type="button"
                                    onClick={() =>
                                        scrollToSection(
                                            "basic-information"
                                        )
                                    }
                                >

                                    <span>
                                        01
                                    </span>

                                    Basic Information

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        scrollToSection(
                                            "service-details"
                                        )
                                    }
                                >

                                    <span>
                                        02
                                    </span>

                                    Service Details

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        scrollToSection(
                                            "category-details"
                                        )
                                    }
                                >

                                    <span>
                                        03
                                    </span>

                                    Category Details

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        scrollToSection(
                                            "service-media"
                                        )
                                    }
                                >

                                    <span>
                                        04
                                    </span>

                                    Images & Videos

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        scrollToSection(
                                            "contact-information"
                                        )
                                    }
                                >

                                    <span>
                                        05
                                    </span>

                                    Contact Information

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        scrollToSection(
                                            "review-publish"
                                        )
                                    }
                                >

                                    <span>
                                        06
                                    </span>

                                    Review & Publish

                                </button>

                            </nav>

                        </div>


                        {/* =================================
                            HELPFUL TIP
                        ================================= */}

                        <div className="vendor-sidebar-help">

                            <div className="help-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Need help?
                                </strong>

                                <p>
                                    Add clear descriptions and
                                    high-quality images to help
                                    customers understand your service.
                                </p>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>

        </section>

    );

};


export default AddService;