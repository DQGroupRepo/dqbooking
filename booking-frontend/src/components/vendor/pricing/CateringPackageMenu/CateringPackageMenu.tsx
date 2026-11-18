import NumericInput from "../../../common/ui/NumericInput";
import { useMemo, useState } from "react";
import type { CateringMenuItem } from "../../../../types/CateringMenuItem";
import type {
    CateringPackageDish,
    CateringPackageMenu as CateringPackageMenuType
} from "../../../../types/CateringPackageMenu";
import "./CateringPackageMenu.css";

interface Props {
    vendorMenuItems: CateringMenuItem[];
    value?: CateringPackageMenuType;
    onChange: (value: CateringPackageMenuType) => void;
}

type SectionKey = "vegetarian" | "nonVegetarian" | "soups" | "desserts";

const EMPTY_MENU: CateringPackageMenuType = {
    vegetarianSelectionLimit: 0,
    nonVegetarianSelectionLimit: 0,
    soupSelectionLimit: 0,
    dessertSelectionLimit: 0,
    vegetarianDishes: [],
    nonVegetarianDishes: [],
    soupDishes: [],
    dessertDishes: []
};

const normalize = (value: string) =>
    value.toLowerCase().trim().replace(/_/g, "-");

const toSection = (item: CateringMenuItem): SectionKey | undefined => {
    const category = normalize(item.category);
    if (category === "soup" || category === "soups") return "soups";
    if (category === "dessert" || category === "desserts") return "desserts";
    if (normalize(item.foodType) === "vegetarian") return "vegetarian";
    if (normalize(item.foodType) === "non-vegetarian") return "nonVegetarian";
    return undefined;
};

const toDish = (item: CateringMenuItem): CateringPackageDish => ({
    id: item.id ?? item.dishId ?? `${item.name}-${item.category}`,
    menuItemId: item.id,
    dishId: item.dishId,
    name: item.name,
    category: item.category,
    foodType: item.foodType,
    custom: item.custom
});

const sameDish = (a: CateringPackageDish, b: CateringPackageDish) =>
    a.menuItemId && b.menuItemId
        ? a.menuItemId === b.menuItemId
        : a.dishId && b.dishId
            ? a.dishId === b.dishId
            : a.id === b.id;

