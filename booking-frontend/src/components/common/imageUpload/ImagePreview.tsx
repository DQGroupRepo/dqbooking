import "./ImageUploader.css";

interface ImagePreviewProps {

    src: string;

    type?: "image" | "video";

    onRemove?: () => void;

}


export default function ImagePreview({

    src,

    type = "image",

    onRemove

}: ImagePreviewProps) {


    return (

        <div className="image-preview">


            {type === "video" ? (

                <video

                    src={src}

                    controls

                    className="preview-media"

                />

            ) : (

                <img

                    src={src}

                    alt="Preview"

                    className="preview-media"

                />

            )}


            {onRemove && (

                <button

                    type="button"

                    className="remove-image"

                    onClick={onRemove}

                >

                    ✕

                </button>

            )}


        </div>

    );

}