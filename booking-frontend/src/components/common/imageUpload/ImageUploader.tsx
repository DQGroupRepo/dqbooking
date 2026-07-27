import {

    useRef,

    useState

} from "react";

import toast from "react-hot-toast";

import ImagePreview from "./ImagePreview";

import type {

    ImageUploaderProps,

    MediaItem,

    ExistingMediaItem

} from "./ImageUploader.types";

import MediaViewer, {

    type MediaItem as ViewerMediaItem

} from "../../common/media/MediaViewer/MediaViewer";

import "./ImageUploader.css";


export default function ImageUploader({

    media,

    maxFiles = 10,

    maxSizeMb = 5,

    onChange,

    onRemoveExisting

}: ImageUploaderProps) {


    const inputRef =

        useRef<HTMLInputElement>(null);


    const [

        viewerOpen,

        setViewerOpen

    ] = useState(false);


    const [

        viewerIndex,

        setViewerIndex

    ] = useState(0);


    const [

        draggedIndex,

        setDraggedIndex

    ] = useState<number | null>(null);



    /*
     * =========================
     * Generate Preview URL
     * =========================
     */

    const getMediaSrc = (

        item: MediaItem

    ): string => {


        if (item.kind === "existing") {

            return item.url;

        }


        return URL.createObjectURL(

            item.file

        );

    };



    /*
     * =========================
     * Detect Media Type
     * =========================
     */

    const getMediaType = (

        item: MediaItem

    ): "image" | "video" => {


        if (item.kind === "existing") {

            return (

                /\.(mp4|webm|ogg|mov)$/i.test(

                    item.url.split("?")[0]

                )

                    ? "video"

                    : "image"

            );

        }


        return item.file.type.startsWith(

            "video/"

        )

            ? "video"

            : "image";

    };



    /*
     * =========================
     * Convert To MediaViewer
     * =========================
     */

    const allViewerMedia:

        ViewerMediaItem[] =

        media.map(item => ({

            src:

                getMediaSrc(item),

            type:

                getMediaType(item)

        }));



    /*
     * =========================
     * Browse Files
     * =========================
     */

    function browseFiles() {

        inputRef.current?.click();

    }



    /*
     * =========================
     * Handle New Files
     * =========================
     */

    function handleFiles(

        files: FileList | null

    ) {


        if (!files) {

            return;

        }


        const selectedFiles =

            Array.from(files);


        if (

            media.length +

            selectedFiles.length >

            maxFiles

        ) {

            toast.error(

                `Maximum ${maxFiles} images/videos allowed.`

            );

            return;

        }


        const validFiles: File[] = [];


        for (

            const file of selectedFiles

        ) {


            const isImage =

                file.type.startsWith(

                    "image/"

                );


            const isVideo =

                file.type.startsWith(

                    "video/"

                );


            if (

                !isImage &&

                !isVideo

            ) {

                toast.error(

                    `${file.name} is not a supported image or video.`

                );

                continue;

            }


            if (

                file.size >

                maxSizeMb *

                1024 *

                1024

            ) {

                toast.error(

                    `${file.name} exceeds ${maxSizeMb}MB.`

                );

                continue;

            }


            validFiles.push(file);

        }



        /*
         * Add new media at the end.
         */

        const newMedia:

            MediaItem[] =

            validFiles.map(file => ({

                id:

                    `${

                        file.name

                    }-${

                        Date.now()

                    }-${

                        Math.random()

                    }`,

                kind: "new",

                file

            }));


        onChange([

            ...media,

            ...newMedia

        ]);

    }



    /*
     * =========================
     * Remove Media
     * =========================
     */

    function removeMedia(

        index: number

    ) {


        const item =

            media[index];


        if (!item) {

            return;

        }



        /*
         * Existing media:
         *
         * Ask parent to confirm.
         *
         * Parent only removes
         * from React state.
         *
         * Database is NOT changed
         * until Update is clicked.
         */

        if (

            item.kind === "existing"

        ) {


            onRemoveExisting?.(

                item

            );


            return;

        }



        /*
         * New media:
         *
         * Simply remove from state.
         *
         * File has not been uploaded
         * yet.
         */

        const updatedMedia =

            media.filter(

                (_, itemIndex) =>

                    itemIndex !== index

            );


        onChange(

            updatedMedia

        );

    }



    /*
     * =========================
     * Drag Start
     * =========================
     */

    function handleDragStart(

        index: number

    ) {


        setDraggedIndex(

            index

        );

    }



    /*
     * =========================
     * Drag Over
     * =========================
     */

    function handleDragOver(

        targetIndex: number

    ) {


        if (

            draggedIndex === null

        ) {

            return;

        }


        if (

            draggedIndex ===

            targetIndex

        ) {

            return;

        }


        const reorderedMedia = [

            ...media

        ];


        const draggedItem =

            reorderedMedia.splice(

                draggedIndex,

                1

            )[0];


        if (!draggedItem) {

            return;

        }


        reorderedMedia.splice(

            targetIndex,

            0,

            draggedItem

        );


        onChange(

            reorderedMedia

        );


        setDraggedIndex(

            targetIndex

        );

    }



    /*
     * =========================
     * Drag End
     * =========================
     */

    function handleDragEnd() {

        setDraggedIndex(

            null

        );

    }



    /*
     * =========================
     * Open Media Viewer
     * =========================
     */

    function openViewer(

        index: number

    ) {


        setViewerIndex(

            index

        );


        setViewerOpen(

            true

        );

    }



    return (

        <div className="image-uploader">


            <label>

                Service Images & Videos

            </label>



            {/* =========================
                Upload Area
            ========================= */}

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
                     * Allows selecting
                     * the same file again.
                     */

                    e.target.value = "";

                }}

            />



            {/* =========================
                Media Grid
            ========================= */}

            <div className="image-grid">


                {

                    media.map(

                        (

                            item,

                            index

                        ) => {


                            const src =

                                getMediaSrc(

                                    item

                                );


                            const type =

                                getMediaType(

                                    item

                                );


                            return (

                                <ImagePreview

                                    key={

                                        item.id

                                    }

                                    src={src}

                                    type={type}

                                    draggable={

                                        true

                                    }

                                    onDragStart={() =>

                                        handleDragStart(

                                            index

                                        )

                                    }

                                    onDragOver={() =>

                                        handleDragOver(

                                            index

                                        )

                                    }

                                    onClick={() =>

                                        openViewer(

                                            index

                                        )

                                    }

                                    onRemove={() =>

                                        removeMedia(

                                            index

                                        )

                                    }

                                />

                            );

                        }

                    )

                }


            </div>



            {/* =========================
                Media Viewer
            ========================= */}

            {

                viewerOpen &&

                allViewerMedia.length >

                0 && (


                    <MediaViewer

                        media={

                            allViewerMedia

                        }

                        initialIndex={

                            viewerIndex

                        }

                        onClose={() =>

                            setViewerOpen(

                                false

                            )

                        }

                    />

                )

            }


        </div>

    );

}