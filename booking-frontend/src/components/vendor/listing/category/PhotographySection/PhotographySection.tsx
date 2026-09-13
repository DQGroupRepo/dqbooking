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
        label: "Sophisticated Camera Systems",
        value: "cameraSystems"
    },

    {
        label: "Advanced Visual Effects",
        value: "visualEffects"
    },

    {
        label: "Audio Sweetening",
        value: "audioSweetening"
    },

    {
        label: "Pre-wedding shoots",
        value: "preweddingShoots"
    },

    {
        label: "Second shooters",
        value: "secondShooters"
    },

    {
        label: "Timeline planning",
        value: "timelinePlanning"
    },

    {
        label: "Audio-Visual (AV) Systems",
        value: "audioVisual"
    },

    {
        label: "On-Site Client Studio",
        value: "onSiteClientStudio"
    }

];

export default function PhotographySection({

    formData,

    handleChange

}: Props) {

    return (

        <>

            <SectionHeader

                title="Photography Details"

                subtitle="Photography package details."

            />



            <CheckboxGroup

                title="Venue Facilities"

                options={facilities}

                values={formData as unknown as Record<string, boolean>}

                onChange={handleChange}

            />

        </>

    );

}