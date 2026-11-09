
import { useEffect, useState } from "react";
import type { CateringPackageDish, CateringPackageMenu } from "../../../types/CateringPackageMenu";
import type { CateringMenuItem } from "../../../types/CateringMenuItem";
import "./CateringPackageMenuModal.css";

interface Props {
    packageName: string;
    menuItems: CateringMenuItem[];
    initialMenu?: CateringPackageMenu;
    onSave: (menu: CateringPackageMenu) => void;
    onClose: () => void;
}

type MenuSection = {
    key: keyof Pick<
        CateringPackageMenu,
        "vegetarianDishes" |
        "nonVegetarianDishes" |
        "soupDishes" |
        "dessertDishes"
    >;
    limitKey: keyof Pick<
        CateringPackageMenu,
        "vegetarianSelectionLimit" |
        "nonVegetarianSelectionLimit" |
        "soupSelectionLimit" |
        "dessertSelectionLimit"
    >;
    title: string;
    matches: (item: CateringMenuItem) => boolean;
};

const emptyMenu: CateringPackageMenu = {
    vegetarianDishes: [],
    nonVegetarianDishes: [],
    soupDishes: [],
    dessertDishes: [],
    vegetarianSelectionLimit: 0,
    nonVegetarianSelectionLimit: 0,
    soupSelectionLimit: 0,
    dessertSelectionLimit: 0,
};

const sections: MenuSection[] = [
    {
        key: "vegetarianDishes",
        limitKey: "vegetarianSelectionLimit",
        title: "Vegetarian",
        matches: item =>
            /vegetarian|veg/i.test(item.foodType ?? "") &&
            !/non[\s-]*vegetarian/i.test(item.foodType ?? ""),
    },
    {
        key: "nonVegetarianDishes",
        limitKey: "nonVegetarianSelectionLimit",
        title: "Non-Vegetarian",
        matches: item =>
            /non[\s-]*vegetarian|nonveg/i.test(item.foodType ?? ""),
    },
    {
        key: "soupDishes",
        limitKey: "soupSelectionLimit",
        title: "Soups",
        matches: item => /soup/i.test(item.category ?? ""),
    },
    {
        key: "dessertDishes",
        limitKey: "dessertSelectionLimit",
        title: "Desserts",
        matches: item => /dessert|sweet/i.test(item.category ?? ""),
    },
];

function getDishId(item: CateringMenuItem): string {
    // Standard dishes use dishId. Custom dishes use their menu-item ID.
    return item.custom
        ? item.id ?? ""
        : item.dishId ?? item.id ?? "";
}

function toPackageDish(item: CateringMenuItem): CateringPackageDish {
    const dishId = getDishId(item);
    return {
        id: item.id ?? dishId,
        dishId,
        menuItemId: item.custom ? item.id : undefined,
        name: item.name,
        category: item.category ?? "",
        foodType: item.foodType ?? "",
        custom: Boolean(item.custom),
    };
}

function normalizeMenu(menu?: CateringPackageMenu | null): CateringPackageMenu {
    return {
        vegetarianSelectionLimit: menu?.vegetarianSelectionLimit ?? 0,
        nonVegetarianSelectionLimit: menu?.nonVegetarianSelectionLimit ?? 0,
        soupSelectionLimit: menu?.soupSelectionLimit ?? 0,
        dessertSelectionLimit: menu?.dessertSelectionLimit ?? 0,
        vegetarianDishes: menu?.vegetarianDishes ?? [],
        nonVegetarianDishes: menu?.nonVegetarianDishes ?? [],
        soupDishes: menu?.soupDishes ?? [],
        dessertDishes: menu?.dessertDishes ?? [],
    };
}

