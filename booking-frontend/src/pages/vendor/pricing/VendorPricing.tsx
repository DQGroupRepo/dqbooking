import NumericInput from "../../../components/common/ui/NumericInput";
import DateField from "../../../components/common/DateField/DateField";
import MobileCarousel from "../../../components/common/MobileCarousel/MobileCarousel";
import Loader from "../../../components/common/Loader";
import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import type { ServicePackage} from "../../../types/ServicePackage";

import VendorPricingService from "../../../services/VendorPricingService";

import toast from "react-hot-toast";

import type { VendorServicePricing, VendorPricingHead, VendorDiscount,
    RefundRule } from "../../../types/VendorPricing";

import CateringPackageMenuModal
    from "../../../components/vendor/pricing/CateringPackageMenuModal";

import type { CateringPackageMenu } from "../../../types/CateringPackageMenu";

import VendorCateringMenuService from "../../../services/VendorCateringMenuService";

import VendorServiceService from "../../../services/VendorServiceService";
import BookingSlotService from "../../../services/BookingSlotService";
import type { BookingSlot } from "../../../types/BookingSlot";
import type { ServiceResourceType } from "../../../types/VendorDetail";

import type { CateringMenuItem} from "../../../types/CateringMenuItem";

import "./VendorPricing.css";


/*
 * =========================================================
 * PRICING VERSION HISTORY
 * =========================================================
 */

interface VendorServicePricingVersion {

    id: string;

    version: number;

    effectiveFrom: string;

    effectiveUntil?: string | null;

    baseAmount: number;

    createdAt: string;

