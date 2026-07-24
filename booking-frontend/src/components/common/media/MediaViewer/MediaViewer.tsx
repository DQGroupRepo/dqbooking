import { useEffect, useState } from "react";

import "./MediaViewer.css";

export interface MediaItem {

    src: string;

    type?: "image" | "video";

    alt?: string;

}

interface MediaViewerProps {

    media: MediaItem[];

    initialIndex?: number;

    onClose: () => void;

}

const isVideoUrl = (url: string) => {

    return /\.(mp4|webm|ogg|mov)$/i.test(
        url.split("?")[0]
    );

};

const MediaViewer = ({

    media,

    initialIndex = 0,

    onClose

}: MediaViewerProps) => {

    const [currentIndex, setCurrentIndex] =
        useState(initialIndex);


    const currentMedia =
        media[currentIndex];


    const hasPrevious =
        currentIndex > 0;


    const hasNext =
        currentIndex < media.length - 1;


    const goPrevious = () => {

        if (hasPrevious) {

            setCurrentIndex(
                currentIndex - 1
            );

        }

    };


    const goNext = () => {

        if (hasNext) {

            setCurrentIndex(
                currentIndex + 1
            );

        }

    };


    useEffect(() => {

        const handleKeyDown = (
            event: KeyboardEvent
        ) => {

            if (event.key === "Escape") {

                onClose();

            }

            if (event.key === "ArrowLeft") {

                goPrevious();

            }

            if (event.key === "ArrowRight") {

                goNext();

            }

        };


        window.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    });


    if (!currentMedia) {

        return null;

    }


    const mediaType =
        currentMedia.type ??
        (
            isVideoUrl(currentMedia.src)
                ? "video"
                : "image"
        );


    const handleBackdropClick = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {

        if (
            e.target === e.currentTarget
        ) {

            onClose();

        }

    };


    return (

        <div

            className="media-viewer-overlay"

            onClick={handleBackdropClick}

        >

            <div className="media-viewer-content">


                <button

                    type="button"

                    className="media-viewer-close"

                    onClick={onClose}

                    aria-label="Close"

                >

                    ✕

                </button>


                {hasPrevious && (

                    <button

                        type="button"

                        className="media-viewer-nav media-viewer-prev"

                        onClick={goPrevious}

                        aria-label="Previous media"

                    >

                        ‹

                    </button>

                )}


                {mediaType === "video" ? (

                    <video

                        key={currentMedia.src}

                        src={currentMedia.src}

                        className="media-viewer-media"

                        controls

                        autoPlay

                        playsInline

                    />

                ) : (

                    <img

                        key={currentMedia.src}

                        src={currentMedia.src}

                        alt={
                            currentMedia.alt ??
                            "Media"
                        }

                        className="media-viewer-media"

                    />

                )}


                {hasNext && (

                    <button

                        type="button"

                        className="media-viewer-nav media-viewer-next"

                        onClick={goNext}

                        aria-label="Next media"

                    >

                        ›

                    </button>

                )}


                <div className="media-viewer-counter">

                    {currentIndex + 1}

                    {" / "}

                    {media.length}

                </div>


            </div>

        </div>

    );

};


export default MediaViewer;