export default function CateringPackageMenuModal({
    packageName,
    menuItems,
    initialMenu,
    onSave,
    onClose,
}: Props) {
    const [menu, setMenu] = useState<CateringPackageMenu>(
        normalizeMenu(initialMenu)
    );
    const [error, setError] = useState("");

    useEffect(() => {
        setMenu(normalizeMenu(initialMenu));
        setError("");
    }, [initialMenu]);

    const toggleDish = (
        section: MenuSection,
        item: CateringMenuItem
    ) => {
        const dish = toPackageDish(item);
        if (!dish.dishId) {
            setError(`Could not identify the dish "${item.name}".`);
            return;
        }

        setError("");

        setMenu(previous => {
            const current = previous[section.key];
            const exists = current.some(
                selected => selected.dishId === dish.dishId
            );

            const updated = exists
                ? current.filter(
                    selected => selected.dishId !== dish.dishId
                )
                : [...current, dish];

            const limit = previous[section.limitKey];

            return {
                ...previous,
                [section.key]: updated,
                [section.limitKey]: Math.min(limit, updated.length),
            };
        });
    };

    const updateLimit = (
        section: MenuSection,
        value: string
    ) => {
        const limit = value === "" ? 0 : Number(value);
        const selectedCount = menu[section.key].length;

        if (
            !Number.isInteger(limit) ||
            limit < 0 ||
            limit > selectedCount
        ) {
            setError(
                `The ${section.title} selection limit must be between 0 and ${selectedCount}.`
            );
            return;
        }

        setError("");
        setMenu(previous => ({
            ...previous,
            [section.limitKey]: limit,
        }));
    };

    const handleSave = () => {
        for (const section of sections) {
            const selected = menu[section.key];
            const limit = menu[section.limitKey];

            if (limit < 0 || limit > selected.length) {
                setError(
                    `${section.title}: the selection limit cannot exceed the number of selected dishes.`
                );
                return;
            }
        }

        onSave(menu);
    };

    return (
        <div
            className="catering-menu-overlay"
            onMouseDown={event => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                className="catering-menu-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="catering-menu-title"
            >
                <header className="catering-menu-modal-header">
                    <div>
                        <h2 id="catering-menu-title">
                            Configure Catering Menu
                        </h2>
                        <p>
                            Choose dishes included in{" "}
                            <strong>{packageName || "this package"}</strong>.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="catering-menu-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </header>

                <div className="catering-menu-modal-body">
                    {sections.map(section => {
                        const available = menuItems.filter(
                            item =>
                                item.active &&
                                section.matches(item)
                        );

                        const selected = menu[section.key];

                        return (
                            <section
                                className="catering-menu-section"
                                key={section.key}
                            >
                                <div className="catering-menu-section-header">
                                    <div>
                                        <h3>{section.title}</h3>
                                        <p>
                                            {selected.length} selected ·{" "}
                                            {available.length} available
                                        </p>
                                    </div>

                                    <label className="catering-limit-field">
                                        Customer can select
                                        <input
                                            type="number"
                                            min={0}
                                            max={selected.length}
                                            value={menu[section.limitKey]}
                                            onChange={event =>
                                                updateLimit(
                                                    section,
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </label>
                                </div>

                                {available.length === 0 ? (
                                    <p className="catering-menu-empty">
                                        No dishes available in this category.
                                    </p>
                                ) : (
                                    <div className="catering-menu-dishes">
                                        {available.map(item => {
                                            const id = getDishId(item);
                                            const checked = selected.some(
                                                dish => dish.dishId === id
                                            );

                                            return (
                                                <label
                                                    className="catering-menu-dish"
                                                    key={id || item.name}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() =>
                                                            toggleDish(
                                                                section,
                                                                item
                                                            )
                                                        }
                                                    />
                                                    <span>{item.name}</span>
                                                    {item.custom && (
                                                        <small>Custom</small>
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        );
                    })}

                    {error && (
                        <p className="catering-menu-error" role="alert">
                            {error}
                        </p>
                    )}
                </div>

                <footer className="catering-menu-modal-footer">
                    <button
                        type="button"
                        className="catering-menu-cancel"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="catering-menu-save"
                        onClick={handleSave}
                    >
                        Save Menu
                    </button>
                </footer>
            </section>
        </div>
    );
}
