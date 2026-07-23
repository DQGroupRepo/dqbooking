export interface Vendor {

  id:string;

  businessName:string;

  description:string;

  category:string;

  city:string;

  rating:number;

  reviewCount?:number;

  startingPrice:number;

  imageUrl:string;

  capacity?:number;

  amenities?:string[];

  gallery?:string[];

  isActive?:boolean;

}