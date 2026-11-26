import Loader from "../../components/common/Loader";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import ServiceSettingsService from "../../services/ServiceSettingsService";
import BookingSettingsSection from "../../components/vendor/settings/BookingSettingsSection";
import CancellationPolicySection from "../../components/vendor/settings/CancellationPolicySection";

import type {
    ServiceSettings,
    RefundRule
} from "../../types/ServiceSettings";

import "./ServiceSettings.css";

export default function ServiceSettings() {

    const { serviceId } = useParams();

    const [settings, setSettings] =
        useState<ServiceSettings>();

    useEffect(() => {

        if (serviceId) {

            loadSettings(serviceId);

        }

    }, [serviceId]);

    async function loadSettings(id: string) {

        const data =
            await ServiceSettingsService
                .getSettings(id);

        setSettings(data);

    }

    async function handleSave() {

        if (!serviceId || !settings) return;

        await ServiceSettingsService.updateSettings(

            serviceId,

            settings

        );

        toast.success("Settings updated.");

    }

    function handleNumberChange(

        e: React.ChangeEvent<HTMLInputElement>

    ) {

        if (!settings) return;

        const { name, value } = e.target;

        setSettings({

            ...settings,

            [name]: Number(value)

        });

    }

    function handleCheckboxChange(

        e: React.ChangeEvent<HTMLInputElement>

    ) {

        if (!settings) return;

        const { name, checked } = e.target;

        setSettings({

            ...settings,

            [name]: checked

        });

    }

    const updateCancellationPolicy = (

        field: keyof ServiceSettings["cancellationPolicy"],

        value: any

    ) => {

        if (!settings) return;

        setSettings({

            ...settings,

            cancellationPolicy: {

                ...settings.cancellationPolicy,

                [field]: value

            }

        });

    };

    const updateRefundRule = (

        index: number,

        field: keyof RefundRule,

        value: number | null

    ) => {

        if (!settings) return;

        const rules = [...settings.cancellationPolicy.refundRules];

        rules[index] = {

            ...rules[index],

            [field]: value

        };

        setSettings({

            ...settings,

            cancellationPolicy: {

                ...settings.cancellationPolicy,

                refundRules: rules

            }

        });

    };

    const addRefundRule = () => {

        if (!settings) return;

        setSettings({

            ...settings,

            cancellationPolicy: {

                ...settings.cancellationPolicy,

                refundRules: [

                    ...settings.cancellationPolicy.refundRules,

                    {

                        minDaysBeforeEvent: 0,

                        maxDaysBeforeEvent: null,

                        refundPercentage: 100

                    }

                ]

            }

        });

    };

    const removeRefundRule = (

        index: number

    ) => {

        if (!settings) return;

        const rules = [...settings.cancellationPolicy.refundRules];

        rules.splice(index, 1);

        setSettings({

            ...settings,

            cancellationPolicy: {

                ...settings.cancellationPolicy,

                refundRules: rules

            }

        });

    };

    if (!settings) {

        return <Loader />;

    }

    return (

        <section className="service-settings">

            <h1>

                Service Settings

            </h1>

            {/* ======================================
                BOOKING RULES
            ======================================= */}

            <BookingSettingsSection

                settings={settings}

                onNumberChange={handleNumberChange}

            />

            {/* ======================================
                CANCELLATION POLICY
            ======================================= */}

            <CancellationPolicySection

                policy={settings.cancellationPolicy}

                updateCancellationPolicy={updateCancellationPolicy}

                updateRefundRule={updateRefundRule}

                addRefundRule={addRefundRule}

                removeRefundRule={removeRefundRule}

            />

            {/* ======================================
                OTHER SETTINGS
            ======================================= */}

            <div className="settings-section">

                <h2>

                    Other Settings

                </h2>

                <div className="other-settings">

                    <label className="checkbox-field">

                        <input

                            type="checkbox"

                            name="active"

                            checked={settings.active}

                            onChange={handleCheckboxChange}

                        />

                        Service Active

                    </label>

                    <label className="checkbox-field">

                        <input

                            type="checkbox"

                            name="instantBooking"

                            checked={settings.instantBooking}

                            onChange={handleCheckboxChange}

                        />

                        Instant Booking

                    </label>

                </div>

            </div>

            <div className="settings-actions">

                <button

                    className="settings-save-button"

                    onClick={handleSave}

                >

                    Save Settings

                </button>

            </div>

        </section>

    );

}

