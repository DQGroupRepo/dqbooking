import Loader from "../../components/common/Loader";
import { useEffect, useRef, useState } from "react";
import {
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import VendorGallery from "../../components/vendor/VendorGallery";
import VendorInfo from "../../components/vendor/VendorInfo";
import VendorAmenities from "../../components/vendor/VendorAmenities";
import VendorPackages from "../../components/vendor/VendorPackages";
import VendorReviews from "../../components/vendor/VendorReviews";
import BookingCard from "../../components/vendor/VendorBookingCard";
import VendorServiceDetails
    from "../../components/vendor/VendorServiceDetails";

import VendorDetailService from "../../services/VendorDetailService";
import BundleService from "../../services/BundleService";
import type { ServicePackage } from "../../types/ServicePackage";

import type { VendorDetail as VendorDetailType } from "../../types/VendorDetail";

import type { Bundle } from "../../types/Bundle";

import "./VendorDetail.css";

const VendorDetail = () => {

    const { serviceId } = useParams();

    const location = useLocation();

    const navigate = useNavigate();


    /*
     * =========================================
     * BUNDLE NAVIGATION STATE
     * =========================================
     */

    const bundleState =
        location.state;


    const fromBundle =
        bundleState?.fromBundle === true;

     /*
         * =========================================
         * SELECTED PACKAGE
         * =========================================
         */

    const [
        selectedPackage,
        setSelectedPackage
    ] = useState<ServicePackage | null>(null);

    /*
     * =========================================
     * VENDOR
     * =========================================
     */

    const [vendor, setVendor] =
        useState<VendorDetailType | null>(null);


    /*
     * =========================================
     * BUNDLE OFFERS
     * =========================================
     */

    const [bundles, setBundles] =
        useState<Bundle[]>([]);


    const [pricingPackages, setPricingPackages] =
        useState<ServicePackage[]>([]);

    const [pricingLoading, setPricingLoading] =
        useState(false);

    const [selectedEventDate, setSelectedEventDate] =
        useState("");

    const [selectedSlotId, setSelectedSlotId] =
        useState<string | null>(null);
    const [selectedSlotResourceTypeId, setSelectedSlotResourceTypeId] =
        useState<string | null>(null);
    const [packageSelectionVersion, setPackageSelectionVersion] = useState(0);

    // Anchor for bringing date-specific package choices into view.
    const packagesSectionRef = useRef<HTMLDivElement>(null);

    const scrollToPackages = () => {
        packagesSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    const scrollToPackagesIfNeeded = () => {
        const section = packagesSectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const headingIsVisible = rect.top >= 0 && rect.top < window.innerHeight;

        if (!headingIsVisible) {
            scrollToPackages();
        }
    };
    /*
     * =========================================
     * LOAD DATA
     * =========================================
     */

    useEffect(() => {

        if (serviceId) {

            loadVendor(serviceId);

            loadBundles(serviceId);

        }

    }, [serviceId]);

    const handleEventDateChange = async (
        date: string
    ) => {

        // A package selected for a previous date
        // must never remain selected.
        setSelectedPackage(null);

        setSelectedEventDate(date);

        if (!serviceId || !date) {
            setPricingPackages([]);
            return;
        }

        try {

            setPricingLoading(true);

            const data =
                await VendorDetailService.getPricingForDate(
                    serviceId,
                    date
                );

            console.log(
                "Pricing loaded for event date:",
                data
            );

            const packages = (data.packages ?? []).map((pkg) => ({
                ...pkg,
                // Only use a backend-provided persisted ID. Never invent one in the browser.
                id: typeof pkg.id === "string" && pkg.id.trim()
                    ? pkg.id.trim()
                    : undefined
            }));

            const packagesWithoutIds = packages.filter((pkg) => !pkg.id);
            if (packagesWithoutIds.length > 0) {
                console.error(
                    "Pricing API returned packages without persisted IDs. Check PricingMapperImpl.java.",
                    packagesWithoutIds
                );
            }

            setPricingPackages(packages);

        } catch (error) {

            console.error(
                "Failed to load pricing for event date:",
                error
            );

            setPricingPackages([]);

        } finally {

            setPricingLoading(false);

            // Wait for React to render the newly loaded packages before scrolling.
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(scrollToPackages);
            });

        }
    };


    /*
     * =========================================
     * LOAD VENDOR
     * =========================================
     */

    const loadVendor = async (
        id: string
    ) => {

        try {

            const data =
                await VendorDetailService.getById(
                    id
                );

            setVendor(data);

        } catch (error) {

            console.error(
                "Failed to load vendor details:",
                error
            );

        }

    };

    const handlePackageSelect = (
        pkg: ServicePackage
    ) => {
        if (!pkg.id || !pkg.id.trim()) {
            console.error(
                "Cannot select this package because the pricing API did not return its persisted ID.",
                pkg
            );
            return;
        }

        setSelectedPackage({
            ...pkg,
            id: pkg.id.trim()
        });
        // Package changes invalidate the prior slot selection.
        setSelectedSlotId(null);
        setSelectedSlotResourceTypeId(null);
        setPackageSelectionVersion(version => version + 1);
    };


    /*
     * =========================================
     * LOAD BUNDLES
     * =========================================
     */

    const loadBundles = async (
        id: string
    ) => {

        try {

            /*
             * =========================================
             * CONTINUING EXISTING BUNDLE
             * =========================================
             */

            if (
                bundleState?.bundleId &&
                bundleState?.bundleServiceIds
            ) {

                /*
                 * We are currently travelling
                 * through a selected bundle.
                 *
                 * Do not replace the selected
                 * bundle with all available bundles.
                 */

                const selectedBundle: Bundle = {

                    id:
                        bundleState.bundleId,

                    vendorId:
                        "",

                    name:
                        bundleState.bundleName ||
                        "Selected Bundle",

                    description:
                        bundleState.bundleDescription,

                    serviceIds:
                        bundleState.bundleServiceIds,

                    discountType:
                        bundleState.bundleDiscountType,

                    discountValue:
                        bundleState.bundleDiscountValue,

                    active: true

                };


                setBundles([
                    selectedBundle
                ]);

                return;

            }


            /*
             * =========================================
             * NORMAL SERVICE PAGE
             * =========================================
             *
             * Fetch all active bundles containing
             * this service.
             */

            const data =
                await BundleService
                    .getBundlesForService(
                        id
                    );


            setBundles(data);

        } catch (error) {

            console.error(
                "Failed to load bundle offers:",
                error
            );

            setBundles([]);

        }

    };

    /*
     * =========================================
     * BACK TO BUNDLE
     * =========================================
     *
     * This button is available ONLY when the
     * customer reached this service through
     * the bundle-selection flow.
     */

    const handleBackToBundle =
        () => {

            if (!fromBundle) {
                return;
            }


            const rootServiceId =
                bundleState?.bundleRootServiceId;


            if (!rootServiceId) {

                /*
                 * Safety fallback.
                 */

                navigate(
                    "/cart"
                );

                return;

            }


            navigate(
                `/bundles/available/${rootServiceId}`,
                {
                    state: bundleState
                }
            );

        };


    /*
     * =========================================
     * LOADING
     * =========================================
     */

    if (!vendor) {

    return (
            <Loader />
        );

    }


    /*
     * =========================================
     * UI
     * =========================================
     */

    const isStayService = ["STAY", "STAYS"].includes(String(vendor?.category ?? "").trim().toUpperCase());
    const activeResourceTypes = isStayService
        ? (vendor?.resourceTypes ?? []).filter(type => type.active !== false)
        : [];
    const fixedDurationPackages = pricingPackages.filter(pkg => pkg.packageType === "FIXED_DURATION");
    const regularPricingPackages = pricingPackages.filter(pkg => pkg.packageType !== "FIXED_DURATION");
    // Stay customers select a complete package composition, not a resource type first.
    const visiblePricingPackages = regularPricingPackages;

    return (

        <>

            {fromBundle && bundleState?.bundleId && (

                <div className="bundle-back-container">

                    <button
                        type="button"
                        className="bundle-back-button"
                        onClick={handleBackToBundle}
                    >
                        ← Back to Bundle
                    </button>

                </div>

            )}


            <section className="section vendor-detail-page">
                <div className="container vendor-layout">
                    <div className="vendor-detail-main">
                        <VendorGallery vendor={vendor} />
                        <VendorInfo vendor={vendor} />
                    </div>

                    <div className="vendor-detail-main-lower">
                        <div className="vendor-detail-information">
                            <VendorServiceDetails vendor={vendor} />
                        </div>
                        <VendorAmenities vendor={vendor} />

                        <BookingCard
                            vendor={vendor}
                            serviceId={serviceId}
                            bundles={bundles}
                            selectedPackage={selectedPackage}
                            packageSelectionVersion={packageSelectionVersion}
                            selectedResourceTypeId={null}
                            onEventDateChange={handleEventDateChange}
                            onClearSelectedPackage={() => setSelectedPackage(null)}
                            onSelectedSlotChange={(slotId, resourceTypeId) => {
                                setSelectedSlotId(slotId);
                                setSelectedSlotResourceTypeId(resourceTypeId ?? null);
                                if (slotId) scrollToPackagesIfNeeded();
                            }}
                        />

                        <div ref={packagesSectionRef} className="vendor-packages-anchor">
                            {!selectedEventDate ? (
                                <div className="pricing-date-message">
                                    <div className="pricing-date-icon">📅</div>
                                    <h3>Packages &amp; Pricing</h3>
                                    <p>Select your event date to see the exact price and available packages.</p>
                                    <span>Pricing may vary depending on the date and season.</span>
                                </div>
                            ) : pricingLoading ? (
                                <div className="pricing-loading">Loading packages and prices...</div>
                            ) : pricingPackages.length === 0 ? (
                                <div className="pricing-unavailable">
                                    <div className="pricing-unavailable-icon">📅</div>
                                    <h3>Pricing Not Available</h3>
                                    <p>No packages or pricing are available for <strong>{" "}{selectedEventDate}</strong>.</p>
                                    <span>Please select another event date to check available pricing.</span>
                                </div>
                            ) : (
                                <>
                                    {visiblePricingPackages.length > 0 ? (
                                        <VendorPackages packages={visiblePricingPackages} selectedPackage={selectedPackage} selectedSlotId={selectedSlotId} selectedSlotResourceTypeId={selectedSlotResourceTypeId} isStay={isStayService} resourceTypes={activeResourceTypes} onSelectPackage={handlePackageSelect} />
                                    ) : (
                                        <div className="pricing-unavailable">
                                            <h3>No packages available</h3>
                                            <p>Please select another date or contact the vendor.</p>
                                        </div>
                                    )}
                                    {fixedDurationPackages.length > 0 && (
                                        <section className="fixed-duration-packages">
                                            <h2>Fixed-Duration Packages</h2>
                                            <p>Packages with a predefined duration and price.</p>
                                            <VendorPackages packages={fixedDurationPackages} selectedPackage={selectedPackage} selectedSlotId={selectedSlotId} selectedSlotResourceTypeId={selectedSlotResourceTypeId} isStay={isStayService} resourceTypes={activeResourceTypes} onSelectPackage={handlePackageSelect} />
                                        </section>
                                    )}
                                </>
                            )}
                        </div>
                        <VendorReviews />
                    </div>
                </div>
            </section>

        </>

    );

};

export default VendorDetail;
