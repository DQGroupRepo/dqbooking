import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import type {
    ServicePackage
} from "../../../types/ServicePackage";

import VendorPricingService
    from "../../../services/VendorPricingService";

import VendorServiceService
    from "../../../services/VendorServiceService";

import toast
    from "react-hot-toast";

import type {
    VendorServicePricing,
    VendorPricingHead,
    VendorDiscount,
    RefundRule
} from "../../../types/VendorPricing";

import "./VendorPricing.css";


/*
 * =========================================================
 * EMPTY PRICING
 * =========================================================
 *
 * No cancellation/refund rules are predefined.
 *
 * The vendor creates their own rules.
 */

 const emptyCancellationPolicy = {
     processingDays: 0,
     refundRules: []
 };

const emptyPricing:
    VendorServicePricing = {

    serviceId: "",

    effectiveFrom: "",

    effectiveUntil: "",

    baseAmount: 0,

    pricingHeads: [],

    discounts: [],

    paymentConfiguration: {

        advancePaymentType:
            "PERCENTAGE",

        advancePaymentValue:
            null,

        payAfterConfirmation:
            true,

        discussWithVendor:
            true

    },

    cancellationPolicy: {

        processingDays: 0,

        refundRules: []

    }

};




/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const VendorPricing = () => {

    const {
        serviceId
    } = useParams();


    const navigate =
        useNavigate();


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        pricing,
        setPricing
    ] =
        useState<VendorServicePricing>(
            emptyPricing
        );


    const [
        packages,
        setPackages
    ] =
        useState<ServicePackage[]>([]);


    /*
     * =========================================================
     * LOAD PRICING + PACKAGES
     * =========================================================
     */

    useEffect(() => {

        if (!serviceId) {

            return;

        }


        loadPricing();

    }, [
        serviceId
    ]);


    async function loadPricing() {

        try {

            setLoading(
                true
            );


            /*
             * Load pricing configuration.
             */

            const response =
                await VendorPricingService
                    .getPricing(
                        serviceId!
                    );


            if (response) {

                setPricing({

                    ...emptyPricing,

                    ...response,


                    paymentConfiguration: {

                        ...emptyPricing.paymentConfiguration,

                        ...response.paymentConfiguration,

                        advancePaymentType:

                            response.paymentConfiguration
                                ?.advancePaymentType ??

                            "PERCENTAGE",


                        advancePaymentValue:

                            response.paymentConfiguration
                                ?.advancePaymentValue ??

                            null

                    },


                    cancellationPolicy: {

                        ...emptyCancellationPolicy,

                        ...response.cancellationPolicy,

                        refundRules:

                            response
                                .cancellationPolicy
                                ?.refundRules ??

                            []

                    }

                });

            }


            /*
             * Load packages from service.
             */

            const service =
                await VendorServiceService
                    .getServiceById(
                        serviceId!
                    );


            setPackages(
                service.packages ?? []
            );

        }
        catch (error) {

            console.error(
                "Failed to load pricing:",
                error
            );


            setPricing({

                ...emptyPricing,

                serviceId:
                    serviceId!

            });


            setPackages(
                []
            );

        }
        finally {

            setLoading(
                false
            );

        }

    }


    /*
     * =========================================================
     * SORTED PACKAGES
     * =========================================================
     *
     * Important:
     *
     * Never mutate the packages state with .sort().
     */

    const sortedPackages = [...packages];


    /*
     * =========================================================
     * BASE PRICING
     * =========================================================
     */

    function updateBaseAmount(
        value: string
    ) {

        setPricing(
            previous => ({

                ...previous,

                baseAmount:
                    Number(value)

            })
        );

    }


    function updateEffectiveFrom(
        value: string
    ) {

        setPricing(
            previous => ({

                ...previous,

                effectiveFrom:
                    value

            })
        );

    }


    function updateEffectiveUntil(
        value: string
    ) {

        setPricing(
            previous => ({

                ...previous,

                effectiveUntil:
                    value

            })
        );

    }


    /*
     * =========================================================
     * PAYMENT CONFIGURATION
     * =========================================================
     */

    function updateAdvancePaymentType(
        type:
            | "PERCENTAGE"
            | "FIXED_AMOUNT"
    ) {

        setPricing(
            current => ({

                ...current,

                paymentConfiguration: {

                    ...current.paymentConfiguration,

                    advancePaymentType:
                        type

                }

            })
        );

    }

    function updateAdvancePaymentValue(
        value: string
    ) {

        const numericValue =

            value === ""

                ? null

                : Number(value);


        setPricing(
            current => ({

                ...current,

                paymentConfiguration: {

                    ...current.paymentConfiguration,

                    advancePaymentValue:
                        numericValue

                }

            })
        );

    }


    /*
     * =========================================================
     * PRICING HEADS
     * =========================================================
     */

    function addPricingHead() {

        const head:
            VendorPricingHead = {

            code: "",

            name: "",

            calculationType:
                "FIXED",

            value: 0,

            displayOrder:
                pricing
                    .pricingHeads
                    .length + 1,

            active: true

        };


        setPricing(
            previous => ({

                ...previous,

                pricingHeads: [

                    ...previous
                        .pricingHeads,

                    head

                ]

            })
        );

    }


    function updatePricingHead(

        index: number,

        field:
            keyof VendorPricingHead,

        value: any

    ) {

        setPricing(
            previous => {

                const updated =
                    [
                        ...previous
                            .pricingHeads
                    ];


                updated[index] = {

                    ...updated[index],

                    [field]:
                        value

                };


                return {

                    ...previous,

                    pricingHeads:
                        updated

                };

            }
        );

    }


    function removePricingHead(
        index: number
    ) {

        setPricing(
            previous => ({

                ...previous,

                pricingHeads:
                    previous
                        .pricingHeads
                        .filter(
                            (
                                _,
                                i
                            ) =>
                                i !== index
                        )

            })
        );

    }


    /*
     * =========================================================
     * DISCOUNTS
     * =========================================================
     */

    function addDiscount() {

        const discount:
            VendorDiscount = {

            name: "",

            discountType:
                "FIXED",

            value: 0,

            active: true

        };


        setPricing(
            previous => ({

                ...previous,

                discounts: [

                    ...previous
                        .discounts,

                    discount

                ]

            })
        );

    }


    function updateDiscount(

        index: number,

        field:
            keyof VendorDiscount,

        value: any

    ) {

        setPricing(
            previous => {

                const updated =
                    [
                        ...previous
                            .discounts
                    ];


                updated[index] = {

                    ...updated[index],

                    [field]:
                        value

                };


                return {

                    ...previous,

                    discounts:
                        updated

                };

            }
        );

    }


    function removeDiscount(
        index: number
    ) {

        setPricing(
            previous => ({

                ...previous,

                discounts:
                    previous
                        .discounts
                        .filter(
                            (
                                _,
                                i
                            ) =>
                                i !== index
                        )

            })
        );

    }


    /*
     * =========================================================
     * PACKAGE
     * =========================================================
     */

    function createPackageId(): string {

        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return `package-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
    }


    function addPackage() {

        const newPackage: ServicePackage = {

            id: createPackageId(),

            name: "",

            price: 0,

            features: [],

            active: true

        };


        setPackages(
            previous => [
                ...previous,
                newPackage
            ]
        );

    }


    /*
     * =========================================================
     * TOGGLE PACKAGE
     * =========================================================
     */

    function togglePackage(
        packageId: string
    ) {

        setPackages(
            previous =>
                previous.map(
                    pkg =>
                        pkg.id === packageId
                            ? {
                                ...pkg,
                                active: !pkg.active
                            }
                            : pkg
                )
        );

    }


    /*
     * =========================================================
     * UPDATE PACKAGE
     * =========================================================
     */

    function updatePackage(
        packageId: string,
        field: keyof ServicePackage,
        value: string | number | boolean
    ) {

        setPackages(
            previous =>
                previous.map(
                    pkg =>
                        pkg.id === packageId
                            ? {
                                ...pkg,
                                [field]: value
                            }
                            : pkg
                )
        );

    }


    /*
     * =========================================================
     * REMOVE PACKAGE
     * =========================================================
     */

    function removePackage(
        packageId: string
    ) {

        setPackages(
            previous =>
                previous.filter(
                    pkg =>
                        pkg.id !== packageId
                )
        );

    }


    /*
     * =========================================================
     * ADD FEATURE
     * =========================================================
     */

    function addFeature(
        packageId: string
    ) {

        setPackages(
            previous =>
                previous.map(
                    pkg =>
                        pkg.id === packageId
                            ? {
                                ...pkg,
                                features: [
                                    ...pkg.features,
                                    ""
                                ]
                            }
                            : pkg
                )
        );

    }


    /*
     * =========================================================
     * UPDATE FEATURE
     * =========================================================
     */

    function updateFeature(
        packageId: string,
        featureIndex: number,
        value: string
    ) {

        setPackages(
            previous =>
                previous.map(
                    pkg => {

                        if (
                            pkg.id !== packageId
                        ) {
                            return pkg;
                        }


                        const features = [
                            ...pkg.features
                        ];


                        features[
                            featureIndex
                        ] = value;


                        return {
                            ...pkg,
                            features
                        };

                    }
                )
        );

    }


    /*
     * =========================================================
     * REMOVE FEATURE
     * =========================================================
     */

    function removeFeature(
        packageId: string,
        featureIndex: number
    ) {

        setPackages(
            previous =>
                previous.map(
                    pkg => {

                        if (
                            pkg.id !== packageId
                        ) {
                            return pkg;
                        }


                        return {
                            ...pkg,

                            features:
                                pkg.features.filter(
                                    (
                                        _,
                                        index
                                    ) =>
                                        index !== featureIndex
                                )
                        };

                    }
                )
        );

    }


    /*
     * =========================================================
     * CANCELLATION POLICY
     * =========================================================
     */

    function updateProcessingDays(
        value: string
    ) {

        setPricing(
            previous => ({

                ...previous,

                cancellationPolicy: {

                    processingDays:
                        Number(value),

                    refundRules:
                        previous
                            .cancellationPolicy
                            ?.refundRules ?? []

                }

            })
        );

    }


    /*
     * =========================================================
     * ADD REFUND RULE
     * =========================================================
     *
     * No business assumptions are made.
     *
     * Vendor defines the rule.
     *
     * maxDaysBeforeEvent = null means:
     *
     *     No upper limit
     *
     * Example:
     *
     *     31+ days
     *
     */

    function addRefundRule() {

        const newRule: RefundRule = {

            minDaysBeforeEvent: 0,

            maxDaysBeforeEvent: null,

            refundPercentage: 0

        };


        setPricing(
            previous => ({

                ...previous,

                cancellationPolicy: {

                    processingDays:
                        previous
                            .cancellationPolicy
                            ?.processingDays ?? 0,

                    refundRules: [

                        ...(
                            previous
                                .cancellationPolicy
                                ?.refundRules ?? []
                        ),

                        newRule

                    ]

                }

            })
        );

    }


    /*
     * =========================================================
     * UPDATE REFUND RULE
     * =========================================================
     */

    function updateRefundRule(

        index: number,

        field: keyof RefundRule,

        value: number | null

    ) {

        setPricing(
            previous => {

                const updatedRules = [
                    ...(
                        previous
                            .cancellationPolicy
                            ?.refundRules ?? []
                    )
                ];


                updatedRules[index] = {

                    ...updatedRules[index],

                    [field]:
                        value

                };


                return {

                    ...previous,

                    cancellationPolicy: {

                        processingDays:
                            previous
                                .cancellationPolicy
                                ?.processingDays ?? 0,

                        refundRules:
                            updatedRules

                    }

                };

            }
        );

    }


    /*
     * =========================================================
     * REMOVE REFUND RULE
     * =========================================================
     */

    function removeRefundRule(
        index: number
    ) {

        setPricing(
            previous => ({

                ...previous,

                cancellationPolicy: {

                    processingDays:
                        previous
                            .cancellationPolicy
                            ?.processingDays ?? 0,

                    refundRules:
                        (
                            previous
                                .cancellationPolicy
                                ?.refundRules ?? []
                        ).filter(
                            (
                                _,
                                ruleIndex
                            ) =>
                                ruleIndex !== index
                        )

                }

            })
        );

    }


    /*
     * =========================================================
     * VALIDATE CANCELLATION RULES
     * =========================================================
     */

    function validateRefundRules():
        boolean {

        const rules =
            pricing
                .cancellationPolicy
                ?.refundRules ?? [];


        for (
            let index = 0;
            index < rules.length;
            index++
        ) {

            const rule =
                rules[index];


            if (
                rule.minDaysBeforeEvent <
                0
            ) {

                toast.error(
                    `Refund Rule ${index + 1}: From Days cannot be negative.`
                );

                return false;

            }


            if (
                rule.maxDaysBeforeEvent !==
                    null &&
                rule.maxDaysBeforeEvent <
                    rule.minDaysBeforeEvent
            ) {

                toast.error(
                    `Refund Rule ${index + 1}: To Days must be greater than or equal to From Days.`
                );

                return false;

            }


            if (
                rule.refundPercentage < 0 ||
                rule.refundPercentage > 100
            ) {

                toast.error(
                    `Refund Rule ${index + 1}: Refund percentage must be between 0 and 100.`
                );

                return false;

            }

        }


        return true;

    }


    /*
     * =========================================================
     * SAVE
     * =========================================================
     */

    async function save() {

        if (!serviceId) {

            return;

        }


        /*
         * Validate base price.
         */

        if (
            !pricing.baseAmount ||
            pricing.baseAmount <= 0
        ) {

            toast.error(
                "Enter a valid base amount."
            );

            return;

        }


        /*
         * Validate effective date.
         */

        if (
            !pricing.effectiveFrom
        ) {

            toast.error(
                "Select Effective From date."
            );

            return;

        }


        /*
         * Validate active packages.
         */

        const activePackages =
            packages.filter(
                pkg =>
                    pkg.active
            );


        for (
            const pkg
            of activePackages
        ) {

            if (
                !pkg.name ||
                !pkg.name.trim()
            ) {

                toast.error(
                    "Enter a package name for every active package."
                );

                return;
            }


            if (
                !pkg.price ||
                pkg.price <= 0
            ) {

                toast.error(
                    `Enter a valid price for the "${pkg.name}" package.`
                );

                return;
            }

        }


        /*
         * Validate refund rules.
         */

        if (
            !validateRefundRules()
        ) {

            return;

        }
        const paymentConfiguration =
            pricing.paymentConfiguration;


        if (
            paymentConfiguration?.advancePaymentType ===
            "PERCENTAGE"
        ) {

            const advanceValue =
                paymentConfiguration.advancePaymentValue;


            if (
                advanceValue !== null &&
                (
                    advanceValue < 0 ||
                    advanceValue > 100
                )
            ) {

                toast.error(
                    "Advance payment percentage must be between 0 and 100."
                );

                return;

            }

        }


        if (
            paymentConfiguration?.advancePaymentType ===
            "FIXED_AMOUNT"
        ) {

            const advanceValue =
                paymentConfiguration.advancePaymentValue;


            if (
                advanceValue !== null &&
                advanceValue < 0
            ) {

                toast.error(
                    "Advance payment amount cannot be negative."
                );

                return;

            }

        }


        try {

            setSaving(
                true
            );


            /*
             * =========================================
             * SAVE PACKAGES
             * =========================================
             */

            await VendorServiceService
                .updatePackages(
                    serviceId,
                    packages
                );


            /*
             * =========================================
             * SAVE PRICING
             * =========================================
             */

            await VendorPricingService
                .savePricing({

                    ...pricing,

                    serviceId

                });


            toast.success(
                "Pricing and packages saved successfully."
            );


            navigate(
                "/vendor/manage-services"
            );

        }
        catch (error) {

            console.error(
                "Failed to save pricing/packages:",
                error
            );


            toast.error(
                "Unable to save pricing and packages."
            );

        }
        finally {

            setSaving(
                false
            );

        }

    }


    /*
     * =========================================================
     * ACTIVE PACKAGE COUNT
     * =========================================================
     */

    const activePackageCount =
        packages.filter(
            pkg =>
                pkg.active
        ).length;


    /*
     * =========================================================
     * LOADING
     * =========================================================
     */

    if (loading) {

        return (

            <div className="vendor-pricing-loading">

                Loading Pricing...

            </div>

        );

    }


    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (

        <div className="vendor-pricing-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="pricing-header">

                <div>

                    <h2>
                        Pricing Configuration
                    </h2>

                    <p>
                        Configure pricing, discounts and payment settings.
                    </p>

                </div>


                <div className="header-actions">

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        className="save-btn"
                        onClick={save}
                        disabled={saving}
                    >

                        {
                            saving
                                ? "Saving..."
                                : "Save Pricing"
                        }

                    </button>

                </div>

            </div>


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="pricing-grid">


                {/* =================================================
                    LEFT
                ================================================= */}

                <div className="pricing-left">


                    {/* =================================================
                        SERVICE PACKAGES
                    ================================================= */}

                    <section className="pricing-card package-card-section">

                        <div className="package-section-header">

                            <div>

                                <h3>
                                    Service Packages
                                </h3>

                                <p>
                                    Create your own packages with custom names,
                                    prices and features.
                                </p>

                            </div>


                            <div className="package-header-actions">

                                <div className="package-count">

                                    {
                                        activePackageCount
                                    }

                                    {" "}

                                    {
                                        activePackageCount === 1
                                            ? "active"
                                            : "active packages"
                                    }

                                </div>


                                <button
                                    type="button"
                                    className="add-package-btn"
                                    onClick={addPackage}
                                >
                                    + Create Package
                                </button>

                            </div>

                        </div>


                        {
                            sortedPackages.length === 0 ? (

                                <div className="packages-empty-state">

                                    <div className="packages-empty-icon">
                                        +
                                    </div>

                                    <h4>
                                        No Packages Created
                                    </h4>

                                    <p>
                                        Create a package to offer customers
                                        different pricing options.
                                    </p>

                                    <button
                                        type="button"
                                        className="add-package-btn"
                                        onClick={addPackage}
                                    >
                                        + Create Your First Package
                                    </button>

                                </div>

                            ) : (

                                <div className="package-editor-grid">

                                    {
                                        sortedPackages.map(
                                            (
                                                pkg,
                                                index
                                            ) => {

                                                const packageId =
                                                    pkg.id ??
                                                    `package-${index}`;


                                                return (

                                                    <div
                                                        key={packageId}
                                                        className={
                                                            `service-package-card ${
                                                                pkg.active
                                                                    ? "active"
                                                                    : "inactive"
                                                            }`
                                                        }
                                                    >

                                                        {/* =========================
                                                            PACKAGE HEADER
                                                        ========================= */}

                                                        <div className="package-card-header">

                                                            <div className="package-card-title-area">

                                                                <label className="package-toggle">

                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            pkg.active
                                                                        }
                                                                        onChange={() =>
                                                                            togglePackage(
                                                                                packageId
                                                                            )
                                                                        }
                                                                    />

                                                                    <span className="package-checkmark" />

                                                                </label>


                                                                <div>

                                                                    <span className="package-number">
                                                                        Package {index + 1}
                                                                    </span>

                                                                    <h4>
                                                                        {
                                                                            pkg.name.trim()
                                                                                ? pkg.name
                                                                                : "Untitled Package"
                                                                        }
                                                                    </h4>

                                                                    <span>
                                                                        {
                                                                            pkg.active
                                                                                ? "Active Package"
                                                                                : "Inactive Package"
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </div>


                                                        {/* =========================
                                                            ACTIVE PACKAGE
                                                        ========================= */}

                                                        {
                                                            pkg.active ? (

                                                                <>

                                                                    {/* =========================
                                                                        PACKAGE NAME
                                                                    ========================= */}

                                                                    <div className="package-price-field">

                                                                        <label>
                                                                            Package Name
                                                                        </label>

                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                pkg.name
                                                                            }
                                                                            placeholder="e.g. Premium Wedding Package"
                                                                            onChange={e =>
                                                                                updatePackage(
                                                                                    packageId,
                                                                                    "name",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />

                                                                    </div>


                                                                    {/* =========================
                                                                        PRICE
                                                                    ========================= */}

                                                                    <div className="package-price-field">

                                                                        <label>
                                                                            Package Price
                                                                        </label>

                                                                        <div className="package-price-input">

                                                                            <span>
                                                                                ₹
                                                                            </span>

                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={
                                                                                    pkg.price
                                                                                }
                                                                                onChange={e =>
                                                                                    updatePackage(
                                                                                        packageId,
                                                                                        "price",
                                                                                        Number(
                                                                                            e.target.value
                                                                                        )
                                                                                    )
                                                                                }
                                                                            />

                                                                        </div>

                                                                    </div>


                                                                    {/* =========================
                                                                        FEATURES
                                                                    ========================= */}

                                                                    <div className="package-features-section">

                                                                        <div className="package-features-header">

                                                                            <h5>
                                                                                Features
                                                                            </h5>


                                                                            <button
                                                                                type="button"
                                                                                className="add-feature-btn"
                                                                                onClick={() =>
                                                                                    addFeature(
                                                                                        packageId
                                                                                    )
                                                                                }
                                                                            >
                                                                                + Add Feature
                                                                            </button>

                                                                        </div>


                                                                        <div className="package-feature-list">

                                                                            {
                                                                                pkg.features.map(
                                                                                    (
                                                                                        feature,
                                                                                        featureIndex
                                                                                    ) => (

                                                                                        <div
                                                                                            key={
                                                                                                featureIndex
                                                                                            }
                                                                                            className="package-feature-item"
                                                                                        >

                                                                                            <input
                                                                                                type="text"
                                                                                                value={
                                                                                                    feature
                                                                                                }
                                                                                                placeholder="Enter feature"
                                                                                                onChange={e =>
                                                                                                    updateFeature(
                                                                                                        packageId,
                                                                                                        featureIndex,
                                                                                                        e.target.value
                                                                                                    )
                                                                                                }
                                                                                            />


                                                                                            <button
                                                                                                type="button"
                                                                                                className="remove-feature-btn"
                                                                                                onClick={() =>
                                                                                                    removeFeature(
                                                                                                        packageId,
                                                                                                        featureIndex
                                                                                                    )
                                                                                                }
                                                                                                aria-label="Remove feature"
                                                                                            >
                                                                                                ×
                                                                                            </button>

                                                                                        </div>

                                                                                    )
                                                                                )
                                                                            }


                                                                            {
                                                                                pkg.features.length ===
                                                                                0 && (

                                                                                    <div className="no-features">

                                                                                        No features added yet.

                                                                                    </div>

                                                                                )
                                                                            }

                                                                        </div>

                                                                    </div>


                                                                    {/* =========================
                                                                        REMOVE PACKAGE
                                                                    ========================= */}

                                                                    <div className="package-card-footer">

                                                                        <button
                                                                            type="button"
                                                                            className="remove-package-btn"
                                                                            onClick={() =>
                                                                                removePackage(
                                                                                    packageId
                                                                                )
                                                                            }
                                                                        >
                                                                            🗑 Remove Package
                                                                        </button>

                                                                    </div>

                                                                </>

                                                            ) : (

                                                                /* =========================
                                                                   INACTIVE PACKAGE
                                                                ========================= */

                                                                <div className="inactive-package-content">

                                                                    <div className="inactive-package-icon">
                                                                        +
                                                                    </div>


                                                                    <p>
                                                                        Enable this package
                                                                        to configure its
                                                                        price and features.
                                                                    </p>


                                                                    <button
                                                                        type="button"
                                                                        className="enable-package-btn"
                                                                        onClick={() =>
                                                                            togglePackage(
                                                                                packageId
                                                                            )
                                                                        }
                                                                    >
                                                                        Enable Package
                                                                    </button>

                                                                </div>

                                                            )
                                                        }

                                                    </div>

                                                );

                                            }
                                        )
                                    }

                                </div>

                            )
                        }


                        <div className="package-info-banner">

                            <span className="package-info-icon">
                                ⓘ
                            </span>


                            <div>

                                <strong>
                                    Package Configuration
                                </strong>

                                <p>
                                    Create as many packages as your service
                                    requires. Customers will see only the
                                    packages you mark as active.
                                </p>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        BASE PRICING
                    ================================================= */}

                    <section className="pricing-card">

                        <h3>
                            Base Pricing
                        </h3>


                        <div className="form-grid">

                            <div className="form-group">

                                <label>
                                    Base Amount
                                </label>


                                <input

                                    type="number"

                                    min="0"

                                    value={
                                        pricing.baseAmount
                                    }

                                    onChange={e =>
                                        updateBaseAmount(
                                            e.target.value
                                        )
                                    }

                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Effective From
                                </label>


                                <input

                                    type="date"

                                    value={
                                        pricing.effectiveFrom ??
                                        ""
                                    }

                                    onChange={e =>
                                        updateEffectiveFrom(
                                            e.target.value
                                        )
                                    }

                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Effective Until
                                </label>


                                <input

                                    type="date"

                                    value={
                                        pricing.effectiveUntil ??
                                        ""
                                    }

                                    onChange={e =>
                                        updateEffectiveUntil(
                                            e.target.value
                                        )
                                    }

                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        PRICING HEADS
                    ================================================= */}

                    <section className="pricing-card">

                        <div className="section-header">

                            <h3>
                                Pricing Heads
                            </h3>


                            <button
                                type="button"
                                onClick={
                                    addPricingHead
                                }
                            >
                                + Add
                            </button>

                        </div>


                        {
                            pricing.pricingHeads.length ===
                            0 ? (

                                <div className="empty-pricing-state">

                                    No pricing heads configured.

                                </div>

                            ) : (

                                pricing.pricingHeads.map(
                                    (
                                        head,
                                        index
                                    ) => (

                                        <div

                                            className="pricing-row"

                                            key={
                                                index
                                            }

                                        >

                                            <input

                                                placeholder="Code"

                                                value={
                                                    head.code
                                                }

                                                onChange={e =>
                                                    updatePricingHead(
                                                        index,
                                                        "code",
                                                        e.target.value
                                                    )
                                                }

                                            />


                                            <input

                                                placeholder="Name"

                                                value={
                                                    head.name
                                                }

                                                onChange={e =>
                                                    updatePricingHead(
                                                        index,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }

                                            />


                                            <select

                                                value={
                                                    head.calculationType
                                                }

                                                onChange={e =>
                                                    updatePricingHead(
                                                        index,
                                                        "calculationType",
                                                        e.target.value
                                                    )
                                                }

                                            >

                                                <option value="FIXED">
                                                    Fixed
                                                </option>

                                                <option value="PERCENTAGE">
                                                    Percentage
                                                </option>

                                            </select>


                                            <input

                                                type="number"

                                                value={
                                                    head.value
                                                }

                                                onChange={e =>
                                                    updatePricingHead(
                                                        index,
                                                        "value",
                                                        Number(
                                                            e.target.value
                                                        )
                                                    )
                                                }

                                            />


                                            <button

                                                type="button"

                                                className="delete-btn"

                                                onClick={() =>
                                                    removePricingHead(
                                                        index
                                                    )
                                                }

                                            >

                                                Remove

                                            </button>

                                        </div>

                                    )
                                )

                            )
                        }

                    </section>


                    {/* =================================================
                        DISCOUNTS
                    ================================================= */}

                    <section className="pricing-card">

                        <div className="section-header">

                            <h3>
                                Discounts
                            </h3>


                            <button
                                type="button"
                                onClick={
                                    addDiscount
                                }
                            >
                                + Add
                            </button>

                        </div>


                        {
                            pricing.discounts.length ===
                            0 ? (

                                <div className="empty-pricing-state">

                                    No discounts configured.

                                </div>

                            ) : (

                                pricing.discounts.map(
                                    (
                                        discount,
                                        index
                                    ) => (

                                        <div

                                            className="pricing-row"

                                            key={
                                                index
                                            }

                                        >

                                            <input

                                                placeholder="Discount Name"

                                                value={
                                                    discount.name
                                                }

                                                onChange={e =>
                                                    updateDiscount(
                                                        index,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }

                                            />


                                            <select

                                                value={
                                                    discount.discountType
                                                }

                                                onChange={e =>
                                                    updateDiscount(
                                                        index,
                                                        "discountType",
                                                        e.target.value
                                                    )
                                                }

                                            >

                                                <option value="FIXED">
                                                    Fixed
                                                </option>

                                                <option value="PERCENTAGE">
                                                    Percentage
                                                </option>

                                            </select>


                                            <input

                                                type="number"

                                                value={
                                                    discount.value
                                                }

                                                onChange={e =>
                                                    updateDiscount(
                                                        index,
                                                        "value",
                                                        Number(
                                                            e.target.value
                                                        )
                                                    )
                                                }

                                            />


                                            <button

                                                type="button"

                                                className="delete-btn"

                                                onClick={() =>
                                                    removeDiscount(
                                                        index
                                                    )
                                                }

                                            >
                                                Remove
                                            </button>

                                        </div>

                                    )
                                )

                            )
                        }

                    </section>


                    {/* =================================================
                        PAYMENT
                    ================================================= */}

                    <section className="pricing-card">

                        <h3>
                            Payment Configuration
                        </h3>


                        <div className="form-group">

                            <label>
                                Advance Payment Type
                            </label>


                            <select

                                value={
                                    pricing.paymentConfiguration
                                        ?.advancePaymentType ??
                                    "PERCENTAGE"
                                }

                                onChange={e =>
                                    updateAdvancePaymentType(
                                        e.target.value as
                                            | "PERCENTAGE"
                                            | "FIXED_AMOUNT"
                                    )
                                }

                            >

                                <option value="PERCENTAGE">
                                    Percentage
                                </option>

                                <option value="FIXED_AMOUNT">
                                    Fixed Amount
                                </option>

                            </select>

                        </div>


                        <div className="form-group">

                            <label>

                                {
                                    pricing.paymentConfiguration
                                        ?.advancePaymentType ===
                                    "FIXED_AMOUNT"

                                        ? "Advance Amount (₹)"

                                        : "Advance Percentage (%)"
                                }

                            </label>


                            <input

                                type="number"

                                min="0"

                                max={
                                    pricing.paymentConfiguration
                                        ?.advancePaymentType ===
                                    "PERCENTAGE"

                                        ? 100

                                        : undefined
                                }

                                value={
                                    pricing.paymentConfiguration
                                        ?.advancePaymentValue ??
                                    ""
                                }

                                onChange={e =>
                                    updateAdvancePaymentValue(
                                        e.target.value
                                    )
                                }

                            />

                        </div>

                    </section>


                    {/* =================================================
                        CANCELLATION POLICY
                    ================================================= */}

                    <section className="pricing-card cancellation-card">

                        <div className="section-header">

                            <div>

                                <h3>
                                    Cancellation Policy
                                </h3>


                                <p className="section-description">

                                    Define your own refund policy based on
                                    the number of days before the event.

                                </p>

                            </div>


                            <button

                                type="button"

                                onClick={
                                    addRefundRule
                                }

                            >

                                + Add Refund Rule

                            </button>

                        </div>


                        {/* =================================================
                            REFUND PROCESSING
                        ================================================= */}

                        <div className="form-group processing-days-field">

                            <label>
                                Refund Processing Days
                            </label>


                            <input

                                type="number"

                                min="0"

                                value={
                                    pricing
                                        .cancellationPolicy
                                        ?.processingDays ??
                                    0
                                }

                                onChange={e =>
                                    updateProcessingDays(
                                        e.target.value
                                    )
                                }

                            />

                            <small>
                                Number of days required to process a refund.
                            </small>

                        </div>


                        {/* =================================================
                            REFUND RULES
                        ================================================= */}
                        <div className="refund-rules-header">

                            <div>

                                <h4>
                                    Refund Rules
                                </h4>

                                <span>
                                    Add as many cancellation rules as required.
                                </span>

                            </div>

                            <button
                                type="button"
                                onClick={addRefundRule}
                            >
                                + Add Rule
                            </button>

                        </div>


                        {
                            (
                                pricing
                                    .cancellationPolicy
                                    ?.refundRules ?? []
                            ).length === 0 ? (

                                <div className="refund-rules-empty">

                                    <div className="refund-empty-icon">
                                        %
                                    </div>

                                    <strong>
                                        No refund rules configured
                                    </strong>

                                    <span>
                                        Add a rule to define your cancellation policy.
                                    </span>

                                    <button
                                        type="button"
                                        onClick={addRefundRule}
                                    >
                                        + Add Refund Rule
                                    </button>

                                </div>

                            ) : (

                                <div className="refund-rules-list">

                                    {
                                        (
                                            pricing
                                                .cancellationPolicy
                                                ?.refundRules ?? []
                                        ).map(
                                            (
                                                rule,
                                                index
                                            ) => (

                                                <div
                                                    key={index}
                                                    className="refund-rule-row"
                                                >

                                                    <div className="refund-rule-field">

                                                        <label>
                                                            From Days
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                rule.minDaysBeforeEvent
                                                            }
                                                            onChange={e =>
                                                                updateRefundRule(
                                                                    index,
                                                                    "minDaysBeforeEvent",
                                                                    Number(
                                                                        e.target.value
                                                                    )
                                                                )
                                                            }
                                                        />

                                                    </div>


                                                    <div className="refund-rule-field">

                                                        <label>
                                                            To Days
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                rule.maxDaysBeforeEvent ===
                                                                null
                                                                    ? ""
                                                                    : rule.maxDaysBeforeEvent
                                                            }
                                                            placeholder="No limit"
                                                            onChange={e =>
                                                                updateRefundRule(
                                                                    index,
                                                                    "maxDaysBeforeEvent",
                                                                    e.target.value === ""
                                                                        ? null
                                                                        : Number(
                                                                            e.target.value
                                                                        )
                                                                )
                                                            }
                                                        />

                                                    </div>


                                                    <div className="refund-rule-field">

                                                        <label>
                                                            Refund %
                                                        </label>

                                                        <div className="percentage-input">

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={
                                                                    rule.refundPercentage
                                                                }
                                                                onChange={e =>
                                                                    updateRefundRule(
                                                                        index,
                                                                        "refundPercentage",
                                                                        Number(
                                                                            e.target.value
                                                                        )
                                                                    )
                                                                }
                                                            />

                                                            <span>
                                                                %
                                                            </span>

                                                        </div>

                                                    </div>


                                                    <button
                                                        type="button"
                                                        className="delete-btn refund-rule-remove"
                                                        onClick={() =>
                                                            removeRefundRule(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>

                                                </div>

                                            )
                                        )
                                    }

                                </div>

                            )
                        }



                    </section>

                </div>


                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <div className="pricing-right">


                    {/* =================================================
                        PRICING SUMMARY
                    ================================================= */}

                    <section className="pricing-card pricing-summary-card">

                        <h3>
                            Pricing Summary
                        </h3>


                        {/* BASE */}

                        <div className="summary-row">

                            <span>
                                Base Amount
                            </span>


                            <strong>

                                ₹
                                {
                                    Number(
                                        pricing.baseAmount ||
                                        0
                                    ).toLocaleString(
                                        "en-IN"
                                    )
                                }

                            </strong>

                        </div>


                        {/* PRICING HEADS */}

                        {
                            pricing.pricingHeads
                                .map(
                                    (
                                        head,
                                        index
                                    ) => (

                                        <div

                                            key={
                                                index
                                            }

                                            className="summary-row"

                                        >

                                            <span>

                                                {
                                                    head.name ||
                                                    "Pricing Head"
                                                }

                                            </span>


                                            <strong>

                                                {
                                                    head.calculationType ===
                                                    "FIXED"

                                                        ? `₹${Number(
                                                            head.value ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}`

                                                        : `${head.value || 0}%`

                                                }

                                            </strong>

                                        </div>

                                    )
                                )
                        }


                        {/* DISCOUNTS */}

                        {
                            pricing.discounts
                                .map(
                                    (
                                        discount,
                                        index
                                    ) => (

                                        <div

                                            key={
                                                index
                                            }

                                            className={
                                                "summary-row discount"
                                            }

                                        >

                                            <span>

                                                {
                                                    discount.name ||
                                                    "Discount"
                                                }

                                            </span>


                                            <strong>

                                                {
                                                    discount.discountType ===
                                                    "FIXED"

                                                        ? `- ₹${Number(
                                                            discount.value ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}`

                                                        : `- ${discount.value || 0}%`

                                                }

                                            </strong>

                                        </div>

                                    )
                                )
                        }


                        <div className="summary-divider" />


                        {/* ACTIVE PACKAGES */}

                        <div className="summary-section-title">

                            Active Packages

                        </div>


                        {
                            sortedPackages.filter(
                                pkg =>
                                    pkg.active
                            ).length ===
                            0 ? (

                                <div className="summary-empty">

                                    No active packages

                                </div>

                            ) : (

                                sortedPackages

                                    .filter(
                                        pkg =>
                                            pkg.active
                                    )

                                    .map(
                                        pkg => (

                                            <div
                                                key={
                                                    pkg.id ??
                                                    pkg.name
                                                }
                                                className="package-summary-row"
                                            >

                                                <div>

                                                    <span className="package-summary-dot" />


                                                    <span>
                                                        {
                                                            pkg.name.trim()
                                                                ? pkg.name
                                                                : "Untitled Package"
                                                        }
                                                    </span>

                                                </div>


                                                <strong>

                                                    ₹
                                                    {
                                                        Number(
                                                            pkg.price ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )
                                                    }

                                                </strong>

                                            </div>

                                        )
                                    )

                            )
                        }


                        <div className="summary-divider" />


                        {/* PAYMENT */}

                        <div className="summary-row">

                            <span>
                                Advance Payment
                            </span>


                            <strong>

                                {
                                    pricing.paymentConfiguration
                                        ?.advancePaymentValue !== null &&
                                    pricing.paymentConfiguration
                                        ?.advancePaymentValue !== undefined &&
                                    Number(
                                        pricing.paymentConfiguration
                                            .advancePaymentValue
                                    ) > 0

                                        ? pricing.paymentConfiguration
                                            .advancePaymentType ===
                                            "FIXED_AMOUNT"

                                            ? `₹${Number(
                                                pricing.paymentConfiguration
                                                    .advancePaymentValue
                                            ).toLocaleString(
                                                "en-IN"
                                            )}`

                                            : `${Number(
                                                pricing.paymentConfiguration
                                                    .advancePaymentValue
                                            )}%`

                                        : "Not Configured"
                                }

                            </strong>

                        </div>


                        {/* CANCELLATION */}

                        <div className="summary-row">

                            <span>
                                Refund Rules
                            </span>


                            <strong>

                                {
                                    pricing
                                        .cancellationPolicy
                                        ?.refundRules
                                        ?.length ??
                                    0
                                }

                                {" "}

                                {
                                    (
                                        pricing
                                            .cancellationPolicy
                                            ?.refundRules
                                            ?.length ??
                                        0
                                    ) === 1
                                        ? "Rule"
                                        : "Rules"
                                }

                            </strong>

                        </div>


                        <div className="summary-row">

                            <span>
                                Refund Processing
                            </span>


                            <strong>

                                {
                                    pricing
                                        .cancellationPolicy
                                        ?.processingDays ??
                                    0
                                }

                                {" "}
                                days

                            </strong>

                        </div>

                    </section>


                    {/* =================================================
                        TIP
                    ================================================= */}

                    <section className="pricing-tip">

                        <div className="pricing-tip-icon">
                            💡
                        </div>


                        <div>

                            <strong>
                                Tip
                            </strong>


                            <p>

                                Create package names, prices and features that
                                match your service offerings. Customers will see
                                only the packages you activate. Cancellation rules
                                are defined entirely by you.

                            </p>

                        </div>

                    </section>

                </div>

            </div>

        </div>

    );

};


export default VendorPricing;