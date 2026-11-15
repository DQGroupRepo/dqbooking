import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterPanel, { type BudgetBand } from "../../components/search/FilterPanel";
import VendorCard from "../../components/vendor/VendorCard";
import Pagination from "../../components/vendor/Pagination";
import VendorListingService from "../../services/VendorListingService";
import type { VendorListing } from "../../types/VendorListing";
import "./CategoryListing.css";

const CATEGORY_SCROLL_KEY = "eventnest-category-listing-scroll";
const PAGE_SIZE = 6;
type SortMode = "popular" | "price-low" | "price-high" | "rating";

const CategoryListing = () => {
    const [vendors, setVendors] = useState<VendorListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const category = searchParams.get("category") ?? "";
    const categoryTag = searchParams.get("categoryTag") ?? "";
    const location = searchParams.get("location") ?? "";

    const [selectedBudgets, setSelectedBudgets] = useState<BudgetBand[]>([]);
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [sortMode, setSortMode] = useState<SortMode>("popular");
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        let active = true;
        async function loadListings() {
            setLoading(true);
            try {
                const response = await VendorListingService.getListings(category, location, categoryTag);
                if (active) setVendors(Array.isArray(response) ? response : []);
            } catch (error) {
                console.error("Failed to load listings:", error);
                if (active) setVendors([]);
            } finally {
                if (active) setLoading(false);
            }
        }
        void loadListings();
        return () => { active = false; };
    }, [category, categoryTag, location]);

    useEffect(() => () => {
        sessionStorage.setItem(CATEGORY_SCROLL_KEY, JSON.stringify({ top: window.scrollY, left: window.scrollX }));
    }, []);

    const clearFilters = useCallback(() => {
        setSelectedBudgets([]);
        setSelectedRatings([]);
        setSelectedLocations([]);
        setPage(1);
    }, []);

    const filteredVendors = useMemo(() => {
        const byFilters = vendors.filter((vendor) => {
            const price = Number(vendor.startingPrice);
            const matchesBudget = selectedBudgets.length === 0 || selectedBudgets.some((band) => {
                if (!Number.isFinite(price)) return false;
                if (band === "under25") return price < 25000;
                if (band === "25to50") return price >= 25000 && price <= 50000;
                return price > 50000;
            });
            const minimumRating = selectedRatings.length ? Math.min(...selectedRatings) : 0;
            const matchesRating = Number(vendor.rating ?? 0) >= minimumRating;
            const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(vendor.city ?? "");
            return matchesBudget && matchesRating && matchesLocation;
        });

        return [...byFilters].sort((a, b) => {
            if (sortMode === "price-low") return Number(a.startingPrice ?? Infinity) - Number(b.startingPrice ?? Infinity);
            if (sortMode === "price-high") return Number(b.startingPrice ?? 0) - Number(a.startingPrice ?? 0);
            if (sortMode === "rating") return Number(b.rating ?? 0) - Number(a.rating ?? 0);
            return Number(b.rating ?? 0) - Number(a.rating ?? 0)
                || Number(b.reviewCount ?? 0) - Number(a.reviewCount ?? 0);
        });
    }, [vendors, selectedBudgets, selectedRatings, selectedLocations, sortMode]);

    useEffect(() => { setPage(1); }, [selectedBudgets, selectedRatings, selectedLocations, sortMode]);

    const pageCount = Math.max(1, Math.ceil(filteredVendors.length / PAGE_SIZE));
    const visibleVendors = filteredVendors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <section className="results-section">
            <div className="container results-layout">
                <FilterPanel
                    vendors={vendors}
                    selectedBudgets={selectedBudgets}
                    onBudgetsChange={setSelectedBudgets}
                    selectedRatings={selectedRatings}
                    onRatingsChange={setSelectedRatings}
                    selectedLocations={selectedLocations}
                    onLocationsChange={setSelectedLocations}
                    onClear={clearFilters}
                    isOpen={filtersOpen}
                    onOpenChange={setFiltersOpen}
                />

                <div className="results-content">
                    <div className="results-header">
                        <div>
                            <h2>{filteredVendors.length} {filteredVendors.length === 1 ? "Vendor" : "Vendors"} Found</h2>
                            {(selectedBudgets.length + selectedRatings.length + selectedLocations.length) > 0 && (
                                <button type="button" className="results-clear-link" onClick={clearFilters}>Clear filters</button>
                            )}
                        </div>
                        <label className="results-sort">
                            <span>Sort by</span>
                            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
                                <option value="popular">Popularity</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Rating</option>
                            </select>
                        </label>
                    </div>

                    {loading ? (
                        <div className="results-state" role="status">Loading vendors…</div>
                    ) : visibleVendors.length ? (
                        <>
                            <div className="vendor-results">
                                {visibleVendors.map((vendor) => <VendorCard key={vendor.serviceId} vendor={vendor} />)}
                            </div>
                            {pageCount > 1 && <Pagination currentPage={page} totalPages={pageCount} onPageChange={setPage} />}
                        </>
                    ) : (
                        <div className="results-state">
                            <h3>No vendors match these filters</h3>
                            <p>Try changing your budget, rating or location selection.</p>
                            <button type="button" onClick={clearFilters}>Clear all filters</button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CategoryListing;
