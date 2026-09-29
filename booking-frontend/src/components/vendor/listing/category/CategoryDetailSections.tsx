import Input
    from "../../../common/ui/Input/Input";

import SectionHeader
    from "../../../common/ui/SectionHeader/SectionHeader";

import CheckboxGroup
    from "../../../common/ui/CheckboxGroup/CheckboxGroup";

import type {
    VendorServiceForm
} from "../../../../types/VendorServiceForm";

import {
    getCategorySections
} from "../../../../util/ServiceDetailSectionUtil";


interface Props {

    category: string;

    formData: VendorServiceForm;

    onDetailChange: (
        sectionKey: string,
        attributeKey: string,
        value: string | boolean
    ) => void;

}


export default function CategoryDetailSections({

    category,

    formData,

    onDetailChange

}: Props) {


    const sections =
        getCategorySections(
            category
        );


    if (
        sections.length === 0
    ) {

        return null;

    }


    return (

        <>

            {
                sections.map(
                    section => {


                        const checkboxAttributes =
                            section.attributes.filter(
                                attribute =>
                                    attribute.type ===
                                    "checkbox"
                            );


                        const inputAttributes =
                            section.attributes.filter(
                                attribute =>
                                    attribute.type !==
                                    "checkbox"
                            );


                        const currentSection =
                            formData.detailSections.find(
                                item =>
                                    item.key ===
                                    section.key
                            );


                        const attributeMap =
                            new Map(

                                currentSection
                                    ?.attributes
                                    ?.map(
                                        attribute => [

                                            attribute.key,

                                            attribute.value

                                        ]
                                    ) ?? []

                            );


                        return (

                            <div
                                key={
                                    section.key
                                }
                            >

                                <SectionHeader

                                    title={
                                        section.title
                                    }

                                    subtitle={
                                        section.subtitle
                                    }

                                />


                                {
                                    inputAttributes.length > 0 && (

                                        <div className="two-column">

                                            {
                                                inputAttributes.map(
                                                    attribute => (

                                                        <Input

                                                            key={
                                                                attribute.key
                                                            }

                                                            name={
                                                                attribute.key
                                                            }

                                                            label={
                                                                attribute.label
                                                            }

                                                            type={
                                                                attribute.type
                                                            }

                                                            value={
                                                                attributeMap.get(
                                                                    attribute.key
                                                                ) ?? ""
                                                            }

                                                            placeholder={
                                                                attribute.placeholder
                                                            }

                                                            onChange={
                                                                event =>

                                                                    onDetailChange(

                                                                        section.key,

                                                                        attribute.key,

                                                                        event.target.value

                                                                    )
                                                            }

                                                        />

                                                    )
                                                )
                                            }

                                        </div>

                                    )
                                }


                                {
                                    checkboxAttributes.length > 0 && (

                                        <CheckboxGroup

                                            title={
                                                section.title
                                            }

                                            options={
                                                checkboxAttributes.map(
                                                    attribute => ({

                                                        label:
                                                            attribute.label,

                                                        value:
                                                            attribute.key

                                                    })
                                                )
                                            }

                                            values={
                                                Object.fromEntries(

                                                    checkboxAttributes.map(
                                                        attribute => [

                                                            attribute.key,

                                                            attributeMap.get(
                                                                attribute.key
                                                            ) === "true"

                                                        ]
                                                    )

                                                )
                                            }

                                            onChange={
                                                event =>

                                                    onDetailChange(

                                                        section.key,

                                                        event.target.name,

                                                        (
                                                            event.target as
                                                            HTMLInputElement
                                                        ).checked

                                                    )
                                            }

                                        />

                                    )
                                }

                            </div>

                        );

                    }
                )
            }

        </>

    );

}