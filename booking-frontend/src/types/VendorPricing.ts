export interface VendorPricingHead{

    code:string;

    name:string;

    calculationType:string;

    value:number;

}

export interface VendorDiscount{

    name:string;

    discountType:string;

    value:number;

}

export interface VendorServicePricing{

    id:string;

    serviceId:string;

    version:number;

    baseAmount:number;

    pricingHeads:VendorPricingHead[];

    discounts:VendorDiscount[];

}

