import type { BookingSlot } from "../../../../types/BookingSlot";
import type { AvailabilityOverride } from "../../../../types/AvailabilityOverride";

import AvailabilitySlotCard
    from "../AvailabilitySlotCard/AvailabilitySlotCard";

interface Props {

    selectedDate: Date;

    slots: BookingSlot[];

    overrides: AvailabilityOverride[];

    onManage: (slot: BookingSlot) => void;

    isStayService?: boolean;
    isCateringService?: boolean;

}

export default function AvailabilitySlotList({

    selectedDate,

    slots,

    overrides,

    onManage,

    isStayService = false,
    isCateringService = false

}: Props) {

    return (

        <div>

            <h2>

                {selectedDate.toDateString()}

            </h2>

            {

                slots.length === 0 ?

                    (

                        <div className="empty-slots">

                            No Booking Slots Found

                        </div>

                    )

                    :

                    (

                        <div className="availability-grid">

                            {

                                slots.map(slot => {

                                    const override = overrides.find(

                                        o => o.slotId === slot.id

                                    );

                                    return (

                                        <AvailabilitySlotCard

                                            key={slot.id}

                                            slot={slot}

                                            override={override}

                                            isStayService={isStayService}
                                            isCateringService={isCateringService}
                                            onManage={() =>

                                                onManage(slot)

                                            }

                                        />

                                    );

                                })

                            }

                        </div>

                    )

            }

        </div>

    );

}