export default function CateringPackageMenu({
    vendorMenuItems,
    value,
    onChange
}: Props) {
    const menu = value ?? EMPTY_MENU;
    const [openSection, setOpenSection] = useState<SectionKey | null>(null);

    const available = useMemo(() => ({
        vegetarian: vendorMenuItems.filter(i => toSection(i) === "vegetarian").map(toDish),
        nonVegetarian: vendorMenuItems.filter(i => toSection(i) === "nonVegetarian").map(toDish),
        soups: vendorMenuItems.filter(i => toSection(i) === "soups").map(toDish),
        desserts: vendorMenuItems.filter(i => toSection(i) === "desserts").map(toDish)
    }), [vendorMenuItems]);

    const selectedFor = (section: SectionKey) =>
        section === "vegetarian" ? menu.vegetarianDishes :
        section === "nonVegetarian" ? menu.nonVegetarianDishes :
        section === "soups" ? menu.soupDishes :
        menu.dessertDishes;

    const limitFor = (section: SectionKey) =>
        section === "vegetarian" ? menu.vegetarianSelectionLimit :
        section === "nonVegetarian" ? menu.nonVegetarianSelectionLimit :
        section === "soups" ? menu.soupSelectionLimit :
        menu.dessertSelectionLimit;

    const update = (section: SectionKey, dishes: CateringPackageDish[]) => {
        onChange({
            ...menu,
            vegetarianDishes: section === "vegetarian" ? dishes : menu.vegetarianDishes,
            nonVegetarianDishes: section === "nonVegetarian" ? dishes : menu.nonVegetarianDishes,
            soupDishes: section === "soups" ? dishes : menu.soupDishes,
            dessertDishes: section === "desserts" ? dishes : menu.dessertDishes
        });
    };

    const updateLimit = (section: SectionKey, raw: string) => {
        const limit = Math.max(0, Number.isFinite(Number(raw)) ? Math.floor(Number(raw)) : 0);
        onChange({
            ...menu,
            vegetarianSelectionLimit: section === "vegetarian" ? limit : menu.vegetarianSelectionLimit,
            nonVegetarianSelectionLimit: section === "nonVegetarian" ? limit : menu.nonVegetarianSelectionLimit,
            soupSelectionLimit: section === "soups" ? limit : menu.soupSelectionLimit,
            dessertSelectionLimit: section === "desserts" ? limit : menu.dessertSelectionLimit
        });
    };

    const toggle = (section: SectionKey, dish: CateringPackageDish) => {
        const selected = selectedFor(section);
        update(section,
            selected.some(d => sameDish(d, dish))
                ? selected.filter(d => !sameDish(d, dish))
                : [...selected, dish]
        );
    };

    const sections = [
        ["vegetarian", "🥬", "Vegetarian"],
        ["nonVegetarian", "🍗", "Non-Vegetarian"],
        ["soups", "🥣", "Soups"],
        ["desserts", "🍰", "Desserts"]
    ] as const;

    return (
        <div className="catering-package-menu">
            <div className="catering-package-menu-header">
                <div>
                    <h4>Catering Menu</h4>
                    <p>Select dishes from the vendor's existing menu and define customer limits.</p>
                </div>
            </div>

            <div className="catering-package-menu-grid">
                {sections.map(([section, icon, title]) => {
                    const selected = selectedFor(section);
                    const items = available[section];
                    const open = openSection === section;

                    return (
                        <section
                            key={section}
                            className={`catering-package-menu-section ${selected.length ? "has-selection" : ""}`}
                        >
                            <button
                                type="button"
                                className="catering-package-menu-section-header"
                                onClick={() => setOpenSection(open ? null : section)}
                            >
                                <span className="catering-package-menu-section-title">
                                    <span className="catering-package-menu-icon">{icon}</span>
                                    <span>
                                        <strong>{title}</strong>
                                        <small>{selected.length} selected</small>
                                    </span>
                                </span>
                                <span>{open ? "▲" : "▼"}</span>
                            </button>

                            <div className="catering-package-menu-limit">
                                <label>
                                    Customer can select up to
                                    <NumericInput

                                        min="0"
                                        max={items.length}
                                        value={limitFor(section)}
                                        onChange={e => updateLimit(section, e.target.value)}
                                    />
                                    item{limitFor(section) === 1 ? "" : "s"}
                                </label>
                                <span>{items.length} available</span>
                            </div>

                            {open && (
                                <div className="catering-package-menu-options">
                                    {items.length === 0 ? (
                                        <div className="catering-package-menu-empty">
                                            No dishes available in the catering menu.
                                        </div>
                                    ) : items.map(dish => {
                                        const checked = selected.some(d => sameDish(d, dish));
                                        return (
                                            <label
                                                key={dish.id}
                                                className={`catering-package-menu-dish ${checked ? "selected" : ""}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggle(section, dish)}
                                                />
                                                <span className="catering-package-menu-check">
                                                    {checked ? "✓" : ""}
                                                </span>
                                                <span className="catering-package-menu-dish-info">
                                                    <strong>{dish.name}</strong>
                                                    <small>
                                                        {dish.category} • {dish.foodType}
                                                        {dish.custom ? " • Custom" : ""}
                                                    </small>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>

            <div className="catering-package-menu-summary">
                <strong>Package rules</strong>
                <span>
                    {menu.vegetarianDishes.length} veg •{" "}
                    {menu.nonVegetarianDishes.length} non-veg •{" "}
                    {menu.soupDishes.length} soups •{" "}
                    {menu.dessertDishes.length} desserts
                </span>
            </div>
        </div>
    );
}