    createdBy: string;

}


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

    packages: [],

    paymentConfiguration: {

        advancePaymentAllowed: false,

        advancePaymentType: "PERCENTAGE",

        advancePaymentValue: null

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

    const [ packages, setPackages
    ] = useState<ServicePackage[]>([]);

    const [ pricingVersions, setPricingVersions
    ] = useState<VendorServicePricingVersion[]>([]);

    const [ selectedPricingId, setSelectedPricingId ] =  useState<string | null>(null);

    const [isCateringService, setIsCateringService] = useState(false);
    const [isStayService, setIsStayService] = useState(false);
    const [isResourceService, setIsResourceService] = useState(false);
    const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
    const [resourceTypes, setResourceTypes] = useState<ServiceResourceType[]>([]);
    const [resourceTypeName, setResourceTypeName] = useState("");
    const [resourceTypeQuantity, setResourceTypeQuantity] = useState(1);

    const [cateringMenuItems, setCateringMenuItems] =
        useState<CateringMenuItem[]>([]);

    const [menuPackageIndex, setMenuPackageIndex] =
        useState<number | null>(null);
    /*
     * =========================================================
     * LOAD PRICING + PACKAGES
     * =========================================================
     */

    const addResourceType = async () => {
        if (!serviceId || !resourceTypeName.trim()) {
            toast.error("Enter a resource type name.");
            return;
        }
        try {
            const next = [...resourceTypes, {
                id: `resource-${Date.now()}`,
                name: resourceTypeName.trim(),
                quantity: Math.max(1, Math.min(100, Math.floor(resourceTypeQuantity || 1))),
                active: true
            }];
            const saved = await VendorServiceService.saveResourceTypes(serviceId, next);
            setResourceTypes(saved);
            setResourceTypeName("");
            setResourceTypeQuantity(1);
            toast.success("Resource type saved.");
        } catch (error) {
            console.error("Failed to save resource types", error);
            toast.error("Unable to save resource type.");
        }
    };

    const removeResourceType = async (resourceTypeId: string) => {
        if (!serviceId) return;
        if (packages.some(pkg => pkg.resourceTypeId === resourceTypeId ||
            (pkg.resourceRequirements ?? []).some(requirement => requirement.resourceTypeId === resourceTypeId)) ||
            bookingSlots.some(slot => slot.resourceTypeId === resourceTypeId)) {
            toast.error("Unassign this resource type from packages and booking slots before removing it.");
            return;
        }
        try {
            const next = resourceTypes.filter(type => type.id !== resourceTypeId);
            const saved = await VendorServiceService.saveResourceTypes(serviceId, next);
            setResourceTypes(saved);
            setPackages(previous => previous.map(pkg =>
                pkg.resourceTypeId === resourceTypeId ? { ...pkg, resourceTypeId: undefined } : pkg
            ));
            toast.success("Resource type removed.");
        } catch (error) {
            console.error("Failed to remove resource type", error);
            toast.error("Unable to remove resource type.");
        }
    };

    useEffect(() => {

        if (!serviceId) {

            return;

        }


        loadPricing();

    }, [
        serviceId
    ]);

    useEffect(() => {
        if (!serviceId) return;

        let cancelled = false;

        async function loadCateringData() {
            try {
                const service =
                    await VendorServiceService.getServiceById(serviceId!);

                if (cancelled) return;

                const category = service.category?.toLowerCase().trim();
                const isCatering = category === "catering";
                const isStay = category === "stay" || category === "stays";
                const usesResourceTypes = isStay || category === "hall" || category === "halls";

                setIsCateringService(isCatering);
                setIsStayService(isStay);
                setIsResourceService(usesResourceTypes);
                const savedResourceTypes = usesResourceTypes
                    ? await VendorServiceService.getResourceTypes(serviceId!)
                    : [];
                if (!cancelled) setResourceTypes(savedResourceTypes);

                // Package eligibility and STAY inventory are managed by booking slots.
                const slotResults = await BookingSlotService.getSlots(serviceId!);
                if (!cancelled) setBookingSlots(slotResults.filter(slot => slot.active));

                if (isCatering) {
                    const response =
                        await VendorCateringMenuService.getMenu(serviceId!);

                    if (!cancelled) {
                        setCateringMenuItems(response.items ?? []);
                    }
                } else {
                    setCateringMenuItems([]);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Failed to load catering menu:", error);
                    toast.error("Unable to load package or catering configuration.");
                }
            }
        }

        void loadCateringData();

        return () => {
            cancelled = true;
        };
    }, [serviceId]);

    function updatePackageCateringMenu(
        packageIndex: number,
        menu: CateringPackageMenu
    ) {
        setPackages(previous =>
            previous.map((pkg, index) =>
                index === packageIndex
                    ? { ...pkg, cateringPackageMenu: menu }
                    : pkg
            )
        );

        setMenuPackageIndex(null);
    }
    /*
     * =========================================================
     * LOAD PRICING
     * =========================================================
     */

    async function loadPricing() {

        try {

            setLoading(
                true
            );


            const [
                response,
                versions
            ] = await Promise.all([

                VendorPricingService
                    .getPricing(
                        serviceId!
                    ),

                VendorPricingService
                    .getPricingVersions(
                        serviceId!
                    )

            ]);


            setPricingVersions(
                (versions ?? []).map(version => ({
                    ...version,
                    baseAmount: Number(version.baseAmount),
                    createdAt: version.createdAt ?? "",
                    createdBy: version.createdBy ?? ""
                }))
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


                setPackages(
                    response.packages ?? []
                );


                setSelectedPricingId(
                    response.id ?? null
                );

            }
            else {

                setPricing({

                    ...emptyPricing,

                    serviceId:
                        serviceId!

                });

                setPackages(
                    []
                );

                setSelectedPricingId(
                    null
                );

            }


        }
        catch (error) {

            console.error(
                "Failed to load pricing:",
                error
            );

            setPricingVersions(
                []
            );

            setSelectedPricingId(
                null
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
     * LOAD A SPECIFIC PRICING VERSION
     * =========================================================
     */

    async function selectPricingVersion(
        pricingId: string
    ) {

        try {

            setLoading(
                true
            );


            const response =
                await VendorPricingService
                    .getPricingById(
                        pricingId
                    );


            if (!response) {

                return;

            }


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


            setPackages(
                response.packages ?? []
            );


            setSelectedPricingId(
                response.id ?? pricingId
            );

        }
        catch (error) {

            console.error(
                "Failed to load pricing version:",
                error
            );

            toast.error(
                "Unable to load pricing version."
            );

        }
        finally {

            setLoading(
                false
            );

        }

    }


    function formatVersionDate(
        value?: string | null
    ): string {

        if (!value) {

            return "—";

        }


        return new Date(
            `${value}T00:00:00`
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    function formatVersionDateTime(
        value?: string | null
    ): string {

        if (!value) {

            return "—";

        }


        return new Date(
            value
        ).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

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
                !pkg.price ||
                pkg.price <= 0
            ) {

                toast.error(
                    `Enter a valid price for the ${pkg.name} package.`
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


        try {

            setSaving(
                true
            );


            /*
             * =====================================================
             * SAVE PRICING + PACKAGES TOGETHER
             * =====================================================
             *
             * Packages now belong to VendorServicePricing.
             *
             * There is no separate package API call.
             */

            if (!isResourceService && packages.some(pkg => pkg.active && pkg.requiresSlot === false)) {
                toast.error("Packages without predefined slots are supported only for Stays services.");
                setSaving(false);
                return;
            }

            if (isResourceService) {
                const invalidStayPackage = isStayService
                    ? packages.find(pkg => pkg.active && (!Number.isInteger(Number(pkg.maxGuestsPerRoom)) || Number(pkg.maxGuestsPerRoom) < 1))
                    : undefined;
                if (invalidStayPackage) {
                    toast.error(`Enter a maximum of at least one guest per room for package "${invalidStayPackage.name || "Untitled"}".`);
                    setSaving(false);
                    return;
                }
                const unassignedInventoryPackage = packages.find(pkg => pkg.active && !(pkg.resourceRequirements?.length || pkg.resourceTypeId));
                if (unassignedInventoryPackage) {
                    toast.error(`Add at least one Resource Type to package "${unassignedInventoryPackage.name || "Untitled"}".`);
                    setSaving(false);
                    return;
                }
                const invalidInventoryPackage = packages.find(pkg => pkg.active && (pkg.resourceRequirements ?? []).some(item => !item.resourceTypeId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1));
                if (invalidInventoryPackage) {
                    toast.error(`Check the ${isStayService ? "room" : "resource"} composition for package "${invalidInventoryPackage.name || "Untitled"}".`);
                    setSaving(false);
                    return;
                }
                const unassignedStayPackage = isStayService
                    ? packages.find(pkg => pkg.active && !(pkg.slotIds ?? []).length)
                    : undefined;
                if (unassignedStayPackage) {
                    toast.error(`Assign at least one booking slot to package "${unassignedStayPackage.name || "Untitled"}".`);
                    setSaving(false);
                    return;
                }
            }

            const invalidFixedDurationPackage = packages.find(pkg => isStayService && pkg.active && pkg.packageType === "FIXED_DURATION" && (!(pkg.resourceRequirements?.length || pkg.resourceTypeId) || !pkg.includedDuration || pkg.includedDuration < 1 || pkg.pricingBasis !== "FIXED"));
            if (invalidFixedDurationPackage) {
                toast.error(`Fixed-duration package "${invalidFixedDurationPackage.name || "Untitled"}" requires at least one Resource Type, an included duration, and fixed pricing.`);
                setSaving(false);
                return;
            }

            await VendorPricingService.savePricing(
                serviceId,
                pricing,
                packages
            );


            toast.success(
                "New pricing version created successfully."
            );


            await loadPricing();

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
     * BASE PRICING
     * =========================================================
     */

    function updateBaseAmount(value: string) {

        setPricing(previous => ({
            ...previous,
            baseAmount: Number(value)
        }));

    }


    function updateEffectiveFrom(value: string) {

        setPricing(previous => ({
            ...previous,
            effectiveFrom: value
        }));

    }


    function updateEffectiveUntil(value: string) {

        setPricing(previous => ({
            ...previous,
            effectiveUntil: value
        }));

    }


    /*
     * =========================================================
     * PAYMENT CONFIGURATION
     * =========================================================
     */

    function updateAdvancePaymentType(
        type: "PERCENTAGE" | "FIXED_AMOUNT"
    ) {

        setPricing(current => ({
            ...current,
            paymentConfiguration: {
                ...current.paymentConfiguration,
                advancePaymentType: type
            }
        }));

    }


    function updateAdvancePaymentValue(value: string) {

        const numericValue =
            value === ""
                ? null
                : Number(value);

        setPricing(current => ({
            ...current,
            paymentConfiguration: {
                ...current.paymentConfiguration,
                advancePaymentValue: numericValue
            }
        }));

    }


    /*
     * =========================================================
     * PRICING HEADS
     * =========================================================
     */

    function addPricingHead() {

        const head: VendorPricingHead = {
            code: "",
            name: "",
            calculationType: "FIXED",
            value: 0,
            displayOrder:
                pricing.pricingHeads.length + 1,
            active: true
        };

        setPricing(previous => ({
            ...previous,
            pricingHeads: [
                ...previous.pricingHeads,
                head
            ]
        }));

    }


    function updatePricingHead(
        index: number,
        field: keyof VendorPricingHead,
        value: any
    ) {

        setPricing(previous => {

            const updated = [
                ...previous.pricingHeads
            ];

            updated[index] = {
                ...updated[index],
                [field]: value
            };

            return {
                ...previous,
                pricingHeads: updated
            };

        });

    }


    function removePricingHead(index: number) {

        setPricing(previous => ({
            ...previous,
            pricingHeads:
                previous.pricingHeads.filter(
                    (_, i) => i !== index
                )
        }));

    }


    /*
     * =========================================================
     * DISCOUNTS
     * =========================================================
     */

    function addDiscount() {

        const discount: VendorDiscount = {
            name: "",
            discountType: "FIXED",
            value: 0,
            active: true
        };

        setPricing(previous => ({
            ...previous,
            discounts: [
                ...previous.discounts,
                discount
            ]
        }));

    }


    function updateDiscount(
        index: number,
        field: keyof VendorDiscount,
        value: any
    ) {

        setPricing(previous => {

            const updated = [
                ...previous.discounts
            ];

            updated[index] = {
                ...updated[index],
                [field]: value
            };

            return {
                ...previous,
                discounts: updated
            };

        });

    }


    function removeDiscount(index: number) {

        setPricing(previous => ({
            ...previous,
            discounts:
                previous.discounts.filter(
                    (_, i) => i !== index
                )
        }));

    }


    /*
     * =========================================================
     * SERVICE PACKAGES
     * =========================================================
     *
     * Packages are completely vendor-defined.
     * There are no predefined package names or package limits.
     */

    function addPackage(packageType: string = "STANDARD") {

        const newPackage: ServicePackage = {

            id: undefined,
            name: "",
            price: 0,
            features: [],
            active: true,
            requiresSlot: true,
            slotIds: [],
            pricingBasis: "FIXED",
            minimumDuration: 1,
            maximumDuration: 31,
            includedDuration: packageType === "FIXED_DURATION" ? 3 : undefined,
            resourceTypeId: undefined,
            resourceRequirements: [],
            maxGuestsPerRoom: isStayService ? 2 : undefined,
            packageType

        };

        setPackages(
            previous => [
                ...previous,
                newPackage
            ]
        );

    }


    function addPackageResourceRequirement(packageIndex: number) {
        setPackages(previous => previous.map((pkg, index) => {
            if (index !== packageIndex) return pkg;
            const existing = pkg.resourceRequirements ?? (pkg.resourceTypeId ? [{ resourceTypeId: pkg.resourceTypeId, quantity: 1 }] : []);
            const used = new Set(existing.map(item => item.resourceTypeId));
            const nextType = resourceTypes.find(type => type.active !== false && !used.has(type.id));
            if (!nextType) return pkg;
            return { ...pkg, resourceRequirements: [...existing, { resourceTypeId: nextType.id, quantity: 1 }], resourceTypeId: undefined };
        }));
    }

    function updatePackageResourceRequirement(packageIndex: number, requirementIndex: number, field: "resourceTypeId" | "quantity", value: string | number) {
        setPackages(previous => previous.map((pkg, index) => {
            if (index !== packageIndex) return pkg;
            const next = [...(pkg.resourceRequirements ?? (pkg.resourceTypeId ? [{ resourceTypeId: pkg.resourceTypeId, quantity: 1 }] : []))];
            if (!next[requirementIndex]) return pkg;
            next[requirementIndex] = { ...next[requirementIndex], [field]: value };
            return { ...pkg, resourceRequirements: next, resourceTypeId: undefined };
        }));
    }

    function removePackageResourceRequirement(packageIndex: number, requirementIndex: number) {
        setPackages(previous => previous.map((pkg, index) => index === packageIndex
            ? { ...pkg, resourceRequirements: (pkg.resourceRequirements ?? (pkg.resourceTypeId ? [{ resourceTypeId: pkg.resourceTypeId, quantity: 1 }] : [])).filter((_, i) => i !== requirementIndex), resourceTypeId: undefined }
            : pkg));
    }

    function togglePackage(
        packageIndex: number
    ) {

        setPackages(
            previous =>
                previous.map(
                    (pkg, index) =>
                        index === packageIndex
                            ? { ...pkg, active: !pkg.active }
                            : pkg
                )
        );

    }


    function updatePackage(
        packageIndex: number,
        field: keyof ServicePackage,
        value: string | number | boolean | undefined
    ) {

        setPackages(
            previous =>
                previous.map(
                    (pkg, index) =>
                        index === packageIndex
                            ? { ...pkg, [field]: value }
                            : pkg
                )
        );

    }


    function togglePackageId(
        packageIndex: number,
        field: "slotIds",
        id: string
    ) {
        setPackages(previous => previous.map((pkg, index) => {
            if (index !== packageIndex) return pkg;
            const current = pkg[field] ?? [];
            const next = current.includes(id)
                ? current.filter(value => value !== id)
                : [...current, id];
            return { ...pkg, [field]: next };
        }));
    }

    function removePackage(
        packageIndex: number
    ) {

        setPackages(
            previous =>
                previous.filter(
                    (_, index) => index !== packageIndex
                )
        );

    }


    function addFeature(
        packageIndex: number
    ) {

        setPackages(
            previous =>
                previous.map(
                    (pkg, index) =>
                        index === packageIndex
                            ? {
                                ...pkg,
                                features: [...pkg.features, ""]
                            }
                            : pkg
                )
        );

    }


    function updateFeature(
        packageIndex: number,
        featureIndex: number,
        value: string
    ) {

        setPackages(
            previous =>
                previous.map(
                    (pkg, index) => {

                        if (index !== packageIndex) {
                            return pkg;
                        }

                        const features = [...pkg.features];
                        features[featureIndex] = value;

                        return { ...pkg, features };

                    }
                )
        );

    }


    function removeFeature(
        packageIndex: number,
        featureIndex: number
    ) {

        setPackages(
            previous =>
                previous.map(
                    (pkg, index) => {

                        if (index !== packageIndex) {
                            return pkg;
                        }

                        return {
                            ...pkg,
                            features: pkg.features.filter(
                                (_, feature) => feature !== featureIndex
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

    function updateProcessingDays(value: string) {

        setPricing(previous => ({
            ...previous,
            cancellationPolicy: {
                processingDays: Number(value),
                refundRules:
                    previous.cancellationPolicy?.refundRules ?? []
            }
        }));

    }


    function addRefundRule() {

        const newRule: RefundRule = {
            minDaysBeforeEvent: 0,
            maxDaysBeforeEvent: null,
            refundPercentage: 0
        };

        setPricing(previous => ({
            ...previous,
            cancellationPolicy: {
                processingDays:
                    previous.cancellationPolicy?.processingDays ?? 0,
                refundRules: [
                    ...(previous.cancellationPolicy?.refundRules ?? []),
                    newRule
                ]
            }
        }));

    }


    function updateRefundRule(
        index: number,
        field: keyof RefundRule,
        value: number | null
    ) {

        setPricing(previous => {

            const updatedRules = [
                ...(previous.cancellationPolicy?.refundRules ?? [])
            ];

            updatedRules[index] = {
                ...updatedRules[index],
                [field]: value
            };

            return {
                ...previous,
                cancellationPolicy: {
                    processingDays:
                        previous.cancellationPolicy?.processingDays ?? 0,
                    refundRules: updatedRules
                }
            };

        });

    }


    function removeRefundRule(index: number) {

        setPricing(previous => ({
            ...previous,
            cancellationPolicy: {
                processingDays:
                    previous.cancellationPolicy?.processingDays ?? 0,
                refundRules:
                    (previous.cancellationPolicy?.refundRules ?? [])
                        .filter((_, ruleIndex) => ruleIndex !== index)
            }
        }));

    }


    function validateRefundRules(): boolean {

        const rules =
            pricing.cancellationPolicy?.refundRules ?? [];

        for (let index = 0; index < rules.length; index++) {

            const rule = rules[index];

            if (rule.minDaysBeforeEvent < 0) {
                toast.error(
                    `Refund Rule ${index + 1}: From Days cannot be negative.`
                );
                return false;
            }

            if (
                rule.maxDaysBeforeEvent !== null &&
                rule.maxDaysBeforeEvent < rule.minDaysBeforeEvent
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


    const sortedPackages = [
        ...packages
    ];


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

            <Loader label="Loading pricing configuration" />

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



            {/* =================================================
                PRICING VERSION HISTORY
            ================================================= */}

            <section className="pricing-card pricing-version-history">

                <div className="section-header">

                    <div>

                        <h3>
                            Pricing Versions
                        </h3>

                        <p className="section-description">
                            View and load previously created pricing configurations.
                        </p>

                    </div>

                    <span className="version-count">
                        {pricingVersions.length}
                        {" "}
                        {pricingVersions.length === 1
                            ? "version"
                            : "versions"}
                    </span>

                </div>


                {pricingVersions.length === 0 ? (

                    <div className="version-empty-state">
                        No pricing versions have been created yet.
                    </div>

                ) : (

                    <div className="pricing-version-table-wrapper">

                        <table className="pricing-version-table">

                            <thead>

                                <tr>
                                    <th>Version</th>
                                    <th>Effective From</th>
                                    <th>Effective Until</th>
                                    <th>Base Amount</th>
                                    <th>Created Date</th>
                                    <th>Created By</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {pricingVersions.map(
                                    version => {

                                        const selected =
                                            selectedPricingId ===
                                            version.id;

                                        const current =
                                            pricing.id ===
                                            version.id;

                                        return (
                                            <tr
                                                key={version.id}
                                                className={
                                                    selected
                                                        ? "selected"
                                                        : ""
                                                }
                                            >

                                                <td>
                                                    <div className="version-cell">

                                                        <strong>
                                                            v{version.version}
                                                        </strong>

                                                        {current && (
                                                            <span className="current-version-badge">
                                                                Current
                                                            </span>
                                                        )}

                                                    </div>
                                                </td>

                                                <td>
                                                    {formatVersionDate(
                                                        version.effectiveFrom
                                                    )}
                                                </td>

                                                <td>
                                                    {formatVersionDate(
                                                        version.effectiveUntil
                                                    )}
                                                </td>

                                                <td>
                                                    ₹{Number(
                                                        version.baseAmount ?? 0
                                                    ).toLocaleString(
                                                        "en-IN",
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }
                                                    )}
                                                </td>

                                                <td>
                                                    {formatVersionDateTime(
                                                        version.createdAt
                                                    )}
                                                </td>

                                                <td>
                                                    {version.createdBy || "—"}
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="view-version-btn"
                                                        disabled={selected}
                                                        onClick={() =>
                                                            selectPricingVersion(
                                                                version.id
                                                            )

                                                        }
                                                    >
                                                        {selected
                                                            ? "Selected"
                                                            : "View"}
                                                    </button>
                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            <div className="pricing-grid">


                {/* =================================================
                    LEFT
                ================================================= */}

                <div className="pricing-left">


                    {/* =================================================
                        SERVICE PACKAGES
                    ================================================= */}

                    {isResourceService && (
                    <section className="pricing-card package-card-section">
                        <div className="package-section-header">
                            <div>
                                <h3>Resource Types</h3>
                                <p>Configure separately reservable physical units for this service.</p>
                            </div>
                        </div>
                        <div className="package-eligibility-config">
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
                                <label style={{ flex: "1 1 220px" }}>Resource type name
                                    <input value={resourceTypeName} onChange={e => setResourceTypeName(e.target.value)} placeholder="e.g. Big Hall, Small Hall" />
                                </label>
                                <label>Physical quantity
                                    <NumericInput  min={1} max={100} value={resourceTypeQuantity} onChange={e => setResourceTypeQuantity(Math.max(1, Number(e.target.value) || 1))} />
                                </label>
                                <button type="button" className="add-package-btn" onClick={addResourceType}>+ Add Resource Type</button>
                            </div>
                            {resourceTypes.map(type => (
                                <div key={type.id} className="package-eligibility-option" style={{ justifyContent: "space-between" }}>
                                    <span><strong>{type.name}</strong> · {type.quantity} physical unit(s)</span>
                                    <button type="button" className="remove-feature-btn" onClick={() => removeResourceType(type.id)}>Remove</button>
                                </div>
                            ))}
                            {resourceTypes.length === 0 && <p className="package-eligibility-help">No Resource Types configured yet. Add at least one physical resource before saving resource-based packages.</p>}
                        </div>
                    </section>
                    )}

                    <section className="pricing-card package-card-section">

                        <div className="package-section-header">

                            <div>
                                <h3>Service Packages</h3>
                                <p>
                                    Create as many package options as your service requires.
                                </p>
                            </div>

                            <div className="package-section-actions">
                                <div className="package-count">
                                    {packages.length} {packages.length === 1 ? "package" : "packages"}
                                </div>

                                {isResourceService ? (
                                    <>
                                        <button
                                            type="button"
                                            className="add-package-btn"
                                            onClick={() => addPackage("STANDARD")}
                                        >
                                            + Create Resource Package
                                        </button>
                                        {isStayService && (
                                            <button
                                                type="button"
                                                className="add-package-btn"
                                                onClick={() => addPackage("FIXED_DURATION")}
                                            >
                                                + Create Fixed-Duration Package
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        className="add-package-btn"
                                        onClick={() => addPackage("STANDARD")}
                                    >
                                        + Create Package
                                    </button>
                                )}
                            </div>

                        </div>

                        {packages.length === 0 ? (

                            <div className="package-empty-state">

                                <strong>No packages created yet</strong>
                                <p>
                                    Create your first package with a name, price and optional features.
                                </p>
                            </div>

                        ) : (

                            <MobileCarousel className="package-editor-grid" ariaLabel="Service packages" paginationPosition="top">

                                {packages.map((pkg, packageIndex) => {

                                    const isActive = Boolean(pkg.active);

                                    return (

                                        <div
                                            key={pkg.id ?? `new-package-${packageIndex}`}
                                            className={`service-package-card ${isActive ? "active" : "inactive"}`}
                                        >

                                            <div className="package-card-header">
                                                <div className="package-card-title-area">

                                                    <label className="package-toggle">
                                                        <input
                                                            type="checkbox"
                                                            checked={isActive}
                                                            onChange={() => togglePackage(packageIndex)}
                                                        />
                                                        <span className="package-checkmark" />
                                                    </label>

                                                    <div className="package-title-fields">
                                                        <label>Package Name</label>
                                                        <input
                                                            type="text"
                                                            value={pkg.name ?? ""}
                                                            placeholder="e.g. Premium Wedding Package"
                                                            onChange={e =>
                                                                updatePackage(
                                                                    packageIndex,
                                                                    "name",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                </div>
                                            </div>

                                            {isActive ? (

                                                <>
                                                    <div className="package-price-field">
                                                        <label>{isStayService ? "Price per complete package combination" : "Package Price"}</label>
                                                        <div className="package-price-input">
                                                            <span>₹</span>
                                                            <NumericInput

                                                                min="0"
                                                                step="0.01"
                                                                value={pkg.price ?? 0}
                                                                onChange={e =>
                                                                    updatePackage(
                                                                        packageIndex,
                                                                        "price",
                                                                        Number(e.target.value)
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    {isStayService && <p className="package-eligibility-help">This price applies to one complete room composition. The customer-selected quantity multiplies the price by the number of complete combinations.</p>}

                                                    {pkg.packageType === "FIXED_DURATION" ? (
                                                        <div className="package-eligibility-config">
                                                            <div className="package-features-header"><h5>Fixed-Duration Package</h5></div>
                                                            <label>Included {isStayService ? "nights" : "days"}
                                                                <NumericInput  min="1" max="31" value={pkg.includedDuration ?? 3}
                                                                    onChange={e => updatePackage(packageIndex, "includedDuration", Math.max(1, Math.min(31, Number(e.target.value) || 1)))} />
                                                            </label>
                                                            <p className="package-eligibility-help">Customers cannot change this duration. Checkout is calculated from the selected start date.</p>
                                                        </div>
                                                    ) : (
                                                    <div className="package-eligibility-config">
                                                        <div className="package-features-header"><h5>Duration & Pricing</h5></div>
                                                        <label>
                                                            Price calculation
                                                            <select
                                                                value={pkg.pricingBasis ?? "FIXED"}
                                                                onChange={e => updatePackage(packageIndex, "pricingBasis", e.target.value)}
                                                            >
                                                                <option value="PER_DAY">Per day</option>
                                                                <option value="PER_NIGHT">Per night</option>
                                                                <option value="FIXED">Flat price per booking</option>
                                                            </select>
                                                        </label>
                                                        <div className="package-duration-fields stay-duration-fields">
                                                            <label className="stay-duration-field">
                                                                Minimum {pkg.pricingBasis === "PER_NIGHT" ? "nights" : "days"}
                                                                <NumericInput  min="1" max="31"
                                                                    value={pkg.minimumDuration ?? 1}
                                                                    onChange={e => updatePackage(packageIndex, "minimumDuration", Math.max(1, Math.min(31, Number(e.target.value) || 1)))}
                                                                />
                                                            </label>
                                                            <label className="stay-duration-field">
                                                                Maximum {pkg.pricingBasis === "PER_NIGHT" ? "nights" : "days"}
                                                                <NumericInput  min={pkg.minimumDuration ?? 1} max="31"
                                                                    value={pkg.maximumDuration ?? 31}
                                                                    onChange={e => updatePackage(packageIndex, "maximumDuration", Math.max(pkg.minimumDuration ?? 1, Math.min(31, Number(e.target.value) || 1)))}
                                                                />
                                                            </label>
                                                        </div>
                                                        <p className="package-eligibility-help">
                                                            Per-day and per-night prices are multiplied by the selected duration. Fixed pricing is charged once.
                                                        </p>
                                                    </div>
                                                    )}

                                                    {isResourceService && (
                                                        <div className="package-eligibility-config">
                                                            <div className="package-features-header"><h5>{isStayService ? "Room composition" : "Resource composition"}</h5></div>
                                                            <p className="package-eligibility-help">{isStayService
                                                                ? "Define the rooms included in one complete package. For example, 2 Premium + 1 Gold. Customers can book multiple complete combinations; all included rooms are held together."
                                                                : "Define the physical resources included in this package. Each selected resource is reserved for the configured booking slot and interval."}</p>
                                                            {(pkg.resourceRequirements ?? (pkg.resourceTypeId ? [{ resourceTypeId: pkg.resourceTypeId, quantity: 1 }] : [])).map((requirement, requirementIndex) => (
                                                                <div className="package-duration-fields stay-room-composition-row" key={`${requirement.resourceTypeId}-${requirementIndex}`}>
                                                                    <label className="stay-room-type-field">
                                                                        {isStayService ? "Room type" : "Resource type"}
                                                                        <select value={requirement.resourceTypeId} onChange={e => updatePackageResourceRequirement(packageIndex, requirementIndex, "resourceTypeId", e.target.value)}>
                                                                            {resourceTypes.filter(type => type.active !== false).map(type => <option key={type.id} value={type.id}>{type.name} ({type.quantity} total)</option>)}
                                                                        </select>
                                                                    </label>
                                                                    <label className="stay-room-quantity-field">
                                                                        {isStayService ? "Rooms in package" : "Units in package"}
                                                                        <NumericInput  min="1" max="100" value={requirement.quantity} onChange={e => updatePackageResourceRequirement(packageIndex, requirementIndex, "quantity", Math.max(1, Math.min(100, Math.floor(Number(e.target.value) || 1))))} />
                                                                    </label>
                                                                    <button type="button" className="remove-package-room-btn" onClick={() => removePackageResourceRequirement(packageIndex, requirementIndex)}>Remove</button>
                                                                </div>
                                                            ))}
                                                            <button type="button" className="add-package-btn stay-add-room-type-btn" onClick={() => addPackageResourceRequirement(packageIndex)} disabled={resourceTypes.filter(type => type.active !== false).length <= (pkg.resourceRequirements ?? []).length}>+ Add {isStayService ? "Room Type" : "Resource Type"}</button>
                                                        </div>
                                                    )}
                                                    <div className="package-eligibility-config">
                                                        <div className="package-features-header">
                                                            <h5>{isResourceService ? "Booking Slots & Resource Availability" : "Booking Time Configuration"}</h5>
                                                        </div>
                                                        <p className="package-eligibility-help">
                                                            {isStayService
                                                                ? "Assign this STAY package to one or more active booking slots. Slots control check-in timing and vendor date blocks; physical room availability is calculated from the Resource Types above."
                                                                : isResourceService
                                                                    ? "Select the booking slots customers may use with this resource package. Configure the slot times to match the sessions you offer."
                                                                    : "Select which slots customers may use with this package. Leave all unchecked to allow all active slots."}
                                                        </p>
                                                        {bookingSlots.length === 0 ? (
                                                            <p className="package-eligibility-help">No active booking slots configured yet.</p>
                                                        ) : bookingSlots.map(slot => (
                                                            <label className="package-eligibility-option" key={slot.id}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(pkg.slotIds ?? []).includes(slot.id)}
                                                                    onChange={() => togglePackageId(packageIndex, "slotIds", slot.id)}
                                                                />
                                                                <span>{isStayService
                                                                    ? `${slot.slotName} · ${slot.maxBookings} room(s) available`
                                                                    : `${slot.slotName} (${slot.startTime}–${slot.endTime})`}</span>
                                                            </label>
                                                        ))}
                                                    </div>

                                                    {isStayService && (
                                                        <div className="package-eligibility-config stay-package-capacity-config">
                                                            <div className="package-features-header">
                                                                <h5>Guests Per Room</h5>
                                                            </div>
                                                            <p className="package-eligibility-help">
                                                                Set the maximum guests allowed in each room. Customers select the number of rooms; availability is checked across the full stay.
                                                            </p>
                                                            <label className="stay-max-guests-field">
                                                                <span className="stay-max-guests-label">Maximum guests per room</span>
                                                                <NumericInput
                                                                    className="stay-max-guests-input"

                                                                    min="1"
                                                                    step="1"
                                                                    value={pkg.maxGuestsPerRoom ?? ""}
                                                                    onChange={e => setPackages(previous => previous.map((current, index) => index === packageIndex ? { ...current, maxGuestsPerRoom: e.target.value === "" ? undefined : Math.max(1, Math.floor(Number(e.target.value) || 1)) } : current))}
                                                                />
                                                            </label>
                                                        </div>
                                                    )}

                                                    {isCateringService && (
                                                        <div className="package-catering-config">
                                                            <div className="package-catering-config-info">
                                                                <strong>Catering Menu</strong>

                                                                <p>
                                                                    {pkg.cateringPackageMenu
                                                                        ? "Package menu configured"
                                                                        : "Choose dishes and customer selection limits"}
                                                                </p>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                className="configure-catering-menu-btn"
                                                                onClick={() => setMenuPackageIndex(packageIndex)}
                                                            >
                                                                🍽 Configure Catering Menu
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="package-features-section">
                                                        <div className="package-features-header">
                                                            <h5>Features</h5>
                                                            <button
                                                                type="button"
                                                                className="add-feature-btn"
                                                                onClick={() => addFeature(packageIndex)}
                                                            >
                                                                + Add Feature
                                                            </button>
                                                        </div>

                                                        <div className="package-feature-list">
                                                            {pkg.features.map((feature, featureIndex) => (
                                                                <div
                                                                    key={featureIndex}
                                                                    className="package-feature-item"
                                                                >
                                                                    <span className="package-feature-bullet" aria-hidden="true">•</span>
                                                                    <input
                                                                        type="text"
                                                                        value={feature}
                                                                        placeholder="Enter feature"
                                                                        onChange={e =>
                                                                            updateFeature(
                                                                                packageIndex,
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
                                                                                packageIndex,
                                                                                featureIndex
                                                                            )
                                                                        }
                                                                        aria-label="Remove feature"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}

                                                            {pkg.features.length === 0 && (
                                                                <div className="no-features">
                                                                    No features added yet.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="package-card-footer">
                                                        <button
                                                            type="button"
                                                            className="remove-package-btn"
                                                            onClick={() => removePackage(packageIndex)}
                                                        >
                                                            🗑 Remove Package
                                                        </button>
                                                    </div>
                                                </>

                                            ) : (

                                                <div className="inactive-package-content">
                                                    <div className="inactive-package-icon">+</div>
                                                    <p>
                                                        This package is inactive and will not be shown to customers.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        className="enable-package-btn"
                                                        onClick={() => togglePackage(packageIndex)}
                                                    >
                                                        Enable Package
                                                    </button>
                                                </div>

                                            )}

                                        </div>

                                    );

                                })}

                            </MobileCarousel>

                        )}

                        {isCateringService && menuPackageIndex !== null && (
                            <CateringPackageMenuModal
                                packageName={packages[menuPackageIndex]?.name ?? ""}
                                menuItems={cateringMenuItems}
                                initialMenu={
                                    packages[menuPackageIndex]?.cateringPackageMenu
                                }
                                onSave={menu =>
                                    updatePackageCateringMenu(menuPackageIndex, menu)
                                }
                                onClose={() => setMenuPackageIndex(null)}
                            />
                        )}

                        <div className="package-info-banner">
                            <span className="package-info-icon">ⓘ</span>
                            <div>
                                <strong>Package configuration</strong>
                                <p>
                                    Package names, prices and features are completely vendor-defined. You can create any number of packages, and customers will see only the active packages.
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


                                <NumericInput



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


                                <DateField
                                    value={pricing.effectiveFrom ?? ""}
                                    onChange={updateEffectiveFrom}
                                    ariaLabel="Pricing effective from"
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Effective Until
                                </label>


                                <DateField
                                    value={pricing.effectiveUntil ?? ""}
                                    minDate={pricing.effectiveFrom ?? undefined}
                                    onChange={updateEffectiveUntil}
                                    ariaLabel="Pricing effective until"
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


                                            <NumericInput



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


                                            <NumericInput



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


                            <NumericInput



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


                            <NumericInput



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

                                                        <NumericInput

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

                                                        <NumericInput

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

                                                            <NumericInput

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
                                        pkg => {


                                            return (

                                                <div

                                                    key={
                                                        pkg.id ??
                                                        pkg.name
                                                    }

                                                    className="package-summary-row"

                                                >

                                                    <div>

                                                        <span

                                                            className="package-summary-dot"

                                                        />


                                                        <span>

                                                            {
                                                                pkg.name
                                                            }

                                                            {" "}
                                                            Package

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

                                            );

                                        }
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
                                        ? (

                                            pricing
                                                .paymentConfiguration
                                                ?.advancePaymentType ===
                                            "FIXED_AMOUNT"

                                                ? `₹${Number(
                                                    pricing
                                                        .paymentConfiguration
                                                        ?.advancePaymentValue
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}`

                                                : `${Number(
                                                    pricing
                                                        .paymentConfiguration
                                                        ?.advancePaymentValue
                                                )}%`

                                        )

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

                                Create package names, prices and features that match your service offerings.
                                Customers will see only the packages you activate.
                                Cancellation rules are defined entirely by you.

                            </p>

                        </div>

                    </section>

                </div>

            </div>

        </div>

    );

};



export default VendorPricing;
