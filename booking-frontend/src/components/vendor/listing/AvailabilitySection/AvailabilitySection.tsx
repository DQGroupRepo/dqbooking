import Input from "../../../common/ui/Input/Input";
import SectionHeader from "../../../common/ui/SectionHeader/SectionHeader";
import type { VendorServiceForm } from "../../../../types/VendorServiceForm";

interface Props {

    formData: VendorServiceForm;

    handleChange: (
        e: React.ChangeEvent<HTMLInputElement>
    ) => void;

}

export default function AvailabilitySection({

    formData,

    handleChange

}: Props) {

    return (

        <>

            <SectionHeader

                title="Availability"

                subtitle="Specify when your service is available."

            />

            <div className="two-column">

                <Input

                    name="availableFrom"

                    type="date"

                    label="Available From"

                    value={formData.availableFrom}

                    onChange={handleChange}

                />

                <Input

                    name="availableTo"

                    type="date"

                    label="Available To"

                    value={formData.availableTo}

                    onChange={handleChange}

                />

            </div>

        </>

    );

}