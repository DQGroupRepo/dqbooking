import HallSection from "./HallSection/HallSection";
import CateringSection from "./CateringSection/CateringSection";
import PhotographySection from "./PhotographySection/PhotographySection";
import DecorationSection from "./DecorationSection/DecorationSection";
import MakeupSection from "./MakeupSection/MakeupSection";

interface Props {

    category: string;

    formData: any;

    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => void;

}

export default function CategorySpecificSection({

    category,

    formData,

    handleChange

}: Props) {

    switch (category.toLowerCase()) {

        case "hall":

            return (

                <HallSection

                    formData={formData}

                    handleChange={handleChange}

                />

            );

        case "catering":

            return (

                <CateringSection

                    formData={formData}

                    handleChange={handleChange}

                />

            );

        case "photography":

            return (

                <PhotographySection

                    formData={formData}

                    handleChange={handleChange}

                />

            );

        case "decoration":

            return (

                <DecorationSection

                    formData={formData}

                    handleChange={handleChange}

                />

            );

        case "makeup":

            return (

                <MakeupSection

                    formData={formData}

                    handleChange={handleChange}

                />

            );

        default:

            return null;

    }

}