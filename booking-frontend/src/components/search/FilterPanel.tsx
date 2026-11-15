import { useEffect } from "react";
import type { VendorListing } from "../../types/VendorListing";
import "./FilterPanel.css";

export type BudgetBand = "under25" | "25to50" | "over50";

interface FilterPanelProps {
    vendors: VendorListing[];
    selectedBudgets: BudgetBand[];
    onBudgetsChange: (value: BudgetBand[]) => void;
    selectedRatings: number[];
    onRatingsChange: (value: number[]) => void;
    selectedLocations: string[];
    onLocationsChange: (value: string[]) => void;
    onClear: () => void;
    isOpen: boolean;
    onOpenChange: (value: boolean) => void;
}

const FilterPanel = ({
    vendors,
    selectedBudgets,
    onBudgetsChange,
    selectedRatings,
    onRatingsChange,
    selectedLocations,
    onLocationsChange,
    onClear,
    isOpen,
    onOpenChange
}: FilterPanelProps) => {
    const locations = Array.from(new Set(
        vendors.map((vendor) => vendor.city?.trim()).filter((city): city is string => Boolean(city))
    )).sort((a, b) => a.localeCompare(b));

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onOpenChange(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onOpenChange]);

    const toggle = <T,>(items: T[], item: T, setter: (value: T[]) => void) => {
        setter(items.includes(item) ? items.filter((value) => value !== item) : [...items, item]);
    };

    const content = (
        <>
            <div className="filter-panel__heading">
                <div>
                    <h2>Filters</h2>
                    <p>Refine your search</p>
                </div>
                <button type="button" className="filter-panel__clear" onClick={onClear}>Clear all</button>
            </div>

            <div className="filter-panel__groups">
                <section className="filter-group">
                    <h3>Budget</h3>
                    {([
                        ["under25", "Below ₹25,000"],
                        ["25to50", "₹25,000 – ₹50,000"],
                        ["over50", "Above ₹50,000"]
                    ] as [BudgetBand, string][]).map(([value, label]) => (
                        <label className="filter-option" key={value}>
                            <input type="checkbox" checked={selectedBudgets.includes(value)} onChange={() => toggle(selectedBudgets, value, onBudgetsChange)} />
                            <span>{label}</span>
                        </label>
                    ))}
                </section>

                <section className="filter-group">
                    <h3>Rating</h3>
                    {[4, 3].map((value) => (
                        <label className="filter-option" key={value}>
                            <input type="checkbox" checked={selectedRatings.includes(value)} onChange={() => toggle(selectedRatings, value, onRatingsChange)} />
                            <span>{value}★ &amp; above</span>
                        </label>
                    ))}
                </section>

                <section className="filter-group filter-group--locations">
                    <h3>Location</h3>
                    {locations.length ? locations.map((location) => (
                        <label className="filter-option" key={location}>
                            <input type="checkbox" checked={selectedLocations.includes(location)} onChange={() => toggle(selectedLocations, location, onLocationsChange)} />
                            <span>{location}</span>
                        </label>
                    )) : <p className="filter-empty">Locations will appear when results are loaded.</p>}
                </section>
            </div>

            <div className="filter-panel__footer">
                <button type="button" className="filter-panel__apply" onClick={() => onOpenChange(false)}>Show results</button>
            </div>
        </>
    );

    return (
        <>
            <button type="button" className="filter-mobile-trigger" onClick={() => onOpenChange(true)} aria-expanded={isOpen}>
                <span>☷ Filters</span>
                {(selectedBudgets.length + selectedRatings.length + selectedLocations.length) > 0 && (
                    <span className="filter-mobile-count">{selectedBudgets.length + selectedRatings.length + selectedLocations.length}</span>
                )}
            </button>
            {isOpen && <button type="button" className="filter-backdrop" aria-label="Close filters" onClick={() => onOpenChange(false)} />}
            <aside className={`filter-panel ${isOpen ? "filter-panel--open" : ""}`} aria-label="Vendor filters">
                <div className="filter-panel__mobile-top">
                    <span>Filter vendors</span>
                    <button type="button" onClick={() => onOpenChange(false)} aria-label="Close filters">×</button>
                </div>
                {content}
            </aside>
        </>
    );
};

export default FilterPanel;
