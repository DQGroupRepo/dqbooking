import type { VendorDetail } from "../../types/VendorDetail";
import "./VendorGallery.css";

interface Props {
    vendor: VendorDetail;
}

const VendorGallery = ({ vendor }: Props) => {

    const media =

        vendor.gallery &&

        vendor.gallery.length > 0

            ? vendor.gallery

            : vendor.imageUrl

                ? [vendor.imageUrl]

                : [];


    const isVideo = (url: string) => {

        const cleanUrl =

            url.split("?")[0].toLowerCase();


        return (

            cleanUrl.endsWith(".mp4") ||

            cleanUrl.endsWith(".webm") ||

            cleanUrl.endsWith(".mov") ||

            cleanUrl.endsWith(".avi") ||

            cleanUrl.includes("video")

        );

    };


    if (media.length === 0) {

        return (

            <section className="vendor-gallery container">

                <div className="main-image">

                    <img

                        src="/images/no-image.png"

                        alt={vendor.businessName}

                    />

                </div>

            </section>

        );

    }


    return (

        <section className="vendor-gallery container">


            <div className="main-image">


                {isVideo(media[0]) ? (

                    <video

                        src={media[0]}

                        controls

                        className="gallery-main-media"

                    />

                ) : (

                    <img

                        src={media[0]}

                        alt={vendor.businessName}

                        className="gallery-main-media"

                    />

                )}


            </div>


            <div className="thumbnail-row">


                {media

                    .slice(0, 4)

                    .map((item, index) => (

                        <div

                            key={index}

                            className="gallery-thumbnail"

                        >


                            {isVideo(item) ? (

                                <video

                                    src={item}

                                    className="gallery-thumbnail-media"

                                />

                            ) : (

                                <img

                                    src={item}

                                    alt={`${vendor.businessName}-${index}`}

                                    className="gallery-thumbnail-media"

                                />

                            )}


                        </div>

                    ))}


                {media.length > 4 && (

                    <div className="more-images">

                        +{media.length - 4} More

                    </div>

                )}


            </div>


        </section>

    );

};


export default VendorGallery;