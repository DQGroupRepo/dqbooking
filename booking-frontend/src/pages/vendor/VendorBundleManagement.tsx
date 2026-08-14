import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BundleService from "../../services/BundleService";
import type { Bundle } from "../../types/Bundle";
import "./VendorBundleManagement.css";

const VendorBundleManagement = () => {


const navigate = useNavigate();

const [bundles, setBundles] = useState<Bundle[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const loadBundles = async () => {

    try {

        setLoading(true);
        setError("");

        const data =
            await BundleService.getVendorBundles();

        setBundles(data);

    } catch (err) {

        console.error(
            "Failed to load bundles:",
            err
        );

        setError(
            "Failed to load bundles."
        );

    } finally {

        setLoading(false);

    }
};

useEffect(() => {
    loadBundles();
}, []);

const handleActivate = async (
    bundleId: string
) => {

    try {

        await BundleService.activateBundle(
            bundleId
        );

        await loadBundles();

    } catch (err) {

        console.error(
            "Failed to activate bundle:",
            err
        );

        setError(
            "Failed to activate bundle."
        );

    }
};

const handleDeactivate = async (
    bundleId: string
) => {

    try {

        await BundleService.deactivateBundle(
            bundleId
        );

        await loadBundles();

    } catch (err) {

        console.error(
            "Failed to deactivate bundle:",
            err
        );

        setError(
            "Failed to deactivate bundle."
        );

    }
};

const handleEdit = (
    bundleId: string
) => {

    navigate(
        `/vendor/bundles/edit/${bundleId}`
    );

};

return (

    <div className="vendor-bundle-management">

        <div className="bundle-page-header">

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
                    navigate(
                        "/vendor/bundles/create"
                    )
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

        {loading ? (

            <div className="bundle-loading">
                Loading bundles...
            </div>

        ) : bundles.length === 0 ? (

            <div className="bundle-empty">

                <h3>
                    No bundles created yet
                </h3>

                <p>
                    Create your first bundle to offer
                    customers a discounted combination
                    of services.
                </p>

                <button
                    className="create-bundle-button"
                    onClick={() =>
                        navigate(
                            "/vendor/bundles/create"
                        )
                    }
                >
                    Create Bundle
                </button>

            </div>

        ) : (

            <div className="bundle-grid">

                {bundles.map(bundle => (

                    <div
                        className="bundle-card"
                        key={bundle.id}
                    >

                        <div className="bundle-card-header">

                            <div>

                                <h3>
                                    {bundle.name}
                                </h3>

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

                        </div>

                        {bundle.description && (

                            <p className="bundle-description">
                                {bundle.description}
                            </p>

                        )}

                        <div className="bundle-details">

                            <div>
                                <span>
                                    Services
                                </span>

                                <strong>
                                    {bundle.serviceIds.length}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Discount
                                </span>

                                <strong>
                                    {bundle.discountType ===
                                    "PERCENTAGE"
                                        ? `${bundle.discountValue}%`
                                        : `₹${bundle.discountValue}`}
                                </strong>
                            </div>

                        </div>

                        <div className="bundle-actions">

                            <button
                                className="bundle-edit-button"
                                onClick={() =>
                                    handleEdit(
                                        bundle.id
                                    )
                                }
                            >
                                Edit
                            </button>

                            {bundle.active ? (

                                <button
                                    className="bundle-deactivate-button"
                                    onClick={() =>
                                        handleDeactivate(
                                            bundle.id
                                        )
                                    }
                                >
                                    Deactivate
                                </button>

                            ) : (

                                <button
                                    className="bundle-activate-button"
                                    onClick={() =>
                                        handleActivate(
                                            bundle.id
                                        )
                                    }
                                >
                                    Activate
                                </button>

                            )}

                        </div>

                    </div>

                ))}

            </div>

        )}

    </div>

);

};

export default VendorBundleManagement;
