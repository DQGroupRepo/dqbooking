import { useRef, useState } from "react";
import "./VendorPackages.css";
import type { ServicePackage } from "../../types/ServicePackage";

type CateringDish = {
    id?: string;
    menuItemId?: string;
    dishId?: string;
    name: string;
    category?: string;
    foodType?: string;
    custom?: boolean;
};

type CateringMenuData = {
    vegetarianSelectionLimit?: number;
    nonVegetarianSelectionLimit?: number;
    soupSelectionLimit?: number;
    dessertSelectionLimit?: number;
    vegetarianDishes?: CateringDish[];
    nonVegetarianDishes?: CateringDish[];
    soupDishes?: CateringDish[];
    dessertDishes?: CateringDish[];
};

type CateringCategoryKey =
    | "vegetarianDishes"
    | "nonVegetarianDishes"
    | "soupDishes"
    | "dessertDishes";

type PackageWithCateringMenu = ServicePackage & {
    cateringMenu?: CateringMenuData | null;
    cateringPackageMenu?: CateringMenuData | null;
};

type SelectedCateringDish = {
    id?: string;
    dishId?: string;
    menuItemId?: string;
    name: string;
    category: string;
    foodType: string;
    custom: boolean;
};

interface Props {
    packages?: ServicePackage[];
    selectedPackage?: ServicePackage | null;
    selectedSlotId?: string | null;
    selectedSlotResourceTypeId?: string | null;
    isStay?: boolean;
    resourceTypes?: { id: string; name: string }[];
    onSelectPackage: (pkg: ServicePackage) => void;
    onSelectedCateringDishesChange?: (dishes: SelectedCateringDish[]) => void;
}

const VISIBLE_PACKAGES = 3;

