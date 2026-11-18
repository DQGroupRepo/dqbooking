import NumericInput from "../../common/ui/NumericInput";
import type {
    CancellationPolicy,
    RefundRule
} from "../../../types/ServiceSettings";

interface Props {

    policy: CancellationPolicy;

    updateCancellationPolicy: (
        field: keyof CancellationPolicy,
        value: any
    ) => void;

    updateRefundRule: (
        index: number,
        field: keyof RefundRule,
        value: number | null
    ) => void;

    addRefundRule: () => void;

    removeRefundRule: (
        index: number
    ) => void;

}

export default function CancellationPolicySection({

    policy,

    updateCancellationPolicy,

    updateRefundRule,

    addRefundRule,

    removeRefundRule

}: Props) {

    return (

        <div className="settings-section">

            <h2>

                Cancellation Policy

            </h2>

            <label className="checkbox-field">

                <input

                    type="checkbox"

                    checked={policy.allowCancellation}

                    onChange={(e) =>

                        updateCancellationPolicy(

                            "allowCancellation",

                            e.target.checked

                        )

                    }

                />

                Allow Customers To Cancel

            </label>

            <div className="policy-grid">

                <label>

                    Refund Based On

                    <select

                        value={policy.refundOn}

                        onChange={(e) =>

                            updateCancellationPolicy(

                                "refundOn",

                                e.target.value

                            )

                        }

                    >

                        <option value="PAID_AMOUNT">

                            Paid Amount

                        </option>

                        <option value="TOTAL_AMOUNT">

                            Total Amount

                        </option>

                    </select>

                </label>

                <label>

                    Processing Days

                    <NumericInput



                        min={1}

                        value={policy.processingDays}

                        onChange={(e) =>

                            updateCancellationPolicy(

                                "processingDays",

                                Number(e.target.value)

                            )

                        }

                    />

                </label>

            </div>

            <div className="section-header">

                <h2>

                    Refund Rules

                </h2>

                <button

                    type="button"

                    className="add-rule"

                    onClick={addRefundRule}

                >

                    + Add Rule

                </button>

            </div>

            <div className="rule-list">

                {

                    policy.refundRules.map((rule, index) => (

                        <div

                            key={index}

                            className="rule-card"

                        >

                            <div className="rule-card-header">

                                <h3>

                                    Rule {index + 1}

                                </h3>

                                <button

                                    type="button"

                                    className="delete-rule"

                                    onClick={() =>

                                        removeRefundRule(index)

                                    }

                                >

                                    Remove

                                </button>

                            </div>

                            <div className="rule-grid">

                                <label>

                                    From Days

                                    <NumericInput



                                        value={rule.minDaysBeforeEvent}

                                        onChange={(e) =>

                                            updateRefundRule(

                                                index,

                                                "minDaysBeforeEvent",

                                                Number(e.target.value)

                                            )

                                        }

                                    />

                                </label>

                                <label>

                                    To Days

                                    <NumericInput



                                        value={rule.maxDaysBeforeEvent ?? ""}

                                        onChange={(e) =>

                                            updateRefundRule(

                                                index,

                                                "maxDaysBeforeEvent",

                                                e.target.value === ""

                                                    ? null

                                                    : Number(e.target.value)

                                            )

                                        }

                                    />

                                </label>

                                <label>

                                    Refund %

                                    <NumericInput



                                        min={0}

                                        max={100}

                                        value={rule.refundPercentage}

                                        onChange={(e) =>

                                            updateRefundRule(

                                                index,

                                                "refundPercentage",

                                                Number(e.target.value)

                                            )

                                        }

                                    />

                                </label>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

}
