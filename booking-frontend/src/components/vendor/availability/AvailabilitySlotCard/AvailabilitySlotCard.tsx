import {
    FaClock,
    FaUsers,
    FaCog
} from "react-icons/fa";

import type { BookingSlot } from "../../../../types/BookingSlot";
import type { AvailabilityOverride } from "../../../../types/AvailabilityOverride";

import formatTime from "../../../../util/timeFormatter";

import "./AvailabilitySlotCard.css";

interface Props {

    slot: BookingSlot;

    override?: AvailabilityOverride;

    onManage: () => void;

    isStayService?: boolean;

}

export default function AvailabilitySlotCard({

    slot,

    override,

    onManage,

    isStayService = false

}: Props) {

    const capacity =

        override?.capacityOverride  ??

        slot.maxBookings;

    const blocked =

        override?.blocked ?? false;

    return (

        <div className="availability-slot-card">

            <div className="availability-slot-header">

                <div>

                    <h3>{slot.slotName}</h3>

                    <p>

                        <FaClock />

                        {" "}

                        {formatTime(slot.startTime)}

                        {" - "}

                        {formatTime(slot.endTime)}

                    </p>

                </div>

                <div className="slot-status">

                    {

                        blocked ? (

                            <span className="status blocked">

                                🚫 Blocked

                            </span>

                        )

                        : slot.active ? (

                            <span className="status active">

                                ✅ Available

                            </span>

                        )

                        : (

                            <span className="status inactive">

                                ⛔ Disabled

                            </span>

                        )

                    }

                </div>

            </div>

            {!isStayService && <div className="availability-slot-body">

                <div>

                    <FaUsers />

                    <span>

                        Capacity

                    </span>

                    <strong>

                        {capacity}

                    </strong>

                </div>

                {

                    override?.capacityOverride !== undefined && (

                        <div className="capacity-override">

                            Capacity Override: {override.capacityOverride}

                        </div>

                    )

                }

                {

                    override?.reason && (

                        <div className="override-reason">

                            <strong>

                                Reason:

                            </strong>

                            {" "}

                            {override.reason}

                        </div>

                    )

                }

            </div>}

            <button

                className="manage-btn"

                onClick={onManage}

            >

                <FaCog />

                Manage

            </button>

        </div>

    );

}
