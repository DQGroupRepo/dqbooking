import Input from "../../../common/ui/Input/Input";
import SectionHeader from "../../../common/ui/SectionHeader/SectionHeader";
import TagChipSelector from "../TagChipSelector";

import type {
    VendorServiceForm
} from "../../../../types/VendorServiceForm";

interface Props {

    formData: VendorServiceForm;

    onCategoryTagsChange: (values: string[]) => void;

    onLocationTagsChange: (values: string[]) => void;

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

    handleChange,
    onCategoryTagsChange,
    onLocationTagsChange

}: Props) {

    return (

        <>

            <SectionHeader

                title="Basic Information"

                subtitle="Provide the basic details of your service."

            />


            <div className="form-group">

                <label>
                    Service Category
                </label>

                <div className="category-badge">

                    {
                        formData.category.charAt(0).toUpperCase() +
                        formData.category.slice(1)
                    }

                </div>

            </div>


            <Input

                name="serviceName"

                label="Service Name *"

                value={formData.serviceName}

                onChange={handleChange}

            />


            <Input

                name="location"

                label="Location *"

                value={formData.location}

                onChange={handleChange}

            />

            <TagChipSelector label="Category tags" mode="CATEGORY" parentCategory={formData.category.toUpperCase()} values={formData.categoryTags} onChange={onCategoryTagsChange} />

            <TagChipSelector label="Location tags" mode="LOCATION" values={formData.locationTags} onChange={onLocationTagsChange} />


            <div className="two-column">

                <Input

                    name="capacity"

                    type="number"

                    label="Maximum Capacity"

                    value={formData.capacity}

                    onChange={handleChange}

                />


                <Input

                    name="durationHours"

                    type="number"

                    label="Duration (Hours)"

                    value={formData.durationHours}

                    onChange={handleChange}

                />

            </div>

        </>

    );

}