import "./ImageUploader.css";

interface ImagePreviewProps {

    src: string;

    type?: "image" | "video";

    onRemove?: () => void;

    onClick?: () => void;

}


export default function ImagePreview({

    src,

    type = "image",

    onRemove,

    onClick

}: ImagePreviewProps) {


    return (

        <div

            className="image-preview"

            onClick={onClick}

        >


            <div className="preview-clickable">


                {type === "video" ? (

                    <video

                        src={src}

                        muted

                        playsInline

                        className="preview-media"

                    />

                ) : (

                    <img

                        src={src}

                        alt="Preview"

                        className="preview-media"

                    />

                )}


            </div>


            {onRemove && (


                <button

                    type="button"

                    className="remove-image"

                    onClick={(e) => {

                        e.stopPropagation();

                        onRemove();

                    }}

                >

                    ✕

                </button>


            )}


        </div>

    );

}