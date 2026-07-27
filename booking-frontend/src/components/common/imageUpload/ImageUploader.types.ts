import type { DragEvent } from "react";

export type ExistingMediaItem = {

    id: string;

    kind: "existing";

    url: string;

};


export type NewMediaItem = {

    id: string;

    kind: "new";

    file: File;

};


export type MediaItem =

    | ExistingMediaItem

    | NewMediaItem;


export interface ImageUploaderProps {

    media: MediaItem[];

    maxFiles?: number;

    maxSizeMb?: number;

    onChange: (

        media: MediaItem[]

    ) => void;

    onRemoveExisting?: (

        item: ExistingMediaItem

    ) => void;

    onDragStart?: (

        index: number

    ) => void;

    onDragOver?: (

        index: number

    ) => void;

}