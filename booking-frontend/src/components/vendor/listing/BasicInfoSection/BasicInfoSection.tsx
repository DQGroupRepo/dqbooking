import Input from "../../../common/ui/Input/Input";
import TextArea from "../../../common/ui/TextArea/TextArea";
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

export default function BasicInfoSection({

    formData,

    handleChange

}: Props) {

    return (

        <>

            <SectionHeader

                title="Basic Information"

                subtitle="Provide the basic details of your business."

            />

            <div className="form-group">

                <label>

                    Service Category

                </label>

                <div className="category-badge">

                    {formData.category.charAt(0).toUpperCase() +
                        formData.category.slice(1)}

                </div>

            </div>

            <Input

                name="serviceName"

                label="Service Name *"

                value={formData.serviceName}

                /* placeholder="Royal Palace Convention Hall" */

                onChange={handleChange}

            />

            <Input

                name="location"

                label="Location *"

                value={formData.location}

                /* placeholder="1Chennai, Tamil Nadu" */

                onChange={handleChange}

            />

            <div className="two-column">

                <Input

                    name="price"

                    type="number"

                    label="Starting Price (₹)"

                    value={formData.price}

                    /* placeholder="45000" */

                    onChange={handleChange}

                />

                <Input

                    name="capacity"

                    type="number"

                    label="Maximum Capacity"

                    value={formData.capacity}

                    /* placeholder="500" */

                    onChange={handleChange}

                />

                <Input
                    name="durationHours"
                    type="number"
                    label="Duration (Hours)"
                    value={formData.durationHours}
                    /* placeholder="8" */
                    onChange={handleChange}
                />

            </div>

            <TextArea

                name="description"

                label="Description"

                rows={6}

                value={formData.description}

                placeholder="Describe your service, venue, facilities and unique features"

                onChange={handleChange}

            />

        </>

    );

}