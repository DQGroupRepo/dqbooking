import SectionHeader from "../../../common/ui/SectionHeader/SectionHeader";

interface Props {

    handleImages: (
        e: React.ChangeEvent<HTMLInputElement>
    ) => void;

    images: File[];

    existingImages?: string[];

    removeImage: (index: number) => void;

    removeExistingImage?: (index: number) => void;

}

export default function GallerySection({

    handleImages,

    images,

    existingImages,

    removeImage,

    removeExistingImage

}: Props) {

    return (

        <>

            <SectionHeader

                title="Gallery"

                subtitle="Upload professional images to increase customer trust."

            />

            <div className="form-group">

                <div className="upload-box">

                    <input

                        type="file"

                        multiple

                        accept="image/*"

                        onChange={handleImages}

                    />

                    <h3>

                        📸 Upload Images

                    </h3>

                    <p>

                        Drag & Drop or Click

                    </p>

                </div>

            </div>

            {/* Existing Gallery Images */}

            {

                existingImages &&

                existingImages.length > 0 && (

                    <div className="preview-grid">

                        {

                            existingImages.map((image, index) => (

                                <div

                                    key={index}

                                    className="preview-card"

                                >

                                    <img

                                        src={image}

                                        alt="gallery"

                                    />

                                    <button

                                        type="button"

                                        onClick={() =>

                                            removeExistingImage?.(index)

                                        }

                                    >

                                        ✕

                                    </button>

                                </div>

                            ))

                        }

                    </div>

                )

            }

            {/* Newly Uploaded Images */}

            {

                images.length > 0 && (

                    <div className="preview-grid">

                        {

                            images.map((image, index) => (

                                <div

                                    key={index}

                                    className="preview-card"

                                >

                                    <img

                                        src={URL.createObjectURL(image)}

                                        alt="preview"

                                    />

                                    <button

                                        type="button"

                                        onClick={() => removeImage(index)}

                                    >

                                        ✕

                                    </button>

                                </div>

                            ))

                        }

                    </div>

                )

            }

        </>

    );

}