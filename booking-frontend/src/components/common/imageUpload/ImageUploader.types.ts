export interface ImageUploaderProps {

    images: File[];

    existingImages?: string[];

    maxFiles?: number;

    maxImageSizeMb?: number;

    maxVideoSizeMb?: number;

    onChange: (

        files: File[]

    ) => void;

    onRemoveExisting?: (

        url: string

    ) => void;

}