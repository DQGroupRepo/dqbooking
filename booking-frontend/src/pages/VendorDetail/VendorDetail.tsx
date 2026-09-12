import { useEffect, useState } from "react";
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

        setSelectedPackage(
            pkg
        );

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
            <h2>Loading...</h2>
        );

    }


    /*
     * =========================================
     * UI
     * =========================================
     */

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


            <VendorGallery
                vendor={vendor}
            />


            <section className="section">

                <div className="container vendor-layout">

                    <div className="vendor-detail-main">

                        <VendorInfo
                            vendor={vendor}
                        />

                        <VendorServiceDetails
                                vendor={vendor}
                            />


                        <VendorAmenities
                            vendor={vendor}
                        />


                        <VendorPackages
                            packages={vendor.packages ?? []}
                            selectedPackageId={
                                selectedPackage
                                    ? (
                                        selectedPackage.id ??
                                        selectedPackage.type
                                    )
                                    : undefined
                            }
                            onSelectPackage={
                                handlePackageSelect
                            }
                        />


                        <VendorReviews />

                    </div>


                    <BookingCard
                        vendor={vendor}

                        serviceId={
                            serviceId
                        }

                        bundles={
                            bundles
                        }

                       selectedPackage={selectedPackage}

                    />

                </div>

            </section>

        </>

    );

};

export default VendorDetail;