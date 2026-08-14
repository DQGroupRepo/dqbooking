import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BundleService from "../../services/BundleService";
import VendorServiceService from "../../services/VendorServiceService";
import type { VendorService } from "../../types/VendorService";
import "./VendorCreateBundle.css";

const VendorCreateBundle = () => {

const navigate = useNavigate();

const [services, setServices] =
    useState<VendorService[]>([]);

const [selectedServiceIds, setSelectedServiceIds] =
    useState<string[]>([]);

const [name, setName] =
    useState("");

const [description, setDescription] =
    useState("");

const [discountType, setDiscountType] =
    useState<
        "PERCENTAGE" | "FIXED"
    >("PERCENTAGE");

const [discountValue, setDiscountValue] =
    useState("");

const [loading, setLoading] =
    useState(true);

const [saving, setSaving] =
    useState(false);

const [error, setError] =
    useState("");

useEffect(() => {

    const loadServices = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await VendorServiceService
                    .getServices();

            setServices(data);

        } catch (err) {

            console.error(
                "Failed to load vendor services:",
                err
            );

            setError(
                "Failed to load your services."
            );

        } finally {

            setLoading(false);

        }

    };

    loadServices();

}, []);

const toggleService = (
    serviceId: string
) => {

    setSelectedServiceIds(
        current => {

            if (
                current.includes(serviceId)
            ) {

                return current.filter(
                    id => id !== serviceId
                );

            }

            return [
                ...current,
                serviceId
            ];

        }
    );

};

const handleSubmit = async (
    event: React.FormEvent
) => {

    event.preventDefault();

    setError("");

    if (!name.trim()) {

        setError(
            "Bundle name is required."
        );

        return;
    }

    if (
        selectedServiceIds.length < 2
    ) {

        setError(
            "A bundle must contain at least two services."
        );

        return;
    }

    const numericDiscount =
        Number(discountValue);

    if (
        !Number.isFinite(numericDiscount) ||
        numericDiscount <= 0
    ) {

        setError(
            "Enter a valid discount value."
        );

        return;
    }

    if (
        discountType === "PERCENTAGE" &&
        numericDiscount > 100
    ) {

        setError(
            "Percentage discount cannot exceed 100%."
        );

        return;
    }

    try {

        setSaving(true);

        await BundleService.createBundle({

            name: name.trim(),

            description:
                description.trim() ||
                undefined,

            serviceIds:
                selectedServiceIds,

            discountType,

            discountValue:
                numericDiscount

        });

        navigate(
            "/vendor/bundles"
        );

    } catch (err) {

        console.error(
            "Failed to create bundle:",
            err
        );

        setError(
            "Failed to create bundle."
        );

    } finally {

        setSaving(false);

    }

};

return (

    <div className="vendor-create-bundle">

        <div className="create-bundle-header">

            <div>

                <h1>
                    Create Bundle
                </h1>

                <p>
                    Combine two or more services
                    and offer customers a discount.
                </p>

            </div>

        </div>

        {error && (

            <div className="bundle-form-error">
                {error}
            </div>

        )}

        <form
            className="bundle-form"
            onSubmit={handleSubmit}
        >

            <div className="form-section">

                <label>
                    Bundle Name
                </label>

                <input
                    type="text"
                    value={name}
                    onChange={event =>
                        setName(
                            event.target.value
                        )
                    }
                    placeholder="Example: Wedding Complete Package"
                />

            </div>

            <div className="form-section">

                <label>
                    Description
                </label>

                <textarea
                    value={description}
                    onChange={event =>
                        setDescription(
                            event.target.value
                        )
                    }
                    placeholder="Describe what this bundle offers..."
                    rows={4}
                />

            </div>

            <div className="form-section">

                <label>
                    Select Services
                </label>

                <p className="form-help">
                    Select at least two services
                    to create a bundle.
                </p>

                {loading ? (

                    <div className="services-loading">
                        Loading services...
                    </div>

                ) : services.length === 0 ? (

                    <div className="services-empty">
                        You don't have any services
                        available for bundling.
                    </div>

                ) : (

                    <div className="service-selection-grid">

                        {services.map(service => {

                            const selected =
                                selectedServiceIds.includes(
                                    service.id
                                );

                            return (

                                <button
                                    type="button"
                                    key={service.id}
                                    className={
                                        selected
                                            ? "service-selection-card selected"
                                            : "service-selection-card"
                                    }
                                    onClick={() =>
                                        toggleService(
                                            service.id
                                        )
                                    }
                                >

                                    <span className="service-check">

                                        {selected
                                            ? "✓"
                                            : ""}

                                    </span>

                                    <div>

                                        <strong>
                                            {service.serviceName}
                                        </strong>

                                    </div>

                                </button>

                            );

                        })}

                    </div>

                )}

            </div>

            <div className="form-section">

                <label>
                    Discount Type
                </label>

                <select
                    value={discountType}
                    onChange={event =>
                        setDiscountType(
                            event.target.value as
                                "PERCENTAGE" |
                                "FIXED"
                        )
                    }
                >

                    <option value="PERCENTAGE">
                        Percentage
                    </option>

                    <option value="FIXED">
                        Fixed Amount
                    </option>

                </select>

            </div>

            <div className="form-section">

                <label>
                    Discount Value
                </label>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountValue}
                    onChange={event =>
                        setDiscountValue(
                            event.target.value
                        )
                    }
                    placeholder={
                        discountType ===
                        "PERCENTAGE"
                            ? "Example: 10"
                            : "Example: 5000"
                    }
                />

            </div>

            <div className="bundle-form-actions">

                <button
                    type="button"
                    className="cancel-button"
                    onClick={() =>
                        navigate(
                            "/vendor/bundles"
                        )
                    }
                    disabled={saving}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="save-bundle-button"
                    disabled={
                        saving ||
                        loading ||
                        selectedServiceIds.length < 2
                    }
                >
                    {saving
                        ? "Creating..."
                        : "Create Bundle"}
                </button>

            </div>

        </form>

    </div>

);

};

export default VendorCreateBundle;
