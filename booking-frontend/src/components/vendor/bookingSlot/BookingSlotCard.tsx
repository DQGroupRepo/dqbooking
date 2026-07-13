import {
    FaClock,
    FaUsers
} from "react-icons/fa";

import type { BookingSlot } from "../../../types/BookingSlot";

import "./BookingSlotCard.css";
import formatTime from "../../../util/timeFormatter";

interface Props {

    slot: BookingSlot;

    onEdit: (slot: BookingSlot) => void;

    onDelete: (slot: BookingSlot) => void;

    onToggleStatus: (slot: BookingSlot) => void;

}

export default function BookingSlotCard({

    slot,

    onEdit,

    onDelete,

    onToggleStatus

}: Props) {

    return (

        <div
            className={
                slot.active
                    ? "booking-slot-card"
                    : "booking-slot-card disabled"
            }
        >

            <div className="slot-header">

                <div>

                    <h3>

                        #{slot.displayOrder}

                        {" "}

                        {slot.slotName}

                    </h3>

                    <span
                        className={
                            slot.active
                                ? "slot-status active"
                                : "slot-status inactive"
                        }
                    >
                        {slot.active
                            ? "Active"
                            : "Disabled"}
                    </span>

                </div>

            </div>

            <div className="slot-details">

                <p>

                    <FaClock />

                    {" "}

                    {formatTime(slot.startTime)}

                    {" → "}

                    {formatTime(slot.endTime)}

                </p>

                <div className="capacity-box">

                    <FaUsers />

                    <div>

                        <span>

                            Capacity

                        </span>

                        <h4>

                            {slot.maxBookings}

                        </h4>

                    </div>

                </div>

                <div className="overlap-box">

                    <span>

                        Overlap

                    </span>

                    <h4>

                        {

                            slot.allowOverlap

                                ? "Allowed"

                                : "Not Allowed"

                        }

                    </h4>

                </div>

            </div>

            <div className="slot-actions">

                <button

                    className={
                        slot.active
                            ? "disable-btn"
                            : "enable-btn"
                    }

                    onClick={() => onToggleStatus(slot)}

                >

                    {

                        slot.active

                            ? "Disable Slot"

                            : "Enable Slot"

                    }

                </button>

                <button

                    className="edit-btn"

                    onClick={() => onEdit(slot)}

                >

                    Edit

                </button>

                <button

                    className="delete-btn"

                    onClick={() => onDelete(slot)}

                >

                    Delete

                </button>

            </div>

        </div>

    );

}