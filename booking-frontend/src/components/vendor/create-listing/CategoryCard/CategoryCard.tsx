import type { VendorCategory } from "../../../../types/VendorCategory";

import styles from "./CategoryCard.module.css";

interface Props {
    category: VendorCategory;
    onClick: () => void;
}

export default function CategoryCard({
    category,
    onClick,
}: Props) {

    return (

        <div
            className={styles.card}
            onClick={onClick}
        >

            <div className={styles.icon}>

                {category.icon}

            </div>

            <h3>{category.name}</h3>

            <p>{category.description}</p>

            <button className={styles.button}>
                Create Listing
            </button>

        </div>

    );

}