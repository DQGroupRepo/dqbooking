import { useState } from "react";
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
    onSelectPackage: (pkg: ServicePackage) => void;
    onSelectedCateringDishesChange?: (dishes: SelectedCateringDish[]) => void;
}

const VISIBLE_PACKAGES = 3;

const VendorPackages = ({
    packages = [],
    selectedPackage,
    selectedSlotId,
    onSelectPackage,
    onSelectedCateringDishesChange
}: Props) => {

    const activePackages =
        packages.filter(
            pkg => pkg.active !== false
        );

    const [currentIndex, setCurrentIndex] =
        useState(0);

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


    const maxIndex =
        Math.max(
            0,
            totalPackages - VISIBLE_PACKAGES
        );


    const safeCurrentIndex =
        Math.min(
            currentIndex,
            maxIndex
        );


    const visiblePackages =
        showNavigation
            ? activePackages.slice(
                safeCurrentIndex,
                safeCurrentIndex + VISIBLE_PACKAGES
            )
            : activePackages;


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

        setCurrentIndex(
            previous =>
                Math.max(
                    0,
                    previous - 1
                )
        );

    };


    const goNext = () => {

        setCurrentIndex(
            previous =>
                Math.min(
                    maxIndex,
                    previous + 1
                )
        );

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
                        Packages
                    </h2>

                </div>


                {showNavigation && (

                    <div className="packages-navigation">

                        <button
                            type="button"
                            className="package-nav-button"
                            onClick={goPrevious}
                            disabled={
                                safeCurrentIndex === 0
                            }
                            aria-label="Previous packages"
                        >
                            ‹
                        </button>


                        <span className="package-page-count">

                            {safeCurrentIndex + 1}

                            {" / "}

                            {maxIndex + 1}

                        </span>


                        <button
                            type="button"
                            className="package-nav-button"
                            onClick={goNext}
                            disabled={
                                safeCurrentIndex >= maxIndex
                            }
                            aria-label="Next packages"
                        >
                            ›
                        </button>

                    </div>

                )}

            </div>


            <p className="package-selection-help">

                Choose a package that best suits
                your requirements.

            </p>


            {/* =========================================
                PACKAGE CARDS
            ========================================= */}

            <div className="package-carousel">

                <div
                    className={
                        showNavigation
                            ? "package-grid carousel-grid"
                            : "package-grid"
                    }
                >

                    {visiblePackages.map(
                        (
                            pkg,
                            index
                        ) => {

                            const packageKey =
                                pkg.id ??
                                `${pkg.name}-${pkg.price}-${safeCurrentIndex}-${index}`;


                            const isSelected =
                                isPackageSelected(
                                    pkg
                                );
                            const incompatibleWithSlot = Boolean(
                                selectedSlotId && pkg.slotIds?.length &&
                                !pkg.slotIds.includes(selectedSlotId)
                            );


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

            {showNavigation && (

                <div className="package-carousel-footer">

                    <span>

                        Showing{" "}

                        {safeCurrentIndex + 1}

                        {" - "}

                        {Math.min(
                            safeCurrentIndex +
                            VISIBLE_PACKAGES,
                            totalPackages
                        )}

                        {" of "}

                        {totalPackages}

                        {" packages"}

                    </span>

                </div>

            )}

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