import "./ImageUploader.css";

interface ImagePreviewProps {

    src: string;

    type: "image" | "video";

    onClick?: () => void;

    onRemove?: () => void;

    draggable?: boolean;

    onDragStart?: () => void;

    onDragOver?: () => void;

}


export default function ImagePreview({

    src,

    type,

    onClick,

    onRemove,

    draggable = false,

    onDragStart,

    onDragOver

}: ImagePreviewProps) {


    return (

        <div

            className="image-preview"

            draggable={draggable}

            onDragStart={(e) => {

                e.stopPropagation();

                onDragStart?.();

            }}

            onDragOver={(e) => {

                e.preventDefault();

                e.stopPropagation();

                onDragOver?.();

            }}

        >


            {/* =========================
                Media Preview
            ========================= */}

            <div

                className="preview-clickable"

                onClick={onClick}

            >

                {

                    type === "video"

                        ? (

                            <video

                                src={src}

                                className="preview-media"

                                muted

                                playsInline

                            />

                        )

                        : (

                            <img

                                src={src}

                                alt="Service preview"

                                className="preview-media"

                            />

                        )

                }

            </div>



            {/* =========================
                Remove Button
            ========================= */}

            {

                onRemove && (

                    <button

                        type="button"

                        className="image-remove-btn"

                        aria-label="Remove media"

                        onClick={(e) => {

                            e.stopPropagation();

                            onRemove();

                        }}

                    >

                        ×

                    </button>

                )

            }


        </div>

    );

}