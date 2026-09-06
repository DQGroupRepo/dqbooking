import {
    useSearchParams
} from "react-router-dom";

import {
    useEffect,
    useState
} from "react";

import FilterPanel
    from "../../components/search/FilterPanel";

import VendorCard
    from "../../components/vendor/VendorCard";

import Pagination
    from "../../components/vendor/Pagination";

import VendorListingService
    from "../../services/VendorListingService";

import type {
    VendorListing
} from "../../types/VendorListing";

import "./CategoryListing.css";


/*
 * =========================================
 * SCROLL STORAGE KEY
 * =========================================
 */

const CATEGORY_SCROLL_KEY =
    "eventnest-category-listing-scroll";


const CategoryListing = () => {


    const [
        vendors,
        setVendors
    ] =
        useState<
            VendorListing[]
        >([]);


    const [
        searchParams
    ] =
        useSearchParams();


    const category =
        searchParams.get(
            "category"
        ) ?? "";


    /*
     * =========================================
     * LOAD LISTINGS
     * =========================================
     */

    useEffect(() => {

        loadListings();

    }, [

        category

    ]);


    async function loadListings() {

        try {

            const response =
                await VendorListingService
                    .getListings(
                        category
                    );


            setVendors(
                response
            );

        }
        catch (
            error
        ) {

            console.error(
                "Failed to load listings:",
                error
            );


            setVendors([]);

        }

    }


    /*
     * =========================================
     * SAVE SCROLL POSITION
     * =========================================
     *
     * When the user leaves this page,
     * remember exactly where they were.
     */

    useEffect(() => {

        return () => {

            const scrollPosition = {

                top:
                    window.scrollY,

                left:
                    window.scrollX

            };


            sessionStorage.setItem(

                CATEGORY_SCROLL_KEY,

                JSON.stringify(
                    scrollPosition
                )

            );

        };

    }, []);


    return (

        <section className="results-section">


            <div className="container results-layout">


                {/* =================================
                    FILTER PANEL
                ================================= */}

                <FilterPanel />


                {/* =================================
                    RESULTS CONTENT
                ================================= */}

                <div className="results-content">


                    {/* =============================
                        HEADER
                    ============================= */}

                    <div className="results-header">


                        <h2>

                            {
                                vendors.length
                            }

                            {" "}

                            Vendors Found

                        </h2>


                        <select>

                            <option>
                                Sort by Popularity
                            </option>


                            <option>
                                Price Low to High
                            </option>


                            <option>
                                Rating
                            </option>


                        </select>


                    </div>


                    {/* =============================
                        VENDOR RESULTS
                    ============================= */}

                    <div className="vendor-results">


                        {
                            vendors.map(
                                vendor => (

                                    <VendorCard

                                        key={
                                            vendor.serviceId
                                        }

                                        vendor={
                                            vendor
                                        }

                                    />

                                )
                            )
                        }


                        <Pagination />


                    </div>


                </div>


            </div>


        </section>

    );

};


export default CategoryListing;