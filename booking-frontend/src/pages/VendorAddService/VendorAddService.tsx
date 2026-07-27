import {

    useEffect,

    useState

} from "react";

import {

    useNavigate,

    useParams

} from "react-router-dom";

import "./VendorAddService.css";

import type {

    VendorServiceForm

} from "../../types/VendorServiceForm";

import VendorServiceMapper

    from "../../mapper/VendorServiceMapper";

import BasicInfoSection

    from "../../components/vendor/listing/BasicInfoSection/BasicInfoSection";

import AmenitiesSection

    from "../../components/vendor/listing/AmenitiesSection/AmenitiesSection";

import ImageUploader

    from "../../components/common/imageUpload/ImageUploader";

import UploadService

    from "../../services/UploadService";

import ContactSection

    from "../../components/vendor/listing/ContactSection/ContactSection";

import AvailabilitySection

    from "../../components/vendor/listing/AvailabilitySection/AvailabilitySection";

import BookingSettingsSection

    from "../../components/vendor/listing/BookingSettingsSection/BookingSettingsSection";

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


    const isEditMode = !!id;


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
     *
     * Existing + New
     * In exact display order.
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



    const amenityList = [

        "AC Hall",

        "Parking",

        "Dining Area",

        "Stage",

        "Generator Backup",

        "Catering Available"

    ];



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



    const loadService = async () => {


        if (!id) {

            return;

        }


        try {


            const service =

                await VendorServiceService

                    .getServiceById(

                        id

                    );



            setFormData(

                VendorServiceMapper

                    .responseToForm(

                        service

                    )

            );



            /*
             * Convert DB URLs into
             * unified media objects.
             *
             * The order returned by
             * backend is preserved.
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

                            `existing-${

                                index

                            }-${

                                url

                            }`,

                        kind: "existing",

                        url

                    })

                );


            setMedia(

                existingMedia

            );


        }

        catch (error) {


            console.error(

                error

            );


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


        setFormData({

            ...formData,

            [e.target.name]:

                e.target.type ===

                "checkbox"

                    ?

                    (

                        e.target as

                        HTMLInputElement

                    ).checked

                    :

                    e.target.value

        });

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

            prev => ({

                ...prev,

                amenities:

                    prev.amenities.includes(

                        item

                    )

                        ?

                        prev.amenities.filter(

                            amenity =>

                                amenity !==

                                item

                        )

                        :

                        [

                            ...prev.amenities,

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


        if (!formData.price) {

            validationErrors.push(

                "Price"

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
     *
     * IMPORTANT:
     *
     * This only removes the media
     * from React state.
     *
     * MongoDB is NOT changed here.
     *
     * The database is changed only
     * after Update is clicked.
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


        try {


            /*
             * =================================
             * Step 1
             *
             * Find all new files.
             * =================================
             */

            const newMediaItems =

                media.filter(

                    item =>

                        item.kind ===

                        "new"

                );



            /*
             * =================================
             * Step 2
             *
             * Upload all new files.
             *
             * UploadService returns URLs
             * in the same order as files.
             * =================================
             */

            const uploadedUrls:

                string[] =

                newMediaItems.length >

                0

                    ?

                    await UploadService

                        .uploadImages(

                            newMediaItems.map(

                                item =>

                                    item.kind ===

                                    "new"

                                        ?

                                        item.file

                                        :

                                        new File(

                                            [],

                                            ""

                                        )

                            )

                        )

                    :

                    [];



            /*
             * =================================
             * Step 3
             *
             * Replace each new File
             * with its uploaded URL.
             *
             * IMPORTANT:
             *
             * We iterate through the
             * ORIGINAL media order.
             *
             * Therefore the final
             * imageUrls order exactly
             * matches the user's drag order.
             * =================================
             */

            let uploadedIndex = 0;


            const finalImageUrls:

                string[] =

                media.map(

                    item => {


                        /*
                         * Existing media.
                         */

                        if (

                            item.kind ===

                            "existing"

                        ) {

                            return item.url;

                        }



                        /*
                         * New uploaded media.
                         */

                        const uploadedUrl =

                            uploadedUrls[

                                uploadedIndex

                            ];


                        uploadedIndex++;


                        return uploadedUrl;

                    }

                );



            /*
             * =================================
             * Step 4
             *
             * Convert form into request.
             * =================================
             */

            const request =

                VendorServiceMapper

                    .formToRequest(

                        formData

                    );



            /*
             * =================================
             * Step 5
             *
             * Send FINAL ordered media list.
             * =================================
             */

            request.imageUrls =

                finalImageUrls;



            /*
             * =================================
             * UPDATE
             * =================================
             */

            if (isEditMode) {


                await VendorServiceService

                    .updateService(

                        id!,

                        request

                    );


                toast.success(

                    "Service updated successfully."

                );

            }



            /*
             * =================================
             * CREATE
             * =================================
             */

            else {


                await VendorServiceService

                    .createService(

                        request

                    );


                toast.success(

                    "Listing published successfully 🎉"

                );

            }



            /*
             * Redirect.
             */

            navigate(

                "/vendor/manage-services"

            );

        }

        catch (error) {


            console.error(

                error

            );


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

                            ?

                            item.file

                            :

                            new File(

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


        setTimeout(

            () =>

                setSaved(

                    false

                ),

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

                        {

                            isEditMode

                                ?

                                "Edit Service"

                                :

                                "Add New Service"

                        }

                    </h1>



                    <p>

                        {

                            isEditMode

                                ?

                                "Update your listing details."

                                :

                                "Create a new listing that customers can discover and book."

                        }

                    </p>



                    <FormProgress

                        progress={

                            progress

                        }

                    />



                    <form

                        onSubmit={

                            handleSubmit

                        }

                    >


                        <BasicInfoSection

                            formData={

                                formData

                            }

                            handleChange={

                                handleChange

                            }

                        />



                        <CategorySpecificSection

                            category={

                                formData.category

                            }

                            formData={

                                formData

                            }

                            handleChange={

                                handleChange

                            }

                        />



                        <AmenitiesSection

                            amenities={

                                formData.amenities

                            }

                            amenityList={

                                amenityList

                            }

                            handleAmenityChange={

                                handleAmenityChange

                            }

                        />



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



                        <ContactSection

                            formData={

                                formData

                            }

                            handleChange={

                                handleChange

                            }

                        />



                        <AvailabilitySection

                            formData={

                                formData

                            }

                            handleChange={

                                handleChange

                            }

                        />



                        <BookingSettingsSection

                            formData={

                                formData

                            }

                            handleChange={

                                handleChange

                            }

                        />



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


                    </form>


                </div>


            </div>


        </section>

    );

};


export default AddService;