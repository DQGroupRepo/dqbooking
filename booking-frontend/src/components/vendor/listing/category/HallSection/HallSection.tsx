/*
import Input from "../../../../common/ui/Input/Input";
import SectionHeader from "../../../../common/ui/SectionHeader/SectionHeader";
import CheckboxGroup from "../../../../common/ui/CheckboxGroup/CheckboxGroup";

import type { VendorServiceForm } from "../../../../../types/VendorServiceForm";

interface Props {

    formData: VendorServiceForm;

    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => void;

}

const facilities = [

    {
        label: "Parking Available",
        value: "parking"
    },

    {
        label: "AC Hall",
        value: "acHall"
    },

    {
        label: "Generator Backup",
        value: "generator"
    },

    {
        label: "Dining Hall",
        value: "diningHall"
    },

    {
        label: "Outdoor Venue",
        value: "outdoorVenue"
    },

    {
        label: "Bridal Room",
        value: "bridalRoom"
    },

    {
        label: "Audio-Visual (AV) Systems",
        value: "audioVisual"
    },

    {
        label: "Lighting Infrastructure",
        value: "lightingInfra"
    }

];

export default function HallSection({

    formData,

    handleChange

}: Props) {

    return (

        <>

            <SectionHeader

                title="Hall Information"

                subtitle="Provide additional details about your venue."

            />

            <div className="two-column">

                <Input

                    label="Hall Capacity"

                    name="hallCapacity"

                    type="number"

                    value={formData.hallCapacity || ""}

                    onChange={handleChange}

                    placeholder="500"

                />

                <Input

                    label="Dining Capacity"

                    name="diningCapacity"

                    type="number"

                    value={formData.diningCapacity || ""}

                    onChange={handleChange}

                    placeholder="300"

                />

            </div>

            <div className="two-column">

                <Input

                    label="Number of Rooms"

                    name="rooms"

                    type="number"

                    value={formData.rooms || ""}

                    onChange={handleChange}

                    placeholder="10"

                />

                <Input

                    label="Parking Capacity"

                    name="parkingCapacity"

                    type="number"

                    value={formData.parkingCapacity || ""}

                    onChange={handleChange}

                    placeholder="100"

                />

            </div>

            <CheckboxGroup

                title="Venue Facilities"

                options={facilities}

                values={formData as unknown as Record<string, boolean>}

                onChange={handleChange}

            />

        </>

    );

} */
