import {
    useEffect,
    useMemo,
    useState
} from "react";

import AdminVendorVerificationService
    from "../../services/AdminVendorVerificationService";

import type {
    AdminVendorVerification,
    VendorVerificationStatus,
    ServiceModerationStatus
} from "../../types/AdminVendorVerification";

import "./AdminVendorVerification.css";

const AdminVendorVerification = () => {

    const [vendors, setVendors] =
        useState<AdminVendorVerification[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState<
            VendorVerificationStatus | "ALL"
        >("ALL");

    const [selectedVendor, setSelectedVendor] =
        useState<AdminVendorVerification | null>(
            null
        );

    const [actionLoading, setActionLoading] =
        useState(false);


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

            setVendors(data);

        } catch (error) {

            console.error(
                "Failed to load vendors:",
                error
            );

            setError(
                "Unable to load vendor verification data."
            );

        } finally {

            setLoading(false);

        }
    }


    const filteredVendors =
        useMemo(() => {

            return vendors.filter(vendor => {

                const searchValue =
                    search.toLowerCase();

                const matchesSearch =
                    vendor.businessName
                        .toLowerCase()
                        .includes(searchValue)
                    ||
                    vendor.ownerName
                        .toLowerCase()
                        .includes(searchValue)
                    ||
                    vendor.email
                        .toLowerCase()
                        .includes(searchValue);

                const matchesStatus =
                    statusFilter === "ALL"
                    ||
                    vendor.verificationStatus
                        === statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );

            });

        }, [
            vendors,
            search,
            statusFilter
        ]);


    const statusCount =
        (status: VendorVerificationStatus) =>
            vendors.filter(
                vendor =>
                    vendor.verificationStatus === status
            ).length;


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

            if (action === "approve") {

                await AdminVendorVerificationService
                    .approveVendor(vendorId);

            }

            if (action === "reject") {

                await AdminVendorVerificationService
                    .rejectVendor(vendorId);

            }

            if (action === "suspend") {

                await AdminVendorVerificationService
                    .suspendVendor(vendorId);

            }

            if (action === "reactivate") {

                await AdminVendorVerificationService
                    .reactivateVendor(vendorId);

            }

            await loadVendors();

            setSelectedVendor(null);

        } catch (error) {

            console.error(
                "Vendor action failed:",
                error
            );

            setError(
                "Unable to update vendor status."
            );

        } finally {

            setActionLoading(false);

        }
    }


    async function handleServiceAction(
        serviceId: string,
        action:
            | "approve"
            | "reject"
            | "suspend"
            | "reactivate"
    ) {

        try {

            setActionLoading(true);

            if (action === "approve") {

                await AdminVendorVerificationService
                    .approveService(serviceId);

            }

            if (action === "reject") {

                await AdminVendorVerificationService
                    .rejectService(serviceId);

            }

            if (action === "suspend") {

                await AdminVendorVerificationService
                    .suspendService(serviceId);

            }

            if (action === "reactivate") {

                await AdminVendorVerificationService
                    .reactivateService(serviceId);

            }

            const updatedVendor =
                await AdminVendorVerificationService
                    .getVendor(
                        selectedVendor!.vendorId
                    );

            setSelectedVendor(updatedVendor);

            setVendors(current =>
                current.map(vendor =>
                    vendor.vendorId ===
                    updatedVendor.vendorId
                        ? updatedVendor
                        : vendor
                )
            );

        } catch (error) {

            console.error(
                "Service action failed:",
                error
            );

            setError(
                "Unable to update service status."
            );

        } finally {

            setActionLoading(false);

        }
    }


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


        return null;
    }


    if (loading) {

        return (
            <section className="admin-verification-page">

                <div className="admin-page-loading">
                    Loading vendors...
                </div>

            </section>
        );
    }


    return (
        <section className="admin-verification-page">

            <div className="admin-verification-header">

                <div>

                    <h1>
                        Vendor Verification
                    </h1>

                    <p>
                        Review vendors and manage
                        their services.
                    </p>

                </div>

            </div>


            <div className="admin-verification-stats">

                <button
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
                    className={
                        statusFilter === "PENDING"
                            ? "verification-stat active"
                            : "verification-stat"
                    }
                    onClick={() =>
                        setStatusFilter("PENDING")
                    }
                >
                    <strong>
                        {statusCount("PENDING")}
                    </strong>
                    <span>
                        Pending
                    </span>
                </button>


                <button
                    className={
                        statusFilter === "APPROVED"
                            ? "verification-stat active"
                            : "verification-stat"
                    }
                    onClick={() =>
                        setStatusFilter("APPROVED")
                    }
                >
                    <strong>
                        {statusCount("APPROVED")}
                    </strong>
                    <span>
                        Approved
                    </span>
                </button>


                <button
                    className={
                        statusFilter === "SUSPENDED"
                            ? "verification-stat active"
                            : "verification-stat"
                    }
                    onClick={() =>
                        setStatusFilter("SUSPENDED")
                    }
                >
                    <strong>
                        {statusCount("SUSPENDED")}
                    </strong>
                    <span>
                        Suspended
                    </span>
                </button>


                <button
                    className={
                        statusFilter === "REJECTED"
                            ? "verification-stat active"
                            : "verification-stat"
                    }
                    onClick={() =>
                        setStatusFilter("REJECTED")
                    }
                >
                    <strong>
                        {statusCount("REJECTED")}
                    </strong>
                    <span>
                        Rejected
                    </span>
                </button>

            </div>


            <div className="admin-verification-toolbar">

                <input
                    type="text"
                    placeholder="Search vendor, owner or email..."
                    value={search}
                    onChange={e =>
                        setSearch(e.target.value)
                    }
                />

            </div>


            {error && (
                <div className="admin-verification-error">
                    {error}
                </div>
            )}


            <div className="admin-vendor-table">

                <div className="admin-vendor-table-header">

                    <span>
                        Vendor
                    </span>

                    <span>
                        Owner
                    </span>

                    <span>
                        Services
                    </span>

                    <span>
                        Status
                    </span>

                    <span>
                        Actions
                    </span>

                </div>


                {filteredVendors.length === 0 ? (

                    <div className="admin-empty-state">

                        <h3>
                            No vendors found
                        </h3>

                        <p>
                            No vendors match
                            your current filters.
                        </p>

                    </div>

                ) : (

                    filteredVendors.map(vendor => (

                        <div
                            className="admin-vendor-row"
                            key={vendor.vendorId}
                        >

                            <div>

                                <strong>
                                    {vendor.businessName}
                                </strong>

                                <span>
                                    {vendor.email}
                                </span>

                            </div>


                            <span>
                                {vendor.ownerName}
                            </span>


                            <span>
                                {vendor.services.length}
                            </span>


                            <span
                                className={`verification-badge ${vendor.verificationStatus.toLowerCase()}`}
                            >
                                {
                                    vendor.verificationStatus
                                }
                            </span>


                            <div className="admin-vendor-actions">

                                <button
                                    className="admin-action view"
                                    onClick={() =>
                                        setSelectedVendor(
                                            vendor
                                        )
                                    }
                                >
                                    View
                                </button>

                                {renderVendorActions(
                                    vendor
                                )}

                            </div>

                        </div>

                    ))
                )}

            </div>


            {selectedVendor && (

                <div
                    className="admin-modal-backdrop"
                    onClick={() =>
                        setSelectedVendor(null)
                    }
                >

                    <div
                        className="admin-vendor-modal"
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

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
                                onClick={() =>
                                    setSelectedVendor(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="admin-modal-details">

                            <div>
                                <span>Email</span>
                                <strong>
                                    {
                                        selectedVendor.email
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Phone</span>
                                <strong>
                                    {
                                        selectedVendor.phone
                                            || "—"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Location</span>
                                <strong>
                                    {
                                        selectedVendor.city
                                            || "—"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Status</span>
                                <strong
                                    className={`verification-badge ${selectedVendor.verificationStatus.toLowerCase()}`}
                                >
                                    {
                                        selectedVendor
                                            .verificationStatus
                                    }
                                </strong>
                            </div>

                        </div>


                        <div className="admin-modal-services">

                            <div className="admin-modal-section-header">

                                <div>

                                    <h3>
                                        Services
                                    </h3>

                                    <p>
                                        Manage services
                                        belonging to this vendor.
                                    </p>

                                </div>

                            </div>


                            {selectedVendor.services.length === 0 ? (

                                <div className="admin-empty-state">
                                    No services found.
                                </div>

                            ) : (

                                selectedVendor.services.map(
                                    service => (

                                        <div
                                            className="admin-service-row"
                                            key={
                                                service.serviceId
                                            }
                                        >

                                            <div>

                                                <strong>
                                                    {
                                                        service.serviceName
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        service.category
                                                            || "—"
                                                    }
                                                </span>

                                            </div>


                                            <span
                                                className={`verification-badge ${service.moderationStatus.toLowerCase()}`}
                                            >
                                                {
                                                    service.moderationStatus
                                                }
                                            </span>


                                            <div>

                                                {renderServiceActions(
                                                    service
                                                )}

                                            </div>

                                        </div>

                                    )
                                )
                            )}

                        </div>

                    </div>

                </div>

            )}

        </section>
    );
};

export default AdminVendorVerification;