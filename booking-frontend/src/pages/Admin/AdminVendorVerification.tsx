import {
    useEffect,
    useMemo,
    useState
} from "react";

import AdminVendorVerificationService, {
    type DiscoveryTag
} from "../../services/AdminVendorVerificationService";

import type {
    AdminVendorVerification,
    VendorVerificationStatus,
    ServiceModerationStatus
} from "../../types/AdminVendorVerification";

import "./AdminVendorVerification.css";


const discoveryOptions: {
    key: DiscoveryTag;
    label: string;
}[] = [

    {
        key: "FEATURED",
        label: "Featured"
    },

    {
        key: "TRENDING_NOW",
        label: "Trending Now"
    },

    {
        key: "MOST_BOOKED",
        label: "Most Booked"
    },

    {
        key: "POPULAR_HALL",
        label: "Popular Hall"
    },

    {
        key: "TOP_BRIDAL_MAKEUP",
        label: "Top Bridal Makeup"
    },

    {
        key: "PROFESSIONAL_PHOTOGRAPHY",
        label: "Professional Photography"
    },

    {
        key: "WEDDING_VIDEOGRAPHY",
        label: "Wedding Videography"
    }

];


const AdminVendorVerification = () => {


    const [
        vendors,
        setVendors
    ] =
        useState<AdminVendorVerification[]>([]);


    const [
        loading,
        setLoading
    ] =
        useState(true);


    const [
        error,
        setError
    ] =
        useState("");


    const [
        search,
        setSearch
    ] =
        useState("");


    const [
        statusFilter,
        setStatusFilter
    ] =
        useState<
            VendorVerificationStatus | "ALL"
        >("ALL");


    const [
        selectedVendor,
        setSelectedVendor
    ] =
        useState<
            AdminVendorVerification | null
        >(null);


    const [
        actionLoading,
        setActionLoading
    ] =
        useState(false);


    /*
     * =========================================
     * LOAD VENDORS
     * =========================================
     */

    useEffect(() => {

        loadVendors();

    }, []);


    async function loadVendors() {

        try {

            setLoading(true);

            setError("");


            const data =
                await AdminVendorVerificationService
                    .getVendors();


            setVendors(
                data
            );

        }
        catch (error) {

            console.error(
                "Failed to load vendors:",
                error
            );


            setError(
                "Unable to load vendor verification data."
            );

        }
        finally {

            setLoading(false);

        }

    }


    /*
     * =========================================
     * REFRESH SELECTED VENDOR
     * =========================================
     */

    async function refreshSelectedVendor(
        vendorId: string
    ) {

        const updatedVendor =
            await AdminVendorVerificationService
                .getVendor(
                    vendorId
                );


        setSelectedVendor(
            updatedVendor
        );


        setVendors(
            current =>
                current.map(
                    vendor =>

                        vendor.vendorId ===
                        updatedVendor.vendorId

                            ? updatedVendor

                            : vendor
                )
        );

    }


    /*
     * =========================================
     * FILTER VENDORS
     * =========================================
     */

    const filteredVendors =
        useMemo(() => {

            const searchValue =
                search
                    .toLowerCase()
                    .trim();


            return vendors.filter(
                vendor => {


                    const matchesSearch =

                        vendor.businessName
                            .toLowerCase()
                            .includes(
                                searchValue
                            )

                        ||

                        vendor.ownerName
                            .toLowerCase()
                            .includes(
                                searchValue
                            )

                        ||

                        vendor.email
                            .toLowerCase()
                            .includes(
                                searchValue
                            );


                    const matchesStatus =

                        statusFilter === "ALL"

                        ||

                        vendor.verificationStatus ===
                        statusFilter;


                    return (

                        matchesSearch

                        &&

                        matchesStatus

                    );

                }
            );

        }, [

            vendors,
            search,
            statusFilter

        ]);


    /*
     * =========================================
     * STATUS COUNT
     * =========================================
     */

    const statusCount =
        (
            status:
                VendorVerificationStatus
        ) =>

            vendors.filter(
                vendor =>

                    vendor.verificationStatus ===
                    status
            ).length;


    /*
     * =========================================
     * VENDOR ACTION
     * =========================================
     */

    async function handleVendorAction(

        vendorId: string,

        action:
            | "approve"
            | "reject"
            | "suspend"
            | "reactivate"

    ) {

        try {

            setActionLoading(true);

            setError("");


            switch (
                action
            ) {

                case "approve":

                    await AdminVendorVerificationService
                        .approveVendor(
                            vendorId
                        );

                    break;


                case "reject":

                    await AdminVendorVerificationService
                        .rejectVendor(
                            vendorId
                        );

                    break;


                case "suspend":

                    await AdminVendorVerificationService
                        .suspendVendor(
                            vendorId
                        );

                    break;


                case "reactivate":

                    await AdminVendorVerificationService
                        .reactivateVendor(
                            vendorId
                        );

                    break;

            }


            await loadVendors();


            setSelectedVendor(
                null
            );

        }
        catch (error) {

            console.error(
                "Vendor action failed:",
                error
            );


            setError(
                "Unable to update vendor status."
            );

        }
        finally {

            setActionLoading(
                false
            );

        }

    }


    /*
     * =========================================
     * SERVICE ACTION
     * =========================================
     */

    async function handleServiceAction(

        serviceId: string,

        action:
            | "approve"
            | "reject"
            | "suspend"
            | "reactivate"

    ) {

        if (
            !selectedVendor
        ) {

            return;

        }


        try {

            setActionLoading(true);

            setError("");


            switch (
                action
            ) {

                case "approve":

                    await AdminVendorVerificationService
                        .approveService(
                            serviceId
                        );

                    break;


                case "reject":

                    await AdminVendorVerificationService
                        .rejectService(
                            serviceId
                        );

                    break;


                case "suspend":

                    await AdminVendorVerificationService
                        .suspendService(
                            serviceId
                        );

                    break;


                case "reactivate":

                    await AdminVendorVerificationService
                        .reactivateService(
                            serviceId
                        );

                    break;

            }


            await refreshSelectedVendor(
                selectedVendor.vendorId
            );

        }
        catch (error) {

            console.error(
                "Service action failed:",
                error
            );


            setError(
                "Unable to update service status."
            );

        }
        finally {

            setActionLoading(
                false
            );

        }

    }


    /*
     * =========================================
     * DISCOVERY TAG CHANGE
     * =========================================
     */

    async function handleDiscoveryTagChange(

        serviceId: string,

        tag: DiscoveryTag,

        checked: boolean

    ) {

        if (
            !selectedVendor
        ) {

            return;

        }


        try {

            setActionLoading(true);

            setError("");


            const service =
                selectedVendor.services.find(

                    item =>

                        item.serviceId ===
                        serviceId

                );


            if (
                !service
            ) {

                return;

            }


            const currentTags =
                (
                    service.discoveryTags ??
                    []
                ) as DiscoveryTag[];


            const updatedTags:
                DiscoveryTag[] =

                checked

                    ?

                    Array.from(
                        new Set<DiscoveryTag>([
                            ...currentTags,
                            tag
                        ])
                    )

                    :

                    currentTags.filter(
                        existingTag =>

                            existingTag !==
                            tag
                    );


            await AdminVendorVerificationService
                .updateServiceDiscoveryTags(

                    serviceId,

                    updatedTags

                );


            await refreshSelectedVendor(
                selectedVendor.vendorId
            );

        }
        catch (error) {

            console.error(
                "Failed to update discovery tags:",
                error
            );


            setError(
                "Unable to update discovery settings."
            );

        }
        finally {

            setActionLoading(
                false
            );

        }

    }


    /*
     * =========================================
     * VENDOR ACTION BUTTONS
     * =========================================
     */

    function renderVendorActions(
        vendor: AdminVendorVerification
    ) {

        if (
            vendor.verificationStatus ===
            "PENDING"
        ) {

            return (

                <>

                    <button
                        type="button"
                        className="admin-action approve"
                        onClick={() =>
                            handleVendorAction(
                                vendor.vendorId,
                                "approve"
                            )
                        }
                        disabled={actionLoading}
                    >

                        Approve

                    </button>


                    <button
                        type="button"
                        className="admin-action reject"
                        onClick={() =>
                            handleVendorAction(
                                vendor.vendorId,
                                "reject"
                            )
                        }
                        disabled={actionLoading}
                    >

                        Reject

                    </button>

                </>

            );

        }


        if (
            vendor.verificationStatus ===
            "APPROVED"
        ) {

            return (

                <button
                    type="button"
                    className="admin-action suspend"
                    onClick={() =>
                        handleVendorAction(
                            vendor.vendorId,
                            "suspend"
                        )
                    }
                    disabled={actionLoading}
                >

                    Suspend

                </button>

            );

        }


        if (
            vendor.verificationStatus ===
            "SUSPENDED"
        ) {

            return (

                <button
                    type="button"
                    className="admin-action approve"
                    onClick={() =>
                        handleVendorAction(
                            vendor.vendorId,
                            "reactivate"
                        )
                    }
                    disabled={actionLoading}
                >

                    Reactivate

                </button>

            );

        }


        return null;

    }


    /*
     * =========================================
     * SERVICE ACTION BUTTONS
     * =========================================
     */

    function renderServiceActions(
        service: {
            serviceId: string;
            moderationStatus:
                ServiceModerationStatus;
        }
    ) {

        if (
            service.moderationStatus ===
            "PENDING"
        ) {

            return (

                <>

                    <button
                        type="button"
                        className="admin-action approve"
                        onClick={() =>
                            handleServiceAction(
                                service.serviceId,
                                "approve"
                            )
                        }
                        disabled={actionLoading}
                    >
                        Approve
                    </button>


                    <button
                        type="button"
                        className="admin-action reject"
                        onClick={() =>
                            handleServiceAction(
                                service.serviceId,
                                "reject"
                            )
                        }
                        disabled={actionLoading}
                    >
                        Reject
                    </button>

                </>

            );

        }


        if (
            service.moderationStatus ===
            "APPROVED"
        ) {

            return (

                <button
                    type="button"
                    className="admin-action suspend"
                    onClick={() =>
                        handleServiceAction(
                            service.serviceId,
                            "suspend"
                        )
                    }
                    disabled={actionLoading}
                >
                    Suspend
                </button>

            );

        }


        if (
            service.moderationStatus ===
            "SUSPENDED"
        ) {

            return (

                <button
                    type="button"
                    className="admin-action approve"
                    onClick={() =>
                        handleServiceAction(
                            service.serviceId,
                            "reactivate"
                        )
                    }
                    disabled={actionLoading}
                >
                    Reactivate
                </button>

            );

        }


        /*
         * REJECTED
         *
         * Admin can approve the service
         * again if it becomes acceptable.
         */

        if (
            service.moderationStatus ===
            "REJECTED"
        ) {

            return (

                <button
                    type="button"
                    className="admin-action approve"
                    onClick={() =>
                        handleServiceAction(
                            service.serviceId,
                            "approve"
                        )
                    }
                    disabled={actionLoading}
                >
                    Approve
                </button>

            );

        }


        return null;

    }


    /*
     * =========================================
     * LOADING
     * =========================================
     */

    if (
        loading
    ) {

        return (

            <section className="admin-verification-page">

                <div className="admin-page-loading">

                    Loading vendors...

                </div>

            </section>

        );

    }


    /*
     * =========================================
     * PAGE
     * =========================================
     */

    return (

        <section className="admin-verification-page">


            {/* HEADER */}

            <div className="admin-verification-header">

                <div>

                    <h1>
                        Vendor Verification
                    </h1>

                    <p>
                        Review vendors, approve services
                        and control homepage discovery.
                    </p>

                </div>

            </div>


            {/* STATUS STATS */}

            <div className="admin-verification-stats">


                <button
                    type="button"
                    className={
                        statusFilter === "ALL"
                            ? "verification-stat active"
                            : "verification-stat"
                    }
                    onClick={() =>
                        setStatusFilter("ALL")
                    }
                >

                    <strong>
                        {vendors.length}
                    </strong>

                    <span>
                        All Vendors
                    </span>

                </button>


                <button
                    type="button"
                    className={
                        statusFilter === "PENDING"
                            ? "verification-stat active"
                            : "verification-stat"
                    }
                    onClick={() =>
                        setStatusFilter(
                            "PENDING"
                        )
                    }
                >

                    <strong>
                        {
                            statusCount(
                                "PENDING"
                            )
                        }
                    </strong>

                    <span>
                        Pending
                    </span>

                </button>


                <button
                    type="button"
                    className={
                        statusFilter === "APPROVED"
                            ? "verification-stat active"
                            : "verification-stat"
                    }
                    onClick={() =>
                        setStatusFilter(
                            "APPROVED"
                        )
                    }
                >

                    <strong>
                        {
                            statusCount(
                                "APPROVED"
                            )
                        }
                    </strong>

                    <span>
                        Approved
                    </span>

                </button>


                <button
                    type="button"
                    className={
                        statusFilter === "SUSPENDED"
                            ? "verification-stat active"
                            : "verification-stat"
                    }
                    onClick={() =>
                        setStatusFilter(
                            "SUSPENDED"
                        )
                    }
                >

                    <strong>
                        {
                            statusCount(
                                "SUSPENDED"
                            )
                        }
                    </strong>

                    <span>
                        Suspended
                    </span>

                </button>


                <button
                    type="button"
                    className={
                        statusFilter === "REJECTED"
                            ? "verification-stat active"
                            : "verification-stat"
                    }
                    onClick={() =>
                        setStatusFilter(
                            "REJECTED"
                        )
                    }
                >

                    <strong>
                        {
                            statusCount(
                                "REJECTED"
                            )
                        }
                    </strong>

                    <span>
                        Rejected
                    </span>

                </button>

            </div>


            {/* SEARCH */}

            <div className="admin-verification-toolbar">

                <input
                    type="text"
                    placeholder="Search vendor, owner or email..."
                    value={search}
                    onChange={e =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

            </div>


            {/* ERROR */}

            {
                error && (

                    <div className="admin-verification-error">

                        {error}

                    </div>

                )
            }


            {/* VENDOR TABLE */}

            <div className="admin-vendor-table">


                <div className="admin-vendor-table-header">

                    <span>Vendor</span>

                    <span>Owner</span>

                    <span>Services</span>

                    <span>Status</span>

                    <span>Actions</span>

                </div>


                {
                    filteredVendors.length === 0

                        ?

                        (

                            <div className="admin-empty-state">

                                <h3>
                                    No vendors found
                                </h3>

                                <p>
                                    No vendors match your
                                    current filters.
                                </p>

                            </div>

                        )

                        :

                        (

                            filteredVendors.map(
                                vendor => (

                                    <div
                                        className="admin-vendor-row"
                                        key={
                                            vendor.vendorId
                                        }
                                    >

                                        <div>

                                            <strong>

                                                {
                                                    vendor.businessName
                                                }

                                            </strong>


                                            <span>

                                                {
                                                    vendor.email
                                                }

                                            </span>

                                        </div>


                                        <span>

                                            {
                                                vendor.ownerName
                                            }

                                        </span>


                                        <span>

                                            {
                                                vendor.services.length
                                            }

                                        </span>


                                        <span
                                            className={
                                                `verification-badge ${
                                                    vendor
                                                        .verificationStatus
                                                        .toLowerCase()
                                                }`
                                            }
                                        >

                                            {
                                                vendor
                                                    .verificationStatus
                                            }

                                        </span>


                                        <div className="admin-vendor-actions">


                                            <button
                                                type="button"
                                                className="admin-action view"
                                                onClick={() =>
                                                    setSelectedVendor(
                                                        vendor
                                                    )
                                                }
                                            >

                                                View

                                            </button>


                                            {
                                                renderVendorActions(
                                                    vendor
                                                )
                                            }

                                        </div>

                                    </div>

                                )
                            )

                        )
                }

            </div>


            {/* VENDOR MODAL */}

            {
                selectedVendor && (

                    <div
                        className="admin-modal-backdrop"
                        onClick={() =>
                            setSelectedVendor(
                                null
                            )
                        }
                    >

                        <div
                            className="admin-vendor-modal"
                            onClick={e =>
                                e.stopPropagation()
                            }
                        >


                            {/* MODAL HEADER */}

                            <div className="admin-modal-header">

                                <div>

                                    <h2>

                                        {
                                            selectedVendor
                                                .businessName
                                        }

                                    </h2>


                                    <p>

                                        {
                                            selectedVendor
                                                .ownerName
                                        }

                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedVendor(
                                            null
                                        )
                                    }
                                    aria-label="Close"
                                >

                                    ×

                                </button>

                            </div>


                            {/* VENDOR DETAILS */}

                            <div className="admin-modal-details">


                                <div>

                                    <span>
                                        Email
                                    </span>

                                    <strong>

                                        {
                                            selectedVendor
                                                .email
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Phone
                                    </span>

                                    <strong>

                                        {
                                            selectedVendor
                                                .phone || "—"
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Location
                                    </span>

                                    <strong>

                                        {
                                            selectedVendor
                                                .city || "—"
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Status
                                    </span>

                                    <strong
                                        className={
                                            `verification-badge ${
                                                selectedVendor
                                                    .verificationStatus
                                                    .toLowerCase()
                                            }`
                                        }
                                    >

                                        {
                                            selectedVendor
                                                .verificationStatus
                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* SERVICES */}

                            <div className="admin-modal-services">


                                <div className="admin-modal-section-header">

                                    <div>

                                        <h3>
                                            Services
                                        </h3>

                                        <p>
                                            Approve services and choose
                                            where approved services appear
                                            on the EventNest homepage.
                                        </p>

                                    </div>

                                </div>


                                {
                                    selectedVendor.services
                                        .length === 0

                                        ?

                                        (

                                            <div className="admin-empty-state">

                                                No services found.

                                            </div>

                                        )

                                        :

                                        (

                                            selectedVendor.services.map(
                                                service => (

                                                    <div
                                                        className="admin-service-card"
                                                        key={
                                                            service.serviceId
                                                        }
                                                    >


                                                        {/* SERVICE TOP */}

                                                        <div className="admin-service-card-top">


                                                            <div className="admin-service-info">

                                                                <h4>

                                                                    {
                                                                        service
                                                                            .serviceName
                                                                    }

                                                                </h4>


                                                                <span>

                                                                    {
                                                                        service
                                                                            .category
                                                                            || "—"
                                                                    }

                                                                </span>

                                                            </div>


                                                            <div className="admin-service-moderation">


                                                                <div className="admin-moderation-status">

                                                                    <span>
                                                                        Status
                                                                    </span>


                                                                    <strong
                                                                        className={
                                                                            `verification-badge ${
                                                                                service
                                                                                    .moderationStatus
                                                                                    .toLowerCase()
                                                                            }`
                                                                        }
                                                                    >

                                                                        {
                                                                            service
                                                                                .moderationStatus
                                                                        }

                                                                    </strong>

                                                                </div>


                                                                <div className="admin-moderation-actions">

                                                                    {
                                                                        renderServiceActions(
                                                                            service
                                                                        )
                                                                    }

                                                                </div>

                                                            </div>

                                                        </div>


                                                        {/* DISCOVERY */}

                                                        <div className="admin-discovery-section">


                                                            <div className="admin-discovery-section-header">


                                                                <div>

                                                                    <h5>
                                                                        Show on EventNest
                                                                    </h5>


                                                                    <p>
                                                                        Select where this approved
                                                                        service should appear on
                                                                        the customer homepage.
                                                                    </p>

                                                                </div>


                                                                {
                                                                    service
                                                                        .moderationStatus !==
                                                                    "APPROVED"

                                                                    &&

                                                                    (

                                                                        <span className="discovery-locked-message">

                                                                            Approve the service
                                                                            before enabling discovery.

                                                                        </span>

                                                                    )
                                                                }

                                                            </div>


                                                            <div className="admin-discovery-options">


                                                                {
                                                                    discoveryOptions.map(
                                                                        option => {


                                                                            const isSelected =
                                                                                (
                                                                                    service
                                                                                        .discoveryTags
                                                                                    ?? []
                                                                                ).includes(
                                                                                    option.key
                                                                                );


                                                                            const isDisabled =

                                                                                actionLoading

                                                                                ||

                                                                                service
                                                                                    .moderationStatus !==
                                                                                "APPROVED";


                                                                            return (

                                                                                <button
                                                                                    key={
                                                                                        option.key
                                                                                    }
                                                                                    type="button"
                                                                                    className={
                                                                                        isSelected

                                                                                            ? "discovery-option selected"

                                                                                            : "discovery-option"
                                                                                    }
                                                                                    disabled={
                                                                                        isDisabled
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleDiscoveryTagChange(
                                                                                            service.serviceId,
                                                                                            option.key,
                                                                                            !isSelected
                                                                                        )
                                                                                    }
                                                                                >

                                                                                    <span className="discovery-check">

                                                                                        {
                                                                                            isSelected
                                                                                                ? "✓"
                                                                                                : "+"
                                                                                        }

                                                                                    </span>


                                                                                    {
                                                                                        option.label
                                                                                    }

                                                                                </button>

                                                                            );

                                                                        }
                                                                    )
                                                                }

                                                            </div>

                                                        </div>

                                                    </div>

                                                )
                                            )

                                        )
                                }

                            </div>

                        </div>

                    </div>

                )
            }

        </section>

    );

};


export default AdminVendorVerification;