import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

import SearchBar from "../../components/search/SearchBar";
import FilterPanel from "../../components/search/FilterPanel";
import VendorCard from "../../components/vendor/VendorCard";
import Pagination from "../../components/vendor/Pagination";

import VendorListingService from "../../services/VendorListingService";

import type { VendorListing } from "../../types/VendorListing";

import "./CategoryListing.css";

const CategoryListing = () => {

    const [vendors, setVendors] =
        useState<VendorListing[]>([]);

    const [searchParams] = useSearchParams();

    const category =
        searchParams.get("category") ?? "";

    useEffect(() => {

        loadListings();

    }, [category]);

    async function loadListings() {

        const response =
            await VendorListingService.getListings(
                category
            );

        setVendors(response);

    }

    return (

        <>
            <SearchBar />

            <section className="results-section">

                <div className="container results-layout">

                    <FilterPanel />

                    <div className="results-content">

                        <div className="results-header">

                            <h2>
                                {vendors.length} Vendors Found
                            </h2>

                            <select>

                                <option>Sort by Popularity</option>

                                <option>Price Low to High</option>

                                <option>Rating</option>

                            </select>

                        </div>

                        <div className="vendor-results">

                            {vendors.map(vendor => (

                                <VendorCard
                                    key={vendor.id}
                                    vendor={vendor}
                                />

                            ))}

                            <Pagination />

                        </div>

                    </div>

                </div>

            </section>

        </>

    );

};

export default CategoryListing;