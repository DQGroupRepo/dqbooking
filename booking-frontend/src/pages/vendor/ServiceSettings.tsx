import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import ServiceSettingsService from "../../services/ServiceSettingsService";

import type { ServiceSettings } from "../../types/ServiceSettings";

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

    async function loadSettings(
        serviceId: string
    ) {

        const data =
            await ServiceSettingsService
                .getSettings(serviceId);

        setSettings(data);

    }

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {

        if (!settings) return;

        const { name, value, type, checked } = e.target;

        setSettings({

            ...settings,

            [name]:
                type === "checkbox"
                    ? checked
                    : Number(value)

        });

    }

    async function handleSave() {

        if (!serviceId || !settings) return;

        await ServiceSettingsService
            .updateSettings(serviceId, settings);

        toast.success("Settings updated.");

    }

    if (!settings) {

        return <h2>Loading...</h2>;

    }

    return (

        <section className="service-settings">

            <h1>Service Settings</h1>

            <div className="settings-grid">

                <label>

                    Minimum Advance Booking

                    <input
                        type="number"
                        name="minimumAdvanceDays"
                        value={settings.minimumAdvanceDays}
                        onChange={handleChange}
                    />

                </label>

                <label>

                    Maximum Advance Booking

                    <input
                        type="number"
                        name="maximumAdvanceDays"
                        value={settings.maximumAdvanceDays}
                        onChange={handleChange}
                    />

                </label>

                <label>

                    Minimum Guests

                    <input
                        type="number"
                        name="minimumGuests"
                        value={settings.minimumGuests}
                        onChange={handleChange}
                    />

                </label>

                <label>

                    Maximum Guests

                    <input
                        type="number"
                        name="maximumGuests"
                        value={settings.maximumGuests}
                        onChange={handleChange}
                    />

                </label>

                <label>

                    Deposit %

                    <input
                        type="number"
                        name="depositPercentage"
                        value={settings.depositPercentage}
                        onChange={handleChange}
                    />

                </label>

                <label>

                    Balance Due (Days)

                    <input
                        type="number"
                        name="balanceDueDays"
                        value={settings.balanceDueDays}
                        onChange={handleChange}
                    />

                </label>

                <label>

                    Free Cancellation (Days)

                    <input
                        type="number"
                        name="freeCancellationDays"
                        value={settings.freeCancellationDays}
                        onChange={handleChange}
                    />

                </label>

                <label>

                    Cancellation Fee %

                    <input
                        type="number"
                        name="cancellationFeePercentage"
                        value={settings.cancellationFeePercentage}
                        onChange={handleChange}
                    />

                </label>

                <label>

                    <input
                        type="checkbox"
                        name="active"
                        checked={settings.active}
                        onChange={handleChange}
                    />

                    Service Active

                </label>

                <label>

                    <input
                        type="checkbox"
                        name="instantBooking"
                        checked={settings.instantBooking}
                        onChange={handleChange}
                    />

                    Instant Booking

                </label>

            </div>

            <button
                onClick={handleSave}
            >

                Save Settings

            </button>

        </section>

    );

}