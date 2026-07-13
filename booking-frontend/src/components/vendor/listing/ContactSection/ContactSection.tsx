import Input from "../../../common/ui/Input/Input";
import SectionHeader from "../../../common/ui/SectionHeader/SectionHeader";
import type { VendorServiceForm } from "../../../../types/VendorServiceForm";

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

export default function ContactSection({

    formData,

    handleChange

}: Props) {

    return (

        <>

            <SectionHeader

                title="Contact Information"

                subtitle="Customers will use these details to reach you."

            />

            <div className="two-column">

                <Input

                    name="contactPerson"

                    label="Contact Person"

                    value={formData.contactPerson}

                    placeholder="Vendor Name"

                    onChange={handleChange}

                />

                <Input

                    name="mobile"

                    label="Mobile Number"

                    value={formData.mobile}

                    placeholder="9876543210"

                    onChange={handleChange}

                />

            </div>

            <Input

                name="email"

                type="email"

                label="Email Address"

                value={formData.email}

                placeholder="vendor@email.com"

                onChange={handleChange}

            />

        </>

    );

}