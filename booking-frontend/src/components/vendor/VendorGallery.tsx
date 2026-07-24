import { useState } from "react";
import type { VendorDetail } from "../../types/VendorDetail";
import "./VendorGallery.css";

interface Props {
    vendor: VendorDetail;
}

const VendorGallery = ({ vendor }: Props) => {

    const media =
        vendor.imageUrls &&
        vendor.imageUrls.length > 0
            ? vendor.imageUrls
            : [];

    const [selectedIndex, setSelectedIndex] =
        useState<number | null>(null);


    const isVideo = (url: string) => {

        const cleanUrl =
            url.split("?")[0].toLowerCase();

        return (
            cleanUrl.endsWith(".mp4") ||
            cleanUrl.endsWith(".webm") ||
            cleanUrl.endsWith(".mov") ||
            cleanUrl.endsWith(".avi") ||
            cleanUrl.endsWith(".ogg") ||
            cleanUrl.includes("video")
        );

    };


    const openMedia = (index: number) => {

        setSelectedIndex(index);

    };


    const closeMedia = () => {

        setSelectedIndex(null);

    };


    const showPrevious = () => {

        if (selectedIndex === null) return;

        setSelectedIndex(
            selectedIndex === 0
                ? media.length - 1
                : selectedIndex - 1
        );

    };


    const showNext = () => {

        if (selectedIndex === null) return;

        setSelectedIndex(
            selectedIndex === media.length - 1
                ? 0
                : selectedIndex + 1
        );

    };


    if (media.length === 0) {

        return (

            <section className="vendor-gallery container">

                <div className="main-image">

                    <img
                        src="/images/no-image.png"
                        alt={vendor.businessName}
                        className="gallery-main-media"
                    />

                </div>

            </section>

        );

    }


    return (

        <>

            <section className="vendor-gallery container">

                {/* Main Media */}

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


                {/* Thumbnail Row */}

                <div className="thumbnail-row">

                    {media
                        .slice(0, 4)
                        .map((item, index) => (

                            <div
                                key={item}
                                className="gallery-thumbnail"
                                onClick={() =>
                                    openMedia(index)
                                }
                            >

                                {isVideo(item) ? (

                                    <video
                                        src={item}
                                        className="gallery-thumbnail-media"
                                        muted
                                        playsInline
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

                        <div
                            className="more-images"
                            onClick={() => openMedia(4)}
                        >

                            +{media.length - 4} More

                        </div>

                    )}

                </div>

            </section>


            {/* Media Popup */}

            {selectedIndex !== null && (

                <div
                    className="media-lightbox"
                    onClick={closeMedia}
                >

                    <button
                        className="lightbox-close"
                        onClick={closeMedia}
                    >
                        ✕
                    </button>


                    <button
                        className="lightbox-prev"
                        onClick={(event) => {

                            event.stopPropagation();

                            showPrevious();

                        }}
                    >
                        ‹
                    </button>


                    <div
                        className="lightbox-content"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {isVideo(
                            media[selectedIndex]
                        ) ? (

                            <video
                                src={
                                    media[selectedIndex]
                                }
                                controls
                                autoPlay
                                className="lightbox-media"
                            />

                        ) : (

                            <img
                                src={
                                    media[selectedIndex]
                                }
                                alt={
                                    `${vendor.businessName}-${selectedIndex}`
                                }
                                className="lightbox-media"
                            />

                        )}

                    </div>


                    <button
                        className="lightbox-next"
                        onClick={(event) => {

                            event.stopPropagation();

                            showNext();

                        }}
                    >
                        ›
                    </button>

                </div>

            )}

        </>

    );

};


export default VendorGallery;