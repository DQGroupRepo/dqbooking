import { useEffect, useMemo, useState } from "react";

import type { VendorServiceForm } from "../../../../types/VendorServiceForm";

import type { CateringDish } from "../../../../types/CateringDish";

import type { CateringMenuItem } from "../../../../types/CateringMenuItem";

import CateringCustomDishForm from "./CateringCustomDishForm";

import type { CateringMenuOption } from "../../../../types/CateringMenuOption";

import VendorCateringMenuService from "../../../../../services/VendorCateringMenuService";

import "./CateringSection.css";


interface Props {

    formData: VendorServiceForm;

    onCateringDetailsChange: (
        details: VendorServiceForm["cateringDetails"]
    ) => void;

    onCateringMenuItemsChange: (
        items: CateringMenuItem[]
    ) => void;

    serviceId?: string;
}


/*
 * =========================================
 * CUISINE OPTIONS
 *
 * Keep this list configuration-driven.
 * Additional cuisines can be added here
 * without changing the component logic.
 * =========================================
 */

const CUISINE_OPTIONS = [

    "Indian",

    "South Indian",

    "Chinese",

    "Arabian",

    "Italian",

    "Mexican",

    "Thai"

];


/*
 * =========================================
 * MENU CATEGORIES
 *
 * These categories control the display order.
 * The actual category value coming from the
 * master dish is preserved on the menu item.
 * =========================================
 */

const MENU_CATEGORIES = [

    {
        key: "Main Course",
        label: "Main Course",
        icon: "🍛"
    },

    {
        key: "Non-Vegetarian Dishes",
        label: "Non-Vegetarian Dishes",
        icon: "🍗"
    },

    {
        key: "Soups",
        label: "Soups",
        icon: "🥣"
    },

    {
        key: "Salads",
        label: "Salads",
        icon: "🥗"
    },

    {
        key: "Breads",
        label: "Breads",
        icon: "🫓"
    },

    {
        key: "Desserts",
        label: "Desserts",
        icon: "🍰"
    }

];


/*
 * =========================================
 * CATEGORY NORMALIZATION
 *
 * Allows the UI to work with small naming
 * differences such as:
 *
 * Soup      → Soups
 * Salad     → Salads
 * Dessert   → Desserts
 * =========================================
 */

const normalizeCategory = (
    category: string
): string => {

    const normalized =
        category
            .toLowerCase()
            .trim();

    switch (normalized) {

        case "main course":
            return "Main Course";

        case "non-vegetarian dishes":
        case "non vegetarian dishes":
        case "non-vegetarian":
        case "non vegetarian":
            return "Non-Vegetarian Dishes";

        case "soup":
        case "soups":
            return "Soups";

        case "salad":
        case "salads":
            return "Salads";

        case "bread":
        case "breads":
            return "Breads";

        case "dessert":
        case "desserts":
            return "Desserts";

        default:
            return category;

    }

};


/*
 * =========================================
 * FOOD TYPE NORMALIZATION
 * =========================================
 */

const normalizeFoodType = (
    foodType: string
): string => {

    return foodType
        .toLowerCase()
        .trim()
        .replace(/_/g, "-");

};


