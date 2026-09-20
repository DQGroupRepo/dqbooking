import Input from "../../../common/ui/Input/Input";

import TextArea
    from "../../../common/ui/TextArea/TextArea";

import SectionHeader
    from "../../../common/ui/SectionHeader/SectionHeader";

import type {
    VendorServiceForm
} from "../../../../types/VendorServiceForm";


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


export default function ServiceDetailsSection({

    formData,

    handleChange

}: Props) {

    return (

        <>

            <SectionHeader

                title="Service Details"

                subtitle="Tell customers more about your service and its location."

            />


            <Input

                name="address"

                label="Address"

                value={formData.address}

                placeholder="Enter the complete service address"

                onChange={handleChange}

            />


            <TextArea

                name="description"

                label="About Your Service"

                rows={6}

                value={formData.description}

                placeholder="Describe your service, venue, facilities and unique features"

                onChange={handleChange}

            />

        </>

    );

}