/*
import Input from "../../../../common/ui/Input/Input";
import Select from "../../../../common/ui/Select/Select";
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

const cateringOptions = [

    {
        label: "Buffet Service",
        value: "buffetService"
    },

    {
        label: "Plate Service",
        value: "plateService"
    },

    {
        label: "Live Counters",
        value: "liveCounters"
    },

    {
        label: "Outside Catering Available",
        value: "outsideCatering"
    }

];

export default function CateringSection({

    formData,

    handleChange

}: Props) {

    return (

        <>

            <SectionHeader

                title="Catering Details"

                subtitle="Tell customers about your food services."

            />

            <div className="two-column">

                <Select

                    label="Cuisine"

                    name="cuisine"

                    value={formData.cuisine || ""}

                    onChange={handleChange}

                    options={[

                        { label: "South Indian", value: "South Indian" },

                        { label: "North Indian", value: "North Indian" },

                        { label: "Chinese", value: "Chinese" },

                        { label: "Continental", value: "Continental" },

                        { label: "Multi Cuisine", value: "Multi Cuisine" }

                    ]}

                />

                <Select

                    label="Food Type"

                    name="foodType"

                    value={formData.foodType || ""}

                    onChange={handleChange}

                    options={[

                        { label: "Veg", value: "Veg" },

                        { label: "Non Veg", value: "Non Veg" },

                        { label: "Both", value: "Both" }

                    ]}

                />

            </div>

            <div className="two-column">

                <Input

                    label="Minimum Guests"

                    name="minimumGuests"

                    type="number"

                    value={formData.minimumGuests || ""}

                    onChange={handleChange}

                    placeholder="50"

                />

                <Input

                    label="Maximum Guests"

                    name="maximumGuests"

                    type="number"

                    value={formData.maximumGuests || ""}

                    onChange={handleChange}

                    placeholder="1000"

                />

            </div>

            <CheckboxGroup

                title="Available Services"

                options={cateringOptions}

                values={formData}

                onChange={handleChange}

            />

        </>

    );

} */
