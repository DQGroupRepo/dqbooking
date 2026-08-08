import type { ServiceSettings } from "../../../types/ServiceSettings";

interface Props {

    settings: ServiceSettings;

    onNumberChange: (
        e: React.ChangeEvent<HTMLInputElement>
    ) => void;

}

export default function BookingSettingsSection({

    settings,

    onNumberChange

}: Props) {

    return (

        <div className="settings-section">

            <h2>

                Booking Rules

            </h2>

            <div className="settings-grid">

                <label>

                    Minimum Advance Booking

                    <input

                        type="number"

                        name="minimumAdvanceDays"

                        value={settings.minimumAdvanceDays}

                        onChange={onNumberChange}

                    />

                </label>

                <label>

                    Maximum Advance Booking

                    <input

                        type="number"

                        name="maximumAdvanceDays"

                        value={settings.maximumAdvanceDays}

                        onChange={onNumberChange}

                    />

                </label>

                <label>

                    Minimum Guests

                    <input

                        type="number"

                        name="minimumGuests"

                        value={settings.minimumGuests}

                        onChange={onNumberChange}

                    />

                </label>

                <label>

                    Maximum Guests

                    <input

                        type="number"

                        name="maximumGuests"

                        value={settings.maximumGuests}

                        onChange={onNumberChange}

                    />

                </label>

                <label>

                    Deposit %

                    <input

                        type="number"

                        name="depositPercentage"

                        value={settings.depositPercentage}

                        onChange={onNumberChange}

                    />

                </label>

                <label>

                    Balance Due (Days)

                    <input

                        type="number"

                        name="balanceDueDays"

                        value={settings.balanceDueDays}

                        onChange={onNumberChange}

                    />

                </label>

            </div>

        </div>

    );

}