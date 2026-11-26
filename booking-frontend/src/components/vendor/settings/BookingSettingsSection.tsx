import NumericInput from "../../common/ui/NumericInput";
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

                    <NumericInput



                        name="minimumAdvanceDays"

                        value={settings.minimumAdvanceDays}

                        onChange={onNumberChange}

                    />

                </label>

                <label>

                    Maximum Advance Booking

                    <NumericInput



                        name="maximumAdvanceDays"

                        value={settings.maximumAdvanceDays}

                        onChange={onNumberChange}

                    />

                </label>

                <label>

                    Minimum Guests

                    <NumericInput



                        name="minimumGuests"

                        value={settings.minimumGuests}

                        onChange={onNumberChange}

                    />

                </label>

                <label>

                    Maximum Guests

                    <NumericInput



                        name="maximumGuests"

                        value={settings.maximumGuests}

                        onChange={onNumberChange}

                    />

                </label>

                <label>

                    Deposit %

                    <NumericInput



                        name="depositPercentage"

                        value={settings.depositPercentage}

                        onChange={onNumberChange}

                    />

                </label>

                <label>

                    Balance Due (Days)

                    <NumericInput



                        name="balanceDueDays"

                        value={settings.balanceDueDays}

                        onChange={onNumberChange}

                    />

                </label>

            </div>

        </div>

    );

}
