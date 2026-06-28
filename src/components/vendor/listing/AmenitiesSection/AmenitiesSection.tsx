import SectionHeader from "../../../common/ui/SectionHeader/SectionHeader";

interface Props {

    amenities: string[];

    amenityList: string[];

    handleAmenityChange: (item: string) => void;

}

export default function AmenitiesSection({

    amenities,

    amenityList,

    handleAmenityChange

}: Props) {

    return (

        <>

            <SectionHeader

                title="Amenities"

                subtitle="Select all facilities available with your service."

            />

            <div className="form-group">

                <div className="amenities-selection">

                    {

                        amenityList.map(item => (

                            <label key={item}>

                                <input

                                    type="checkbox"

                                    checked={amenities.includes(item)}

                                    onChange={() => handleAmenityChange(item)}

                                />

                                {item}

                            </label>

                        ))

                    }

                </div>

            </div>

        </>

    );

}