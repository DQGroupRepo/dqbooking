import {
    useRef,
    useState
} from "react";

import toast from "react-hot-toast";

import type {
    ImageUploaderProps
} from "./ImageUploader.types";

import ImagePreview from "./ImagePreview";

import MediaViewer, {
    type MediaItem
} from "../../common/media/MediaViewer/MediaViewer";

import "./ImageUploader.css";


export default function ImageUploader({

    images,

    existingImages = [],

    maxFiles = 10,

    maxSizeMb = 5,

    onChange,

    onRemoveExisting

}: ImageUploaderProps) {


    const inputRef =
        useRef<HTMLInputElement>(null);


    const [viewerOpen, setViewerOpen] =
        useState(false);


    const [viewerIndex, setViewerIndex] =
        useState(0);


    /*
     * Convert existing URLs into
     * MediaViewer items.
     */
    const existingMedia: MediaItem[] =
        existingImages.map(url => ({

            src: url,

            type:
                /\.(mp4|webm|ogg|mov)$/i.test(
                    url.split("?")[0]
                )
                    ? "video"
                    : "image"

        }));


    /*
     * Convert newly selected Files into
     * MediaViewer items.
     */
    const newMedia: MediaItem[] =
        images.map(file => ({

            src: URL.createObjectURL(file),

            type:
                file.type.startsWith("video/")
                    ? "video"
                    : "image"

        }));


    /*
     * Complete gallery containing:
     *
     * Existing images/videos
     * +
     * Newly selected images/videos
     */
    const allMedia: MediaItem[] = [

        ...existingMedia,

        ...newMedia

    ];


    function browseFiles() {

        inputRef.current?.click();

    }


    function handleFiles(

        files: FileList | null

    ) {

        if (!files) return;


        const selected =
            Array.from(files);


        if (

            selected.length +

            images.length +

            existingImages.length >

            maxFiles

        ) {

            toast.error(

                `Maximum ${maxFiles} images/videos allowed.`

            );

            return;

        }


        const valid: File[] = [];


        for (const file of selected) {


            /*
             * Allow both images
             * and videos.
             */
            const isImage =
                file.type.startsWith("image/");


            const isVideo =
                file.type.startsWith("video/");


            if (!isImage && !isVideo) {

                toast.error(

                    `${file.name} is not a supported image or video.`

                );

                continue;

            }


            if (

                file.size >

                maxSizeMb * 1024 * 1024

            ) {

                toast.error(

                    `${file.name} exceeds ${maxSizeMb}MB.`

                );

                continue;

            }


            valid.push(file);

        }


        onChange([

            ...images,

            ...valid

        ]);

    }


    function removeFile(index: number) {

        const updated =
            [...images];


        updated.splice(

            index,

            1

        );


        onChange(updated);

    }


    /*
     * Open the full MediaViewer.
     *
     * index is based on the complete
     * gallery containing existing +
     * new media.
     */
    function openViewer(index: number) {

        setViewerIndex(index);

        setViewerOpen(true);

    }


    /*
     * Existing media was clicked.
     */
    function handleExistingMediaClick(

        index: number

    ) {

        openViewer(index);

    }


    /*
     * New media was clicked.
     *
     * New media starts after all
     * existing media.
     */
    function handleNewMediaClick(

        index: number

    ) {

        openViewer(

            existingImages.length +

            index

        );

    }


    return (

        <div className="image-uploader">


            <label>

                Service Images & Videos

            </label>


            <div

                className="upload-box"

                onClick={browseFiles}

            >

                <p>

                    📷 Drag & Drop Images/Videos Here

                </p>


                <span>

                    or click to browse

                </span>

            </div>


            <input

                ref={inputRef}

                type="file"

                multiple

                accept="image/*,video/*"

                hidden

                onChange={(e) => {

                    handleFiles(

                        e.target.files

                    );

                    /*
                     * Allows selecting the
                     * same file again.
                     */
                    e.target.value = "";

                }}

            />


            <div className="image-grid">


                {


                    existingImages.map(

                        (url, index) => (


                            <ImagePreview

                                key={url}

                                src={url}

                                type={

                                    /\.(mp4|webm|ogg|mov)$/i.test(

                                        url.split("?")[0]

                                    )

                                        ? "video"

                                        : "image"

                                }

                                onClick={() =>

                                    handleExistingMediaClick(

                                        index

                                    )

                                }

                                onRemove={() =>

                                    onRemoveExisting?.(

                                        url

                                    )

                                }

                            />


                        )

                    )


                }


                {


                    images.map(

                        (file, index) => (


                            <ImagePreview

                                key={

                                    `${file.name}-${index}`

                                }

                                src={

                                    URL.createObjectURL(

                                        file

                                    )

                                }

                                type={

                                    file.type.startsWith(

                                        "video/"

                                    )

                                        ? "video"

                                        : "image"

                                }

                                onClick={() =>

                                    handleNewMediaClick(

                                        index

                                    )

                                }

                                onRemove={() =>

                                    removeFile(index)

                                }

                            />


                        )

                    )


                }


            </div>


            {


                viewerOpen &&

                allMedia.length > 0 && (


                    <MediaViewer

                        media={allMedia}

                        initialIndex={viewerIndex}

                        onClose={() =>

                            setViewerOpen(false)

                        }

                    />


                )


            }


        </div>

    );

}