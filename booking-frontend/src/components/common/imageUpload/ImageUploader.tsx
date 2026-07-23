import {
    useRef
} from "react";

import toast from "react-hot-toast";

import type {
    ImageUploaderProps
} from "./ImageUploader.types";

import ImagePreview from "./ImagePreview";

import "./ImageUploader.css";


export default function ImageUploader({

    images,

    existingImages = [],

    maxFiles = 10,

    maxImageSizeMb = 5,

    maxVideoSizeMb = 50,

    onChange,

    onRemoveExisting

}: ImageUploaderProps) {


    const inputRef =

        useRef<HTMLInputElement>(null);


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

                `Maximum ${maxFiles} media files allowed.`

            );

            return;

        }


        const valid: File[] = [];


        for (const file of selected) {


            const isImage =

                file.type.startsWith("image/");


            const isVideo =

                file.type.startsWith("video/");


            // Validate file type

            if (!isImage && !isVideo) {

                toast.error(

                    `${file.name} is not a supported image or video.`

                );

                continue;

            }


            // Image size validation

            if (

                isImage &&

                file.size >

                maxImageSizeMb * 1024 * 1024

            ) {

                toast.error(

                    `${file.name} exceeds the ${maxImageSizeMb}MB image limit.`

                );

                continue;

            }


            // Video size validation

            if (

                isVideo &&

                file.size >

                maxVideoSizeMb * 1024 * 1024

            ) {

                toast.error(

                    `${file.name} exceeds the ${maxVideoSizeMb}MB video limit.`

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


    function removeFile(

        index: number

    ) {


        const updated = [

            ...images

        ];


        updated.splice(

            index,

            1

        );


        onChange(updated);

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

                    📷 Upload Images & Videos

                </p>


                <span>

                    Images up to {maxImageSizeMb}MB

                    {" • "}

                    Videos up to {maxVideoSizeMb}MB

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

                    e.target.value = "";

                }}

            />


            <div className="image-grid">


                {/* Existing media */}

                {

                    existingImages.map(

                        url => (

                            <ImagePreview

                                key={url}

                                src={url}

                                type="image"

                                onRemove={() =>

                                    onRemoveExisting?.(

                                        url

                                    )

                                }

                            />

                        )

                    )

                }


                {/* Newly selected media */}

                {

                    images.map(

                        (file, index) => (

                            <ImagePreview

                                key={index}

                                src={URL.createObjectURL(file)}

                                type={

                                    file.type.startsWith(

                                        "video/"

                                    )

                                        ? "video"

                                        : "image"

                                }

                                onRemove={() =>

                                    removeFile(

                                        index

                                    )

                                }

                            />

                        )

                    )

                }


            </div>


        </div>

    );

}