const VendorPackages = ({
    packages = [],
    selectedPackage,
    selectedSlotId,
    selectedSlotResourceTypeId,
    isStay = false,
    resourceTypes = [],
    onSelectPackage,
    onSelectedCateringDishesChange
}: Props) => {

    const activePackages =
        packages.filter(
            pkg => pkg.active !== false
        );

    const carouselRef = useRef<HTMLDivElement>(null);

    const [menuPackage, setMenuPackage] =
        useState<PackageWithCateringMenu | null>(null);

    // Customer selections stay local to this component until the booking
    // flow explicitly sends them to the cart/booking API.
    const [selectedDishIds, setSelectedDishIds] = useState<
        Record<string, Partial<Record<CateringCategoryKey, string[]>>>
    >({});


    if (activePackages.length === 0) {
        return null;
    }


    const totalPackages =
        activePackages.length;


    const showNavigation =
        totalPackages > VISIBLE_PACKAGES;


    /*
     * =========================================
     * PACKAGE SELECTION
     * =========================================
     *
     * Prefer the package ID when available.
     *
     * If the backend does not provide an ID,
     * fall back to object reference comparison.
     *
     * This makes the selection work reliably
     * with both persisted and temporary packages.
     */
    const getPersistedPackageId = (pkg: ServicePackage): string | undefined => {
        const candidate = pkg as ServicePackage & { packageId?: string; _id?: string };
        const value = candidate.id ?? candidate.packageId ?? candidate._id;
        return value == null || String(value).trim() === "" ? undefined : String(value);
    };

    const isPackageSelected =
        (pkg: ServicePackage): boolean => {
            if (!selectedPackage) return false;

            const packageId = getPersistedPackageId(pkg);
            const selectedId = getPersistedPackageId(selectedPackage);
            if (packageId && selectedId) return packageId === selectedId;

            return pkg === selectedPackage;
        };


    const goPrevious = () => {
        carouselRef.current?.scrollBy({
            left: -Math.max(260, carouselRef.current.clientWidth * 0.82),
            behavior: "smooth"
        });
    };

    const goNext = () => {
        carouselRef.current?.scrollBy({
            left: Math.max(260, (carouselRef.current?.clientWidth ?? 0) * 0.82),
            behavior: "smooth"
        });
    };

    const getPackageKey = (pkg: ServicePackage, index = 0) =>
        pkg.id ?? `${pkg.name}-${pkg.price}-${index}`;

    const getMenu = (pkg: PackageWithCateringMenu): CateringMenuData | null =>
        pkg.cateringPackageMenu ?? pkg.cateringMenu ?? null;

    const getDishKey = (dish: CateringDish, index: number) =>
        dish.dishId ?? dish.menuItemId ?? dish.id ?? `${dish.name}-${index}`;

    const toggleDish = (
        pkg: PackageWithCateringMenu,
        category: CateringCategoryKey,
        dishKey: string,
        limit: number,
        checked: boolean
    ) => {
        const key = getPackageKey(pkg);

        setSelectedDishIds(previous => {
            const packageSelections = previous[key] ?? {};
            const categorySelections = packageSelections[category] ?? [];

            if (checked) {
                if (categorySelections.includes(dishKey)) return previous;
                if (limit <= 0 || categorySelections.length >= limit) return previous;

                return {
                    ...previous,
                    [key]: {
                        ...packageSelections,
                        [category]: [...categorySelections, dishKey]
                    }
                };
            }

            return {
                ...previous,
                [key]: {
                    ...packageSelections,
                    [category]: categorySelections.filter(id => id !== dishKey)
                }
            };
        });
    };

    const commitMenuSelection = () => {
        if (menuPackage && onSelectedCateringDishesChange) {
            const menu = getMenu(menuPackage);
            const packageSelections = selectedDishIds[getPackageKey(menuPackage)] ?? {};
            const selected: SelectedCateringDish[] = [];

            const categories: {
                key: CateringCategoryKey;
                dishes: CateringDish[];
            }[] = [
                { key: "vegetarianDishes", dishes: menu?.vegetarianDishes ?? [] },
                { key: "nonVegetarianDishes", dishes: menu?.nonVegetarianDishes ?? [] },
                { key: "soupDishes", dishes: menu?.soupDishes ?? [] },
                { key: "dessertDishes", dishes: menu?.dessertDishes ?? [] }
            ];

            categories.forEach(category => {
                const selectedKeys = packageSelections[category.key] ?? [];
                category.dishes.forEach((dish, index) => {
                    if (selectedKeys.includes(getDishKey(dish, index))) {
                        selected.push({
                            ...dish,
                            category: dish.category ?? category.key,
                            foodType: dish.foodType ?? (
                                category.key === "vegetarianDishes" ? "VEGETARIAN" :
                                category.key === "nonVegetarianDishes" ? "NON_VEGETARIAN" :
                                category.key === "soupDishes" ? "SOUP" : "DESSERT"
                            ),
                            custom: dish.custom ?? false
                        });
                    }
                });
            });

            onSelectedCateringDishesChange(selected);
        }
        setMenuPackage(null);
    };

    const closeMenu = () => commitMenuSelection();


    return (

        <section className="vendor-packages">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="packages-heading">

                <div>

                    <h2>
                        Select a Package
                    </h2>

                </div>


                {showNavigation && (

                    <div className="packages-navigation">

                        <button
                            type="button"
                            className="package-nav-button"
                            onClick={goPrevious}
                            disabled={
                                false
                            }
                            aria-label="Previous packages"
                        >
                            ‹
                        </button>


                        <span className="package-page-count">
                            {totalPackages} packages
                        </span>


                        <button
                            type="button"
                            className="package-nav-button"
                            onClick={goNext}
                            disabled={
                                false
                            }
                            aria-label="Next packages"
                        >
                            ›
                        </button>

                    </div>

                )}

            </div>


            <p className="package-selection-help">

                Choose the package that best suits your requirements. Scroll to explore more options.

            </p>


            {/* =========================================
                PACKAGE CARDS
            ========================================= */}

            <div className="package-carousel" ref={carouselRef}>

                <div className="package-grid carousel-grid">

                    {activePackages.map(
                        (
                            pkg,
                            index
                        ) => {

                            const packageKey =
                                pkg.id ??
                                `${pkg.name}-${pkg.price}-${index}`;


                            const isSelected =
                                isPackageSelected(
                                    pkg
                                );
                            const packageRequirements = pkg.resourceRequirements ?? [];
                            const legacyResourceTypeId = pkg.resourceTypeId;
                            const packageResourceTypeIds = packageRequirements.length > 0
                                ? packageRequirements.map(requirement => requirement.resourceTypeId)
                                : (legacyResourceTypeId ? [legacyResourceTypeId] : []);
                            const slotIsExcludedByPackage = Boolean(
                                selectedSlotId && pkg.slotIds?.length > 0 &&
                                !pkg.slotIds.includes(selectedSlotId)
                            );
                            // In Stay, a slot assigned to a physical resource type can
                            // only be used by packages that include that type. A combined
                            // package remains compatible when it includes the slot's type
                            // alongside its other required room types.
                            const resourceTypeIsExcludedByPackage = Boolean(
                                isStay && selectedSlotId && selectedSlotResourceTypeId &&
                                !packageResourceTypeIds.includes(selectedSlotResourceTypeId)
                            );
                            const incompatibleWithSlot = slotIsExcludedByPackage || resourceTypeIsExcludedByPackage;


                            return (

                                <div
                                    key={packageKey}
                                    className={
                                        `package-card ${isSelected ? "selected" : ""} ${incompatibleWithSlot ? "incompatible" : ""}`
                                    }
                                >

                                    {/* =================================
                                        SELECTED BADGE
                                    ================================= */}

                                    {isSelected && (

                                        <div className="package-selected-badge">

                                            ✓ Selected

                                        </div>

                                    )}


                                    <div className="package-card-content">

                                        <div className="package-pricing-basis">
                                            {pkg.packageType === "FIXED_DURATION"
                                                ? `Fixed duration${pkg.includedDuration ? ` · ${pkg.includedDuration} ${isStay ? "nights" : "units"}` : ""}`
                                                : pkg.pricingBasis === "PER_DAY"
                                                    ? (isStay ? "Per night · complete combination" : "Per day")
                                                    : pkg.pricingBasis === "PER_NIGHT"
                                                        ? (isStay ? "Per night · complete combination" : "Per night")
                                                        : pkg.pricingBasis === "FIXED"
                                                            ? (isStay ? "Price per complete combination" : "Flat price per booking")
                                                            : "Package"}
                                        </div>

                                        <h3>
                                            {pkg.name}
                                        </h3>


                                        <h4>

                                            ₹
                                            {Number(
                                                pkg.price
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </h4>


                                        {isStay && (pkg.resourceRequirements?.length || pkg.resourceTypeId) && (
                                            <div className="package-room-composition">
                                                <strong>Included rooms</strong>
                                                <ul>
                                                    {(pkg.resourceRequirements?.length
                                                        ? pkg.resourceRequirements
                                                        : [{ resourceTypeId: pkg.resourceTypeId!, quantity: 1 }]
                                                    ).map((requirement, requirementIndex) => (
                                                        <li key={`${requirement.resourceTypeId}-${requirementIndex}`}>
                                                            {(resourceTypes.find(type => type.id === requirement.resourceTypeId)?.name ?? "Room type")}
                                                            {` × ${requirement.quantity}`}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="package-feature-area">

                                            {
                                                pkg.features &&
                                                pkg.features.length > 0
                                                    ? (

                                                        <ul className="package-features">

                                                            {
                                                                pkg.features.map(
                                                                    (
                                                                        feature,
                                                                        featureIndex
                                                                    ) => (

                                                                        <li
                                                                            key={
                                                                                featureIndex
                                                                            }
                                                                        >
                                                                            {feature}
                                                                        </li>

                                                                    )
                                                                )
                                                            }

                                                        </ul>

                                                    )
                                                    : (

                                                        <div className="package-no-features">

                                                            No additional features

                                                        </div>

                                                    )
                                            }

                                        </div>

                                    </div>


                                    {(getMenu(pkg as PackageWithCateringMenu)) && (
                                        <button
                                            type="button"
                                            className="package-menu-button"
                                            onClick={() => {
                                                // Opening a package's menu means that package is the
                                                // one being configured for this booking.
                                                onSelectPackage(pkg);
                                                setMenuPackage(pkg as PackageWithCateringMenu);
                                            }}
                                        >
                                            View Catering Menu
                                        </button>
                                    )}

                                    {/* =================================
                                        SELECT BUTTON
                                    ================================= */}

                                    <button
                                        type="button"
                                        className={
                                            isSelected
                                                ? "package-select-button selected"
                                                : "package-select-button"
                                        }
                                        disabled={!getPersistedPackageId(pkg)}
                                        title={!getPersistedPackageId(pkg) ? "Package ID is missing from the pricing response" : undefined}
                                        onClick={() => onSelectPackage({
                                            ...pkg,
                                            id: getPersistedPackageId(pkg)
                                        })}
                                    >

                                        {isSelected
                                            ? "✓ Selected"
                                            : "Select"
                                        }

                                    </button>

                                </div>

                            );

                        }
                    )}

                </div>

            </div>


            {/* =========================================
                FOOTER
            ========================================= */}

            {menuPackage && (() => {
                const menu = getMenu(menuPackage);
                if (!menu) return null;

                const packageKey = getPackageKey(menuPackage);
                const packageSelections = selectedDishIds[packageKey] ?? {};
                const categories: {
                    key: CateringCategoryKey;
                    title: string;
                    dishes: CateringDish[];
                    limit: number;
                }[] = [
                    {
                        key: "vegetarianDishes",
                        title: "Vegetarian Dishes",
                        dishes: menu.vegetarianDishes ?? [],
                        limit: Math.max(0, menu.vegetarianSelectionLimit ?? 0)
                    },
                    {
                        key: "nonVegetarianDishes",
                        title: "Non-Vegetarian Dishes",
                        dishes: menu.nonVegetarianDishes ?? [],
                        limit: Math.max(0, menu.nonVegetarianSelectionLimit ?? 0)
                    },
                    {
                        key: "soupDishes",
                        title: "Soups",
                        dishes: menu.soupDishes ?? [],
                        limit: Math.max(0, menu.soupSelectionLimit ?? 0)
                    },
                    {
                        key: "dessertDishes",
                        title: "Desserts",
                        dishes: menu.dessertDishes ?? [],
                        limit: Math.max(0, menu.dessertSelectionLimit ?? 0)
                    }
                ];

                const selectedTotal = categories.reduce(
                    (total, category) => total + (packageSelections[category.key]?.length ?? 0),
                    0
                );

                return (
                    <div
                        className="catering-menu-overlay"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) closeMenu();
                        }}
                    >
                        <section
                            className="catering-menu-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="catering-menu-title"
                        >
                            <header className="catering-menu-header">
                                <div>
                                    <h2 id="catering-menu-title">
                                        {menuPackage.name} — Catering Menu
                                    </h2>
                                    <p>Select dishes within each category's limit.</p>
                                </div>
                                <button
                                    type="button"
                                    className="catering-menu-close"
                                    aria-label="Close catering menu"
                                    onClick={closeMenu}
                                >
                                    ×
                                </button>
                            </header>

                            <div className="catering-menu-body">
                                {categories.map(category => {
                                    const selected = packageSelections[category.key] ?? [];
                                    const atLimit = selected.length >= category.limit;

                                    return (
                                        <section
                                            className="catering-menu-category"
                                            key={category.key}
                                        >
                                            <div className="catering-menu-category-heading">
                                                <h3>{category.title}</h3>
                                                <span>
                                                    {selected.length} of {category.limit} selected
                                                </span>
                                            </div>

                                            {category.dishes.length > 0 ? (
                                                <div className="catering-menu-dishes">
                                                    {category.dishes.map((dish, index) => {
                                                        const dishKey = getDishKey(dish, index);
                                                        const isChecked = selected.includes(dishKey);
                                                        const disableUnchecked =
                                                            !isChecked && (category.limit === 0 || atLimit);

                                                        return (
                                                            <label
                                                                className={`catering-menu-dish${disableUnchecked ? " disabled" : ""}`}
                                                                key={`${category.key}-${dishKey}`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    disabled={disableUnchecked}
                                                                    onChange={event => toggleDish(
                                                                        menuPackage,
                                                                        category.key,
                                                                        dishKey,
                                                                        category.limit,
                                                                        event.target.checked
                                                                    )}
                                                                />
                                                                <span>{dish.name}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="catering-menu-empty">
                                                    No dishes configured for this category.
                                                </p>
                                            )}
                                            {category.limit === 0 && category.dishes.length > 0 && (
                                                <p className="catering-menu-limit-note">
                                                    No selections are allowed in this category.
                                                </p>
                                            )}
                                        </section>
                                    );
                                })}
                            </div>

                            <footer className="catering-menu-footer">
                                <span>{selectedTotal} dish{selectedTotal === 1 ? "" : "es"} selected</span>
                                <button
                                    type="button"
                                    className="catering-menu-done"
                                    onClick={closeMenu}
                                >
                                    Done
                                </button>
                            </footer>
                        </section>
                    </div>
                );
            })()}

        </section>

    );

};


export default VendorPackages;