export default function CateringSection({

    formData,

    onCateringDetailsChange,

    onCateringMenuItemsChange,
    serviceId

}: Props) {


    const cateringDetails =
        formData.cateringDetails;

    const [
        showCustomDishForm,
        setShowCustomDishForm
    ] = useState(false);
console.log("CateringSection SERVICE ID:", serviceId);
    /*
     * =====================================
     * MENU STATE
     * =====================================
     */

    const [
        selectedMenuCuisine,
        setSelectedMenuCuisine
    ] = useState<string>("");


    const [
        dishes,
        setDishes
    ] = useState<CateringDish[]>([]);


    const [
        loadingDishes,
        setLoadingDishes
    ] = useState(false);


    const [
        dishLoadError,
        setDishLoadError
    ] = useState("");


    const [
        collapsedCategories,
        setCollapsedCategories
    ] = useState<
        Record<string, boolean>
    >({});


    /*
     * =====================================
     * INITIAL MENU CUISINE
     *
     * Use the first cuisine selected by
     * the vendor.
     * =====================================
     */

    useEffect(() => {

        if (
            cateringDetails &&
            cateringDetails.cuisines.length > 0
        ) {

            const currentCuisineStillSelected =
                cateringDetails.cuisines.includes(
                    selectedMenuCuisine
                );


            if (!currentCuisineStillSelected) {

                setSelectedMenuCuisine(
                    cateringDetails.cuisines[0]
                );

            }

        } else {

            setSelectedMenuCuisine("");

        }

    }, [
        cateringDetails?.cuisines,
        selectedMenuCuisine
    ]);


    /*
     * =====================================
     * LOAD MENU OPTIONS
     * =====================================
     *
     * Existing services use the vendor-aware
     * options endpoint. New services have no
     * serviceId yet, so they use the global
     * catalog endpoint.
     * =====================================
     */

    /*
     * =====================================
     * SELECTED API FOOD TYPE
     * =====================================
     */

    const selectedApiFoodType = useMemo(() => {

        if (!cateringDetails) {
            return undefined;
        }

        if (
            cateringDetails.vegetarian &&
            !cateringDetails.nonVegetarian
        ) {
            return "Vegetarian";
        }

        if (
            cateringDetails.nonVegetarian &&
            !cateringDetails.vegetarian
        ) {
            return "Non-Vegetarian";
        }

        return undefined;

    }, [
        cateringDetails?.vegetarian,
        cateringDetails?.nonVegetarian
    ]);

    useEffect(() => {

        if (!selectedMenuCuisine) {
            setDishes([]);
            return;
        }

        let cancelled = false;

        const loadMenuOptions = async () => {

            try {

                setLoadingDishes(true);
                setDishLoadError("");

                let options: CateringMenuOption[];

                if (serviceId) {

                    options =
                        await VendorCateringMenuService
                            .getMenuOptions(
                                serviceId,
                                selectedMenuCuisine,
                                selectedApiFoodType
                            );

                } else {

                    /* New service: no vendor menu exists yet. */
                    const { default: CateringDishService } =
                        await import(
                            "../../../../../services/CateringDishService"
                        );

                    const masterDishes =
                        await CateringDishService
                            .getByCuisine(
                                selectedMenuCuisine,
                                selectedApiFoodType
                            );

                    options = masterDishes.map(
                        dish => ({
                            id: dish.id,
                            dishId: dish.id,
                            menuItemId: undefined,
                            name: dish.name,
                            cuisine: dish.cuisine,
                            category: dish.category,
                            foodType: dish.foodType,
                            pricePerPerson: undefined,
                            active: dish.active,
                            custom: false,
                            selected: false
                        })
                    );

                }

                if (cancelled) {
                    return;
                }

                /* The grid contains only global/master dishes. */
                const standardOptions =
                    options.filter(
                        option => !option.custom
                    );

                setDishes(
                    standardOptions.map(
                        option => ({
                            id: option.dishId ?? option.id,
                            name: option.name,
                            cuisine: option.cuisine,
                            category: option.category,
                            foodType: option.foodType,
                            active: option.active
                        })
                    )
                );

                /*
                 * Custom dishes are displayed by the existing
                 * Custom Dishes section. Merge any vendor custom
                 * options that are not already in formData.
                 */
                const customOptions =
                    options.filter(
                        option => option.custom
                    );

                if (
                    customOptions.length > 0 &&
                    cateringDetails
                ) {

                    const mergedItems = [
                        ...cateringDetails.menuItems
                    ];

                    customOptions.forEach(
                        option => {

                            const menuItemId =
                                option.menuItemId ??
                                option.id;

                            const alreadyExists =
                                mergedItems.some(
                                    item =>
                                        item.custom &&
                                        item.id === menuItemId
                                );

                            if (!alreadyExists) {

                                mergedItems.push({
                                    id: menuItemId,
                                    dishId: undefined,
                                    customName: option.name,
                                    name: option.name,
                                    cuisine: option.cuisine,
                                    category: option.category,
                                    foodType: option.foodType,
                                    pricePerPerson:
                                        option.pricePerPerson != null
                                            ? String(option.pricePerPerson)
                                            : "",
                                    active: option.active,
                                    custom: true,
                                    selected: true
                                });

                            }

                        }
                    );

                    if (
                        mergedItems.length !==
                        cateringDetails.menuItems.length
                    ) {
                        onCateringMenuItemsChange(
                            mergedItems
                        );
                    }

                }

            } catch (error) {

                if (!cancelled) {

                    console.error(
                        "Failed to load catering menu options:",
                        error
                    );

                    setDishes([]);

                    setDishLoadError(
                        "Unable to load catering dishes. Please try again."
                    );

                }

            } finally {

                if (!cancelled) {
                    setLoadingDishes(false);
                }

            }

        };

        loadMenuOptions();

        return () => {
            cancelled = true;
        };

    }, [
        serviceId,
        selectedMenuCuisine,
        selectedApiFoodType
    ]);


    /*
     * =====================================
     * FOOD TYPE CHANGE
     * =====================================
     */

    const handleFoodTypeChange = (
        field: "vegetarian" | "nonVegetarian"
    ) => {
        if (!cateringDetails) {
            return;
        }

        onCateringDetailsChange(
            "vegetarian",
            field === "vegetarian"
        );

        onCateringDetailsChange(
            "nonVegetarian",
            field === "nonVegetarian"
        );
    };


    /*
     * =====================================
     * CUISINE CHANGE
     * =====================================
     */

    const handleCuisineChange = (
        cuisine: string
    ) => {
        if (!cateringDetails) {
            return;
        }

        onCateringDetailsChange(
            "cuisines",
            [cuisine]
        );
    };


    /*
     * =====================================
     * MENU CUISINE CHANGE
     * =====================================
     */

    const handleMenuCuisineChange = (
        cuisine: string
    ) => {

        setSelectedMenuCuisine(
            cuisine
        );

    };


    /*
     * =====================================
     * CHECK WHETHER A DISH IS SELECTED
     * =====================================
     */

    const isDishSelected = (
        dish: CateringDish
    ): boolean => {

        if (!cateringDetails) {

            return false;

        }


        return cateringDetails.menuItems.some(
            item =>
                item.dishId === dish.id
        );

    };


    /*
     * =====================================
     * GET SELECTED MENU ITEM
     * =====================================
     */

    const getSelectedMenuItem = (
        dish: CateringDish
    ): CateringMenuItem | undefined => {

        if (!cateringDetails) {

            return undefined;

        }


        return cateringDetails.menuItems.find(
            item =>
                item.dishId === dish.id
        );

    };


    /*
     * =====================================
     * TOGGLE DISH
     * =====================================
     */

    const handleDishToggle = (
        dish: CateringDish
    ) => {

        if (!cateringDetails) {

            return;

        }


        const existingItem =
            getSelectedMenuItem(
                dish
            );


        if (existingItem) {

            const updatedItems =
                cateringDetails.menuItems.filter(
                    item =>
                        item.dishId !== dish.id
                );


            onCateringMenuItemsChange(
                updatedItems
            );

            return;

        }


        const newItem: CateringMenuItem = {

            id: undefined,

            dishId:
                dish.id,

            name:
                dish.name,

            cuisine:
                dish.cuisine,

            category:
                dish.category,

            foodType:
                dish.foodType,

            pricePerPerson:
                "",

            active:
                true,

            custom:
                false,

            selected:
                true

        };


        onCateringMenuItemsChange([

            ...cateringDetails.menuItems,

            newItem

        ]);

    };


    /*
     * =====================================
     * UPDATE DISH PRICE
     * =====================================
     */

    const handlePriceChange = (
        dishId: string,
        price: string
    ) => {

        if (!cateringDetails) {

            return;

        }


        const updatedItems =
            cateringDetails.menuItems.map(
                item => {

                    if (
                        item.dishId !== dishId
                    ) {

                        return item;

                    }


                    return {

                        ...item,

                        pricePerPerson:
                            price

                    };

                }
            );


        onCateringMenuItemsChange(
            updatedItems
        );

    };


    /*
     * =====================================
     * CATEGORY COLLAPSE
     * =====================================
     */

    const toggleCategory = (
        category: string
    ) => {

        setCollapsedCategories(
            previous => ({

                ...previous,

                [category]:
                    !previous[category]

            })
        );

    };


    /*
     * =====================================
     * FOOD TYPE FILTER
     * =====================================
     */

    const filteredDishes =
        useMemo(() => {

            if (!cateringDetails) {

                return [];

            }


            const vegetarianSelected =
                cateringDetails.vegetarian;


            const nonVegetarianSelected =
                cateringDetails.nonVegetarian;


            /*
             * If neither food type is selected,
             * show all master dishes.
             */

            if (
                !vegetarianSelected &&
                !nonVegetarianSelected
            ) {

                return dishes;

            }


            /*
             * If both are selected, show all.
             */

            if (
                vegetarianSelected &&
                nonVegetarianSelected
            ) {

                return dishes;

            }


            return dishes.filter(
                dish => {

                    const foodType =
                        normalizeFoodType(
                            dish.foodType
                        );


                    if (
                        vegetarianSelected
                    ) {

                        return (
                            foodType ===
                                "vegetarian"
                        );

                    }


                    if (
                        nonVegetarianSelected
                    ) {

                        return (
                            foodType ===
                                "non-vegetarian"
                        );

                    }


                    return true;

                }
            );

        }, [
            dishes,
            cateringDetails?.vegetarian,
            cateringDetails?.nonVegetarian
        ]);


    /*
     * =====================================
     * CATEGORY DISHES
     * =====================================
     */

    const getCategoryDishes = (
        category: string
    ): CateringDish[] => {

        return filteredDishes.filter(
            dish =>
                normalizeCategory(
                    dish.category
                ) === category
        );

    };


    /*
     * =====================================
     * SELECTED COUNT
     * =====================================
     */

    const getCategorySelectedCount = (
        category: string
    ): number => {

        if (!cateringDetails) {

            return 0;

        }


        const categoryDishIds =
            getCategoryDishes(
                category
            ).map(
                dish =>
                    dish.id
            );


        return cateringDetails.menuItems.filter(
            item =>
                item.dishId &&
                categoryDishIds.includes(
                    item.dishId
                )
        ).length;

    };


    /*
     * =====================================
     * TOTAL SELECTED DISHES
     * =====================================
     */

    const selectedDishCount =
        cateringDetails?.menuItems
            .filter(
                item =>
                    item.custom === false
            )
            .length ?? 0;


    /*
     * =====================================
     * EMPTY STATE
     * =====================================
     */

    if (!cateringDetails) {

        return null;

    }

    const handleAddCustomDish = (
        item: CateringMenuItem
    ) => {

        if (!cateringDetails) {
            return;
        }

        onCateringMenuItemsChange([

            ...cateringDetails.menuItems,

            item

        ]);

        setShowCustomDishForm(false);
    };

    const handleCancelCustomDish = () => {

        setShowCustomDishForm(false);

    };

    const currentCuisineCustomDishes =
        cateringDetails.menuItems.filter(
            item =>
                item.custom &&
                item.cuisine === selectedMenuCuisine
        );

    const handleCustomDishPriceChange = (
        itemId: string | undefined,
        price: string
    ) => {

        if (!cateringDetails || !itemId) {
            return;
        }

        const updatedItems =
            cateringDetails.menuItems.map(
                item => {

                    if (
                        item.id !== itemId
                    ) {
                        return item;
                    }

                    return {
                        ...item,
                        pricePerPerson: price
                    };

                }
            );

        onCateringMenuItemsChange(
            updatedItems
        );
    };

    const handleRemoveCustomDish = (
        itemId: string | undefined
    ) => {

        if (!cateringDetails || !itemId) {
            return;
        }

        const updatedItems =
            cateringDetails.menuItems.filter(
                item =>
                    item.id !== itemId
            );

        onCateringMenuItemsChange(
            updatedItems
        );
    };


    return (

        <div className="catering-section">

            {/* =====================================
                CATERING DETAILS
            ===================================== */}

            <div className="catering-card">

                <div className="catering-card-header">

                    <div>

                        <h3>
                            Catering Details
                        </h3>

                        <p>
                            Tell customers what type of
                            food and cuisine your catering
                            service provides.
                        </p>

                    </div>

                </div>


                {/* =================================
                    FOOD TYPE
                ================================= */}

                <div className="catering-field-group">

                    <div className="catering-field-heading">

                        <label>
                            Food Type
                        </label>

                        <span>
                            Select one
                        </span>

                    </div>


                    <div className="catering-option-grid">

                        <label
                            className={
                                `catering-option ${
                                    cateringDetails
                                        .vegetarian
                                        ? "selected"
                                        : ""
                                }`
                            }
                        >

                            <input
                                type="radio"
                                checked={
                                    cateringDetails
                                        .vegetarian
                                }
                                onChange={() =>
                                    handleFoodTypeChange(
                                        "vegetarian"
                                    )
                                }
                            />

                            <span className="catering-checkbox">
                            </span>

                            <span>
                                Vegetarian
                            </span>

                        </label>


                        <label
                            className={
                                `catering-option ${
                                    cateringDetails
                                        .nonVegetarian
                                        ? "selected"
                                        : ""
                                }`
                            }
                        >

                            <input
                                type="radio"
                                type="radio"
                                checked={
                                    cateringDetails
                                        .nonVegetarian
                                }
                                onChange={() =>
                                    handleFoodTypeChange(
                                        "nonVegetarian"
                                    )
                                }
                            />

                            <span className="catering-checkbox">
                            </span>

                            <span>
                                Non-Vegetarian
                            </span>

                        </label>

                    </div>

                </div>


                {/* =================================
                    CUISINE TYPES
                ================================= */}

                <div className="catering-field-group">

                    <div className="catering-field-heading">

                        <label>
                            Cuisine Types
                        </label>

                        <span>
                            Select the cuisine you offer
                        </span>

                    </div>


                    <div className="catering-cuisine-grid">

                        {
                            CUISINE_OPTIONS.map(
                                cuisine => {

                                    const selected =
                                        cateringDetails
                                            .cuisines
                                            .includes(
                                                cuisine
                                            );


                                    return (

                                        <label
                                            key={cuisine}
                                            className={
                                                `catering-cuisine-option ${
                                                    selected
                                                        ? "selected"
                                                        : ""
                                                }`
                                            }
                                        >

                                            <input
                                                type="radio"
                                                name="catering-cuisine"
                                                checked={selected}
                                                onChange={() =>
                                                    handleCuisineChange(
                                                        cuisine
                                                    )
                                                }
                                            />

                                            <span className="catering-checkbox">
                                            </span>

                                            <span>
                                                {cuisine}
                                            </span>

                                        </label>

                                    );

                                }
                            )
                        }

                    </div>

                </div>

            </div>


            {/* =====================================
                CATERING MENU
            ===================================== */}

            <div className="catering-card catering-menu-card">

                <div className="catering-card-header">

                    <div>

                        <h3>
                            Catering Menu
                        </h3>

                        <p>
                            Select the dishes you offer
                            and set your price per person.
                        </p>

                    </div>


                    <div className="catering-menu-count">

                        {selectedDishCount}
                        {" "}
                        {selectedDishCount === 1
                            ? "dish"
                            : "dishes"} selected

                    </div>

                </div>


                {/* =================================
                    MENU CUISINE SELECTOR
                ================================= */}

                {
                    cateringDetails.cuisines.length > 0 && (

                        <div className="catering-menu-toolbar">

                            <div className="catering-menu-toolbar-label">

                                <label>
                                    Menu Cuisine
                                </label>

                                <span>
                                    Choose a cuisine to view
                                    its dishes
                                </span>

                            </div>


                            <select
                                className="catering-menu-cuisine-select"
                                value={
                                    selectedMenuCuisine
                                }
                                onChange={event =>
                                    handleMenuCuisineChange(
                                        event.target.value
                                    )
                                }
                            >

                                {
                                    cateringDetails
                                        .cuisines
                                        .map(
                                            cuisine => (

                                                <option
                                                    key={
                                                        cuisine
                                                    }
                                                    value={
                                                        cuisine
                                                    }
                                                >
                                                    {cuisine}
                                                </option>

                                            )
                                        )
                                }

                            </select>

                        </div>

                    )
                }

                {/* =================================
                    CUSTOM DISH
                ================================= */}

                <div className="catering-custom-dish-section">

                    {
                        currentCuisineCustomDishes.length > 0 && (

                            <div className="catering-custom-dish-list">

                                <div className="catering-custom-dish-list-header">

                                    <div>

                                        <strong>
                                            Custom Dishes
                                        </strong>

                                        <span>
                                            Dishes added specifically for your
                                            catering menu
                                        </span>

                                    </div>

                                    <span className="catering-custom-dish-count">

                                        {
                                            currentCuisineCustomDishes.length
                                        }

                                        {" "}

                                        {
                                            currentCuisineCustomDishes.length === 1
                                                ? "dish"
                                                : "dishes"
                                        }

                                    </span>

                                </div>


                                {
                                    currentCuisineCustomDishes.map(
                                        item => (

                                            <div
                                                key={item.id}
                                                className="catering-custom-dish-row"
                                            >

                                                <div className="catering-custom-dish-info">

                                                    <div className="catering-custom-dish-name">

                                                        {item.name}

                                                        <span>
                                                            Custom
                                                        </span>

                                                    </div>

                                                    <div className="catering-custom-dish-meta">

                                                        {item.category}

                                                        {" • "}

                                                        {item.foodType}

                                                    </div>

                                                </div>


                                                <div className="catering-custom-dish-price">


                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={
                                                            item.pricePerPerson
                                                        }
                                                        onChange={event =>
                                                            handleCustomDishPriceChange(
                                                                item.id,
                                                                event.target.value
                                                            )
                                                        }
                                                        className="catering-menu-price-input"
                                                    />


                                                    <span>
                                                        / person
                                                    </span>

                                                </div>


                                                <button
                                                    type="button"
                                                    className="catering-custom-dish-remove"
                                                    onClick={() =>
                                                        handleRemoveCustomDish(
                                                            item.id
                                                        )
                                                    }
                                                    aria-label={
                                                        `Remove ${item.name}`
                                                    }
                                                    title="Remove custom dish"
                                                >
                                                    ×
                                                </button>

                                            </div>

                                        )
                                    )
                                }

                            </div>

                        )
                    }



                    {/* =====================================
                        ADD CUSTOM DISH
                    ===================================== */}

                    {showCustomDishForm ? (

                        <CateringCustomDishForm
                            cuisine={selectedMenuCuisine}
                            defaultFoodType={
                                formData.cateringDetails?.vegetarian &&
                                !formData.cateringDetails?.nonVegetarian
                                    ? "Vegetarian"
                                    : "Non-Vegetarian"
                            }
                            onAdd={handleAddCustomDish}
                            onCancel={() =>
                                setShowCustomDishForm(false)
                            }
                        />

                    ) : (

                        <button
                            type="button"
                            className="catering-add-custom-dish-button"
                            disabled={!selectedMenuCuisine}
                            onClick={() =>
                                setShowCustomDishForm(true)
                            }
                        >
                            + Add Custom Dish
                        </button>

                    )}
                </div>

                {
                    cateringDetails.cuisines.length === 0 ? (

                        <div className="catering-menu-empty">

                            <strong>
                                Select at least one cuisine
                            </strong>

                            <span>
                                Choose a cuisine above to
                                start selecting dishes.
                            </span>

                        </div>

                    ) : loadingDishes ? (

                        <div className="catering-menu-status">

                            Loading dishes...

                        </div>

                    ) : dishLoadError ? (

                        <div className="catering-menu-status error">

                            {dishLoadError}

                        </div>

                    ) : filteredDishes.length === 0 ? (

                        <div className="catering-menu-empty">

                            <strong>
                                No dishes available
                            </strong>

                            <span>
                                There are currently no dishes available for{" "}
                                {selectedMenuCuisine}.
                            </span>

                        </div>

                    ) : (

                        <div className="catering-menu-content">

                            {
                                MENU_CATEGORIES.map(
                                    category => {

                                        const categoryDishes =
                                            getCategoryDishes(
                                                category.key
                                            );


                                        /*
                                         * Don't display an
                                         * empty category.
                                         */

                                        if (
                                            categoryDishes.length === 0
                                        ) {

                                            return null;

                                        }


                                        const collapsed =
                                            collapsedCategories[
                                                category.key
                                            ] ?? false;


                                        const selectedCount =
                                            getCategorySelectedCount(
                                                category.key
                                            );


                                        return (

                                            <div
                                                key={
                                                    category.key
                                                }
                                                className="catering-menu-category"
                                            >

                                                {/* CATEGORY HEADER */}

                                                <button
                                                    type="button"
                                                    className="catering-menu-category-header"
                                                    onClick={() =>
                                                        toggleCategory(
                                                            category.key
                                                        )
                                                    }
                                                >

                                                    <div className="catering-menu-category-title">

                                                        <span className="catering-menu-category-icon">
                                                            {
                                                                category.icon
                                                            }
                                                        </span>

                                                        <span>
                                                            {
                                                                category.label
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="catering-menu-category-meta">

                                                        {
                                                            selectedCount > 0 && (

                                                                <span className="catering-category-selected-count">

                                                                    {
                                                                        selectedCount
                                                                    }
                                                                    {" "}
                                                                    selected

                                                                </span>

                                                            )
                                                        }


                                                        <span
                                                            className={
                                                                `catering-menu-category-arrow ${
                                                                    collapsed
                                                                        ? "collapsed"
                                                                        : ""
                                                                }`
                                                            }
                                                        >
                                                            ▾
                                                        </span>

                                                    </div>

                                                </button>


                                                {/* DISH LIST */}

                                                {
                                                    !collapsed && (

                                                        <div className="catering-menu-dish-list">

                                                            <div className="catering-menu-column-header">

                                                                <span>
                                                                    Dish
                                                                </span>

                                                                <span>
                                                                    Price / Person
                                                                </span>

                                                            </div>


                                                            {
                                                                categoryDishes.map(
                                                                    dish => {

                                                                        const selected =
                                                                            isDishSelected(
                                                                                dish
                                                                            );


                                                                        const selectedItem =
                                                                            getSelectedMenuItem(
                                                                                dish
                                                                            );


                                                                        return (

                                                                            <div
                                                                                key={
                                                                                    dish.id
                                                                                }
                                                                                className={
                                                                                    `catering-menu-dish-row ${
                                                                                        selected
                                                                                            ? "selected"
                                                                                            : ""
                                                                                    }`
                                                                                }
                                                                            >

                                                                                <label className="catering-menu-dish-name">

                                                                                    <input
                                                                                        type="radio"
                                                                                        checked={
                                                                                            selected
                                                                                        }
                                                                                        onChange={() =>
                                                                                            handleDishToggle(
                                                                                                dish
                                                                                            )
                                                                                        }
                                                                                    />

                                                                                    <span className="catering-checkbox">
                                                                                    </span>

                                                                                    <span className="catering-dish-text">

                                                                                        <span className="catering-dish-name">
                                                                                            {
                                                                                                dish.name
                                                                                            }
                                                                                        </span>

                                                                                        <span className="catering-dish-type">
                                                                                            {
                                                                                                dish.foodType
                                                                                            }
                                                                                        </span>

                                                                                    </span>

                                                                                </label>


                                                                                <div className="catering-menu-price-wrapper">

                                                                                    <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        step="0.01"
                                                                                        placeholder="0.00"
                                                                                        value={
                                                                                            selectedItem
                                                                                                ?.pricePerPerson ?? ""
                                                                                        }
                                                                                        disabled={
                                                                                            !selected
                                                                                        }
                                                                                        onChange={event =>
                                                                                            handlePriceChange(
                                                                                                dish.id,
                                                                                                event.target.value
                                                                                            )
                                                                                        }
                                                                                        className="catering-menu-price-input"
                                                                                    />

                                                                                    <span>
                                                                                        / person
                                                                                    </span>

                                                                                </div>

                                                                            </div>

                                                                        );

                                                                    }
                                                                )
                                                            }

                                                        </div>

                                                    )
                                                }

                                            </div>

                                        );

                                    }
                                )
                            }

                        </div>

                    )
                }

            </div>

        </div>

    );

}

