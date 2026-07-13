import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CategoryCard from "../../components/vendor/create-listing/CategoryCard/CategoryCard";

import VendorCategoryService from "../../services/VendorCategoryService";

import type { VendorCategory } from "../../types/VendorCategory";

import styles from "./CreateListing.module.css";

export default function CreateListing() {

    const navigate = useNavigate();

    const [categories, setCategories] = useState<VendorCategory[]>([]);

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {

        const response =
            await VendorCategoryService.getCategories();

        setCategories(response);

    }

    return (

        <div className={styles.container}>

            <div className={styles.header}>

                <h1>Create New Listing</h1>

                <p>
                    Select the type of business you'd like to register on EventNest.
                </p>

            </div>

            <div className={styles.grid}>

                {

                    categories.map(category => (

                        <CategoryCard

                            key={category.id}

                            category={category}

                            onClick={() =>
                                navigate(`/vendor/add-service/${category.slug}`)
                            }

                        />

                    ))

                }

            </div>

        </div>

    );

}