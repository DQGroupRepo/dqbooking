export interface AvailabilityOverride {

    id: string;

    serviceId: string;

    slotId: string;

    date: string;

    blocked: boolean;

    reason?: string;

    capacityOverride?: number | null;

}