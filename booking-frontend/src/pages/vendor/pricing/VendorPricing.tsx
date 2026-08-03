import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import VendorPricingService from "../../../services/VendorPricingService";
import toast from "react-hot-toast";
import type {
    VendorServicePricing,
    VendorPricingHead,
    VendorDiscount
} from "../../../types/VendorPricing";

import "./VendorPricing.css";

const emptyPricing: VendorServicePricing = {

    serviceId: "",

    effectiveFrom: "",

    effectiveUntil: "",

    baseAmount: 0,

    pricingHeads: [],

    discounts: [],

    paymentConfiguration: {

        advancePaymentAllowed: false,

        advancePercentage: 0

    },

    cancellationPolicy: {

        refundPercentage: 0,

        cancelBeforeDays: 0

    }

};

const VendorPricing = () => {

    const { serviceId } = useParams();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [pricing, setPricing] =
        useState<VendorServicePricing>(emptyPricing);

    useEffect(() => {
        if (!serviceId) {

            return;

        }

        loadPricing();

    }, [serviceId]);

    async function loadPricing() {
        try {

            setLoading(true);

            const response =
                await VendorPricingService.getPricing(serviceId!);

            if (response) {

                setPricing(response);

            } else {

                setPricing({

                    ...emptyPricing,

                    serviceId: serviceId!

                });

            }

        } catch {
            setPricing({

                ...emptyPricing,

                serviceId: serviceId!

            });

        } finally {
            setLoading(false);

        }

    }

    function updateBaseAmount(value: string) {

        setPricing({

            ...pricing,

            baseAmount: Number(value)

        });

    }

    function updateEffectiveFrom(value: string) {

        setPricing({

            ...pricing,

            effectiveFrom: value

        });

    }

    function updateEffectiveUntil(value: string) {

        setPricing({

            ...pricing,

            effectiveUntil: value

        });

    }

    function updateAdvanceAllowed(value: boolean) {

        setPricing({

            ...pricing,

            paymentConfiguration: {

                ...pricing.paymentConfiguration,

                advancePaymentAllowed: value

            }

        });

    }

    function updateAdvancePercentage(value: string) {

        setPricing({

            ...pricing,

            paymentConfiguration: {

                ...pricing.paymentConfiguration,

                advancePercentage: Number(value)

            }

        });

    }

    function updateRefundPercentage(value: string) {

        setPricing({

            ...pricing,

            cancellationPolicy: {

                ...pricing.cancellationPolicy,

                refundPercentage: Number(value)

            }

        });

    }

    function updateCancelBeforeDays(value: string) {

        setPricing({

            ...pricing,

            cancellationPolicy: {

                ...pricing.cancellationPolicy,

                cancelBeforeDays: Number(value)

            }

        });

    }
    function addPricingHead() {

        const head: VendorPricingHead = {

            code: "",

            name: "",

            calculationType: "FIXED",

            value: 0,

            displayOrder: pricing.pricingHeads.length + 1,

            active: true

        };

        setPricing({

            ...pricing,

            pricingHeads: [

                ...pricing.pricingHeads,

                head

            ]

        });

    }

    function updatePricingHead(

        index: number,

        field: keyof VendorPricingHead,

        value: any

    ) {

        const updated = [...pricing.pricingHeads];

        updated[index] = {

            ...updated[index],

            [field]: value

        };

        setPricing({

            ...pricing,

            pricingHeads: updated

        });

    }

    function removePricingHead(index: number) {

        setPricing({

            ...pricing,

            pricingHeads:

                pricing.pricingHeads.filter(

                    (_, i) => i !== index

                )

        });

    }

    function addDiscount() {

        const discount: VendorDiscount = {

            name: "",

            discountType: "FIXED",

            value: 0,

            active: true

        };

        setPricing({

            ...pricing,

            discounts: [

                ...pricing.discounts,

                discount

            ]

        });

    }

    function updateDiscount(

        index: number,

        field: keyof VendorDiscount,

        value: any

    ) {

        const updated = [...pricing.discounts];

        updated[index] = {

            ...updated[index],

            [field]: value

        };

        setPricing({

            ...pricing,

            discounts: updated

        });

    }

    function removeDiscount(index: number) {

        setPricing({

            ...pricing,

            discounts:

                pricing.discounts.filter(

                    (_, i) => i !== index

                )

        });

    }

    async function save() {

        if (!serviceId) {
                return;
        }
        try {
            if (!pricing.baseAmount || pricing.baseAmount <= 0) {
                toast.error("Enter a valid base amount.");
                return;
            }

            if (!pricing.effectiveFrom) {
                toast.error("Select Effective From date.");
                return;
            }

            setSaving(true);

            await VendorPricingService.savePricing({...pricing, serviceId});

            toast.success("Pricing saved successfully.");

            navigate("/vendor/manage-services");

        }

        catch {

            alert("Unable to save pricing.");

        }

        finally {

            setSaving(false);

        }

    }

    if (loading) {

        return <h2>Loading Pricing...</h2>;

    }

    return (

        <div className="vendor-pricing-page">

            <div className="pricing-header">

                <div>

                    <h2>

                        Pricing Configuration

                    </h2>

                    <p>

                        Configure pricing, discounts and payment settings.

                    </p>

                </div>

                <div className="header-actions">

                    <button

                        className="cancel-btn"

                        onClick={() => navigate(-1)}

                    >

                        Cancel

                    </button>

                    <button

                        className="save-btn"

                        onClick={save}

                        disabled={saving}

                    >

                        {saving ? "Saving..." : "Save Pricing"}

                    </button>

                </div>

            </div>

            <div className="pricing-grid">

                <div className="pricing-left">

                                    <section className="pricing-card">

                                        <h3>Base Pricing</h3>

                                        <div className="form-grid">

                                            <div className="form-group">

                                                <label>

                                                    Base Amount

                                                </label>

                                                <input

                                                    type="number"

                                                    value={pricing.baseAmount}

                                                    onChange={(e) =>
                                                        updateBaseAmount(
                                                            e.target.value
                                                        )
                                                    }

                                                />

                                            </div>

                                            <div className="form-group">

                                                <label>

                                                    Effective From

                                                </label>

                                                <input

                                                    type="date"

                                                    value={pricing.effectiveFrom ?? ""}

                                                    onChange={(e) =>
                                                        updateEffectiveFrom(
                                                            e.target.value
                                                        )
                                                    }

                                                />

                                            </div>

                                            <div className="form-group">

                                                <label>

                                                    Effective Until

                                                </label>

                                                <input

                                                    type="date"

                                                    value={pricing.effectiveUntil ?? ""}

                                                    onChange={(e) =>
                                                        updateEffectiveUntil(
                                                            e.target.value
                                                        )
                                                    }

                                                />

                                            </div>

                                        </div>

                                    </section>


                                    <section className="pricing-card">

                                        <div className="section-header">

                                            <h3>

                                                Pricing Heads

                                            </h3>

                                            <button
                                                onClick={addPricingHead}
                                            >

                                                + Add

                                            </button>

                                        </div>

                                        {

                                            pricing.pricingHeads.map((head, index) => (

                                                <div
                                                    className="pricing-row"
                                                    key={index}
                                                >

                                                    <input

                                                        placeholder="Code"

                                                        value={head.code}

                                                        onChange={(e) =>
                                                            updatePricingHead(
                                                                index,
                                                                "code",
                                                                e.target.value
                                                            )
                                                        }

                                                    />

                                                    <input

                                                        placeholder="Name"

                                                        value={head.name}

                                                        onChange={(e) =>
                                                            updatePricingHead(
                                                                index,
                                                                "name",
                                                                e.target.value
                                                            )
                                                        }

                                                    />

                                                    <select

                                                        value={head.calculationType}

                                                        onChange={(e) =>
                                                            updatePricingHead(
                                                                index,
                                                                "calculationType",
                                                                e.target.value
                                                            )
                                                        }

                                                    >

                                                        <option value="FIXED">

                                                            Fixed

                                                        </option>

                                                        <option value="PERCENTAGE">

                                                            Percentage

                                                        </option>

                                                    </select>

                                                    <input

                                                        type="number"

                                                        value={head.value}

                                                        onChange={(e) =>
                                                            updatePricingHead(
                                                                index,
                                                                "value",
                                                                Number(e.target.value)
                                                            )
                                                        }

                                                    />

                                                    <button

                                                        className="delete-btn"

                                                        onClick={() =>
                                                            removePricingHead(index)
                                                        }

                                                    >

                                                        Remove

                                                    </button>

                                                </div>

                                            ))

                                        }

                                    </section>

                                                        <section className="pricing-card">

                                                            <div className="section-header">

                                                                <h3>

                                                                    Discounts

                                                                </h3>

                                                                <button
                                                                    onClick={addDiscount}
                                                                >

                                                                    + Add

                                                                </button>

                                                            </div>

                                                            {

                                                                pricing.discounts.map((discount, index) => (

                                                                    <div
                                                                        className="pricing-row"
                                                                        key={index}
                                                                    >

                                                                        <input

                                                                            placeholder="Discount Name"

                                                                            value={discount.name}

                                                                            onChange={(e) =>
                                                                                updateDiscount(
                                                                                    index,
                                                                                    "name",
                                                                                    e.target.value
                                                                                )
                                                                            }

                                                                        />

                                                                        <select

                                                                            value={discount.discountType}

                                                                            onChange={(e) =>
                                                                                updateDiscount(
                                                                                    index,
                                                                                    "discountType",
                                                                                    e.target.value
                                                                                )
                                                                            }

                                                                        >

                                                                            <option value="FIXED">

                                                                                Fixed

                                                                            </option>

                                                                            <option value="PERCENTAGE">

                                                                                Percentage

                                                                            </option>

                                                                        </select>

                                                                        <input

                                                                            type="number"

                                                                            value={discount.value}

                                                                            onChange={(e) =>
                                                                                updateDiscount(
                                                                                    index,
                                                                                    "value",
                                                                                    Number(e.target.value)
                                                                                )
                                                                            }

                                                                        />

                                                                        <button

                                                                            className="delete-btn"

                                                                            onClick={() =>
                                                                                removeDiscount(index)
                                                                            }

                                                                        >

                                                                            Remove

                                                                        </button>

                                                                    </div>

                                                                ))

                                                            }

                                                        </section>


                                                        <section className="pricing-card">

                                                            <h3>

                                                                Payment Configuration

                                                            </h3>

                                                            <label className="checkbox">

                                                                <input

                                                                    type="checkbox"

                                                                    checked={
                                                                        pricing.paymentConfiguration
                                                                            ?.advancePaymentAllowed
                                                                    }

                                                                    onChange={(e) =>
                                                                        updateAdvanceAllowed(
                                                                            e.target.checked
                                                                        )
                                                                    }

                                                                />

                                                                Allow Advance Payment

                                                            </label>

                                                            <div className="form-group">

                                                                <label>

                                                                    Advance Percentage

                                                                </label>

                                                                <input

                                                                    type="number"

                                                                    value={
                                                                        pricing.paymentConfiguration
                                                                            ?.advancePercentage
                                                                    }

                                                                    onChange={(e) =>
                                                                        updateAdvancePercentage(
                                                                            e.target.value
                                                                        )
                                                                    }

                                                                />

                                                            </div>

                                                        </section>


                                                        <section className="pricing-card">

                                                            <h3>

                                                                Cancellation Policy

                                                            </h3>

                                                            <div className="form-group">

                                                                <label>

                                                                    Refund Percentage

                                                                </label>

                                                                <input

                                                                    type="number"

                                                                    value={
                                                                        pricing.cancellationPolicy
                                                                            ?.refundPercentage
                                                                    }

                                                                    onChange={(e) =>
                                                                        updateRefundPercentage(
                                                                            e.target.value
                                                                        )
                                                                    }

                                                                />

                                                            </div>

                                                            <div className="form-group">

                                                                <label>

                                                                    Cancellation Before (Days)

                                                                </label>

                                                                <input

                                                                    type="number"

                                                                    value={
                                                                        pricing.cancellationPolicy
                                                                            ?.cancelBeforeDays
                                                                    }

                                                                    onChange={(e) =>
                                                                        updateCancelBeforeDays(
                                                                            e.target.value
                                                                        )
                                                                    }

                                                                />

                                                            </div>

                                                        </section>

                                                    </div>
                                                                <div className="pricing-right">

                                                                    <section className="pricing-card">

                                                                        <h3>

                                                                            Pricing Summary

                                                                        </h3>

                                                                        <div className="summary-row">

                                                                            <span>

                                                                                Base Amount

                                                                            </span>

                                                                            <strong>

                                                                                ₹{pricing.baseAmount.toLocaleString("en-IN")}

                                                                            </strong>

                                                                        </div>

                                                                        {

                                                                            pricing.pricingHeads.map((head, index) => (

                                                                                <div
                                                                                    key={index}
                                                                                    className="summary-row"
                                                                                >

                                                                                    <span>

                                                                                        {head.name || "Pricing Head"}

                                                                                    </span>

                                                                                    <strong>

                                                                                        {head.calculationType === "FIXED"

                                                                                            ? `₹${head.value}`

                                                                                            : `${head.value}%`
                                                                                        }

                                                                                    </strong>

                                                                                </div>

                                                                            ))

                                                                        }

                                                                        {

                                                                            pricing.discounts.map((discount, index) => (

                                                                                <div
                                                                                    key={index}
                                                                                    className="summary-row discount"
                                                                                >

                                                                                    <span>

                                                                                        {discount.name || "Discount"}

                                                                                    </span>

                                                                                    <strong>

                                                                                        {discount.discountType === "FIXED"

                                                                                            ? `- ₹${discount.value}`

                                                                                            : `- ${discount.value}%`
                                                                                        }

                                                                                    </strong>

                                                                                </div>

                                                                            ))

                                                                        }

                                                                        <hr />

                                                                        <div className="summary-row">

                                                                            <span>

                                                                                Advance Payment

                                                                            </span>

                                                                            <strong>

                                                                                {pricing.paymentConfiguration?.advancePaymentAllowed

                                                                                    ? `${pricing.paymentConfiguration.advancePercentage}%`

                                                                                    : "Disabled"}

                                                                            </strong>

                                                                        </div>

                                                                        <div className="summary-row">

                                                                            <span>

                                                                                Cancellation

                                                                            </span>

                                                                            <strong>

                                                                                {pricing.cancellationPolicy?.refundPercentage}% Refund

                                                                            </strong>

                                                                        </div>

                                                                    </section>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    );

                                                };

                                                export default VendorPricing;