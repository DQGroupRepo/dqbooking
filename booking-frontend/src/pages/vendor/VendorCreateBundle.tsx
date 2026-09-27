import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import BundleService from "../../services/BundleService";

import VendorServiceService
    from "../../services/VendorServiceService";

import type {
    VendorService
} from "../../types/VendorService";

import type {
    Bundle
} from "../../types/Bundle";

import "./VendorCreateBundle.css";


const VendorCreateBundle = () => {


    /*
     * =========================================
     * ROUTER
     * =========================================
     */

    const navigate =
        useNavigate();


    const {
        bundleId
    } =
        useParams();


    /*
     * =========================================
     * MODE
     * =========================================
     */

    const isEditMode =
        Boolean(
            bundleId
        );


    /*
     * =========================================
     * STATE
     * =========================================
     */

    const [
        services,
        setServices
    ] =
        useState<
            VendorService[]
        >([]);


    const [
        selectedServiceIds,
        setSelectedServiceIds
    ] =
        useState<
            string[]
        >([]);


    const [
        name,
        setName
    ] =
        useState(
            ""
        );


    const [
        description,
        setDescription
    ] =
        useState(
            ""
        );


    const [
        discountType,
        setDiscountType
    ] =
        useState<
            "PERCENTAGE" |
            "FIXED"
        >(
            "PERCENTAGE"
        );


    const [
        discountValue,
        setDiscountValue
    ] =
        useState(
            ""
        );


    const [
        loading,
        setLoading
    ] =
        useState(
            true
        );


    const [
        saving,
        setSaving
    ] =
        useState(
            false
        );


    const [
        error,
        setError
    ] =
        useState(
            ""
        );


    /*
     * =========================================
     * LOAD PAGE DATA
     * =========================================
     *
     * Load:
     *
     * 1. Vendor services
     * 2. Existing bundle when editing
     *
     */

    useEffect(() => {


        const loadData =
            async () => {

                try {

                    setLoading(
                        true
                    );


                    setError(
                        ""
                    );


                    /*
                     * =================================
                     * LOAD VENDOR SERVICES
                     * =================================
                     */

                    const servicesData =
                        await VendorServiceService
                            .getServices();


                    setServices(
                        servicesData
                    );


                    /*
                     * =================================
                     * EDIT MODE
                     * =================================
                     */

                    if (
                        isEditMode &&
                        bundleId
                    ) {

                        const bundle =
                            await BundleService
                                .getBundle(
                                    bundleId
                                );


                        populateBundle(
                            bundle
                        );

                    }


                }
                catch (
                    err
                ) {

                    console.error(
                        "Failed to load bundle data:",
                        err
                    );


                    setError(
                        isEditMode
                            ? "Failed to load bundle details."
                            : "Failed to load your services."
                    );

                }
                finally {

                    setLoading(
                        false
                    );

                }

            };


        loadData();


    }, [

        bundleId,
        isEditMode

    ]);


    /*
     * =========================================
     * POPULATE EDIT FORM
     * =========================================
     */

    const populateBundle =
        (
            bundle: Bundle
        ) => {


            setName(
                bundle.name ??
                ""
            );


            setDescription(
                bundle.description ??
                ""
            );


            setDiscountType(
                bundle.discountType ??
                "PERCENTAGE"
            );


            setDiscountValue(

                bundle.discountValue !==
                undefined

                    ? String(
                        bundle.discountValue
                    )

                    : ""

            );


            /*
             * =====================================
             * SELECTED SERVICES
             * =====================================
             */

            setSelectedServiceIds(

                bundle.serviceIds ??
                []

            );

        };


    /*
     * =========================================
     * TOGGLE SERVICE
     * =========================================
     */

    const toggleService =
        (
            serviceId: string
        ) => {

            setSelectedServiceIds(

                current => {

                    if (
                        current.includes(
                            serviceId
                        )
                    ) {

                        return current.filter(

                            id =>
                                id !==
                                serviceId

                        );

                    }


                    return [

                        ...current,

                        serviceId

                    ];

                }

            );

        };


    /*
     * =========================================
     * SUBMIT
     * =========================================
     */

    const handleSubmit =
        async (
            event:
                React.FormEvent
        ) => {

            event.preventDefault();


            setError(
                ""
            );


            /*
             * =====================================
             * VALIDATION
             * =====================================
             */

            if (
                !name.trim()
            ) {

                setError(
                    "Bundle name is required."
                );

                return;

            }


            if (
                selectedServiceIds.length < 2
            ) {

                setError(
                    "A bundle must contain at least two services."
                );

                return;

            }


            const numericDiscount =
                Number(
                    discountValue
                );


            if (

                !Number.isFinite(
                    numericDiscount
                ) ||

                numericDiscount <= 0

            ) {

                setError(
                    "Enter a valid discount value."
                );

                return;

            }


            if (

                discountType ===
                "PERCENTAGE" &&

                numericDiscount > 100

            ) {

                setError(
                    "Percentage discount cannot exceed 100%."
                );

                return;

            }


            /*
             * =====================================
             * REQUEST
             * =====================================
             */

            const request = {

                name:
                    name.trim(),

                description:

                    description.trim() ||
                    undefined,

                serviceIds:
                    selectedServiceIds,

                discountType,

                discountValue:
                    numericDiscount

            };


            try {

                setSaving(
                    true
                );


                /*
                 * =================================
                 * UPDATE
                 * =================================
                 */

                if (
                    isEditMode &&
                    bundleId
                ) {

                    await BundleService
                        .updateBundle(

                            bundleId,

                            request

                        );

                }


                /*
                 * =================================
                 * CREATE
                 * =================================
                 */

                else {

                    await BundleService
                        .createBundle(
                            request
                        );

                }


                /*
                 * =================================
                 * BACK TO BUNDLES
                 * =================================
                 */

                navigate(
                    "/vendor/bundles"
                );


            }
            catch (
                err
            ) {

                console.error(

                    isEditMode

                        ? "Failed to update bundle:"

                        : "Failed to create bundle:",

                    err

                );


                setError(

                    isEditMode

                        ? "Failed to update bundle."

                        : "Failed to create bundle."

                );

            }
            finally {

                setSaving(
                    false
                );

            }

        };


    /*
     * =========================================
     * PAGE
     * =========================================
     */

    return (

        <div
            className=
                "vendor-create-bundle"
        >


            {/* =====================================
                HEADER
            ===================================== */}

            <div
                className=
                    "create-bundle-header"
            >

                <div>

                    <h1>

                        {
                            isEditMode

                                ? "Edit Bundle"

                                : "Create Bundle"
                        }

                    </h1>


                    <p>

                        {
                            isEditMode

                                ? "Update your bundle services and discount."

                                : "Combine two or more services and offer customers a discount."
                        }

                    </p>

                </div>

            </div>


            {/* =====================================
                ERROR
            ===================================== */}

            {
                error && (

                    <div
                        className=
                            "bundle-form-error"
                    >

                        {
                            error
                        }

                    </div>

                )
            }


            {/* =====================================
                FORM
            ===================================== */}

            <form

                className=
                    "bundle-form"

                onSubmit=
                    {handleSubmit}

            >


                {/* =================================
                    BUNDLE NAME
                ================================= */}

                <div
                    className=
                        "form-section"
                >

                    <label>

                        Bundle Name

                    </label>


                    <input

                        type="text"

                        value={
                            name
                        }

                        onChange={
                            event =>

                                setName(
                                    event.target.value
                                )
                        }

                        placeholder=
                            "Example: Wedding Complete Package"

                    />

                </div>


                {/* =================================
                    DESCRIPTION
                ================================= */}

                <div
                    className=
                        "form-section"
                >

                    <label>

                        Description

                    </label>


                    <textarea

                        value={
                            description
                        }

                        onChange={
                            event =>

                                setDescription(
                                    event.target.value
                                )
                        }

                        placeholder=
                            "Describe what this bundle offers..."

                        rows={4}

                    />

                </div>


                {/* =================================
                    SERVICES
                ================================= */}

                <div
                    className=
                        "form-section"
                >

                    <label>

                        Select Services

                    </label>


                    <p
                        className=
                            "form-help"
                    >

                        Select at least two services
                        to create a bundle.

                    </p>


                    {
                        loading

                            ? (

                                <div
                                    className=
                                        "services-loading"
                                >

                                    Loading services...

                                </div>

                            )

                            : services.length === 0

                                ? (

                                    <div
                                        className=
                                            "services-empty"
                                    >

                                        You don't have any services
                                        available for bundling.

                                    </div>

                                )

                                : (

                                    <div
                                        className=
                                            "service-selection-grid"
                                    >

                                        {
                                            services.map(

                                                service => {


                                                    const selected =

                                                        selectedServiceIds
                                                            .includes(
                                                                service.id
                                                            );


                                                    return (

                                                        <button

                                                            type="button"

                                                            key={
                                                                service.id
                                                            }

                                                            className={

                                                                selected

                                                                    ? "service-selection-card selected"

                                                                    : "service-selection-card"

                                                            }

                                                            onClick={
                                                                () =>

                                                                    toggleService(
                                                                        service.id
                                                                    )
                                                            }

                                                        >


                                                            <span
                                                                className=
                                                                    "service-check"
                                                            >

                                                                {
                                                                    selected

                                                                        ? "✓"

                                                                        : ""
                                                                }

                                                            </span>


                                                            <div>

                                                                <strong>

                                                                    {
                                                                        service.serviceName
                                                                    }

                                                                </strong>

                                                            </div>


                                                        </button>

                                                    );

                                                }

                                            )
                                        }

                                    </div>

                                )
                    }

                </div>


                {/* =================================
                    DISCOUNT TYPE
                ================================= */}

                <div
                    className=
                        "form-section"
                >

                    <label>

                        Discount Type

                    </label>


                    <select

                        value={
                            discountType
                        }

                        onChange={
                            event =>

                                setDiscountType(

                                    event.target.value as

                                        | "PERCENTAGE"
                                        | "FIXED"

                                )
                        }

                    >

                        <option
                            value=
                                "PERCENTAGE"
                        >

                            Percentage

                        </option>


                        <option
                            value=
                                "FIXED"
                        >

                            Fixed Amount

                        </option>

                    </select>

                </div>


                {/* =================================
                    DISCOUNT VALUE
                ================================= */}

                <div
                    className=
                        "form-section"
                >

                    <label>

                        Discount Value

                    </label>


                    <input

                        type="number"

                        min="0"

                        step="0.01"

                        value={
                            discountValue
                        }

                        onChange={
                            event =>

                                setDiscountValue(
                                    event.target.value
                                )
                        }

                        placeholder={

                            discountType ===
                            "PERCENTAGE"

                                ? "Example: 10"

                                : "Example: 5000"

                        }

                    />

                </div>


                {/* =================================
                    ACTIONS
                ================================= */}

                <div className="bundle-form-actions">


                    {/* =====================================
                        CANCEL
                    ===================================== */}

                    <button
                        type="button"
                        className="bundle-cancel-button"
                        onClick={() =>
                            navigate(
                                "/vendor/bundles"
                            )
                        }
                        disabled={saving}
                    >

                        Cancel

                    </button>


                    {/* =====================================
                        PRIMARY ACTION
                    ===================================== */}

                    <button
                        type="submit"
                        className="bundle-save-button"
                        disabled={
                            saving ||
                            loading ||
                            selectedServiceIds.length < 2
                        }
                    >

                        {
                            saving

                                ? (

                                    isEditMode

                                        ? "Updating Bundle..."

                                        : "Creating Bundle..."

                                )

                                : (

                                    isEditMode

                                        ? "Update Bundle"

                                        : "Create Bundle"

                                )
                        }

                    </button>


                </div>


            </form>


        </div>

    );

};


export default VendorCreateBundle;