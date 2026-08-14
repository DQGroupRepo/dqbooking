import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BundleService from "../../services/BundleService";
import type { Bundle } from "../../types/Bundle";

import "./VendorBundles.css";

const VendorBundles = () => {

    const navigate = useNavigate();

    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        loadBundles();

    }, []);

    const loadBundles = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await BundleService.getVendorBundles();

            setBundles(data);

        } catch (error) {

            console.error(
                "Failed to load bundles",
                error
            );

            setError(
                "Unable to load bundles."
            );

        } finally {

            setLoading(false);

        }
    };

    const formatDiscount = (
        bundle: Bundle
    ) => {

        if (bundle.discountType === "PERCENTAGE") {

            return `${bundle.discountValue}%`;

        }

        return `₹${bundle.discountValue}`;

    };

    if (loading) {

        return (
            <div className="vendor-bundles-page">
                <p>Loading bundles...</p>
            </div>
        );

    }

    return (

        <div className="vendor-bundles-page">

            <div className="bundles-header">

                <div>

                    <h1>
                        Bundles
                    </h1>

                    <p>
                        Create and manage service bundles
                        for your customers.
                    </p>

                </div>

                <button
                    className="create-bundle-button"
                    onClick={() =>
                        navigate("/vendor/bundles/create")
                    }
                >
                    + Create Bundle
                </button>

            </div>

            {error && (

                <div className="bundle-error">
                    {error}
                </div>

            )}

            {!error && bundles.length === 0 && (

                <div className="empty-bundles">

                    <h2>
                        No bundles created yet
                    </h2>

                    <p>
                        Combine services and offer
                        customers a special discount.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/vendor/bundles/create")
                        }
                    >
                        Create Your First Bundle
                    </button>

                </div>

            )}

            {bundles.length > 0 && (

                <div className="bundles-grid">

                    {bundles.map(bundle => (

                        <div
                            className="bundle-card"
                            key={bundle.id}
                        >

                            <div className="bundle-card-header">

                                <div>

                                    <h2>
                                        {bundle.name}
                                    </h2>

                                    <span
                                        className={
                                            bundle.active
                                                ? "bundle-status active"
                                                : "bundle-status inactive"
                                        }
                                    >
                                        {bundle.active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>

                                </div>

                                <div className="bundle-discount">

                                    {formatDiscount(bundle)}

                                    <span>
                                        off
                                    </span>

                                </div>

                            </div>

                            {bundle.description && (

                                <p className="bundle-description">
                                    {bundle.description}
                                </p>

                            )}

                            <div className="bundle-services">

                                <span>
                                    {bundle.serviceIds.length}
                                </span>

                                <span>
                                    services included
                                </span>

                            </div>

                            <button
                                className="bundle-edit-button"
                                onClick={() =>
                                    navigate(
                                        `/vendor/bundles/edit/${bundle.id}`
                                    )
                                }
                            >
                                Manage Bundle
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
};

export default VendorBundles;