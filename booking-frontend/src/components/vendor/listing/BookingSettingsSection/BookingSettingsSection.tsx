import Input from "../../../common/ui/Input/Input";
import SectionHeader from "../../../common/ui/SectionHeader/SectionHeader";
import type { VendorServiceForm } from "../../../../types/VendorServiceForm";

interface Props {

    formData: VendorServiceForm;

    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLSelectElement |
            HTMLTextAreaElement
        >
    ) => void;

}

export default function BookingSettingsSection({

    formData,

    handleChange

}: Props) {

    return (

        <>

            <SectionHeader

                title="Booking Settings"

                subtitle="Configure how customers can book this service."

            />

            <div className="settings-card">

                <h3>Booking Availability</h3>

                <p>
                    Control how many customers can book this service on the same date.
                </p>

                <Input

                    name="maxSimultaneousBookings"

                    type="number"

                    label="Maximum Simultaneous Bookings"

                    value={formData.maxSimultaneousBookings}

                    onChange={handleChange}

                />

                <small className="helper-text">

                    Set 1 for exclusive bookings or increase for shared venues.

                </small>

                <div className="info-box">

                    <h4>💡 Examples</h4>

                    <ul>

                        <li>1 - Exclusive booking</li>

                        <li>3 - Multiple bookings</li>

                        <li>5+ - Shared venue</li>

                    </ul>

                </div>

            </div>

            <div className="settings-card">

                <h3>Bundle Offers</h3>

                <p>

                    Allow customers to book multiple services together.

                </p>

                <div className="toggle-row">

                    <label>

                        Enable Bundle Offers

                    </label>

                    <label className="switch">

                        <input

                            type="checkbox"

                            name="bundleOfferEnabled"

                            checked={formData.bundleOfferEnabled}

                            onChange={handleChange}

                        />

                        <span className="slider"></span>

                    </label>

                </div>

                <div className="info-box">

                    <h4>Suggested Packages</h4>

                    <ul>

                        <li>Hall + Decoration</li>

                        <li>Hall + Photography</li>

                        <li>Hall + Catering</li>

                    </ul>

                </div>

            </div>

        </>

    );

}