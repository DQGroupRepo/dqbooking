import type {
    ServiceAttribute
} from "./ServiceAttribute";


export interface ServiceDetailSection {

    key: string;

    title: string;

    attributes: ServiceAttribute[];

}