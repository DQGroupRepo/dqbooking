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

function getSlotDuration(startTime: string, endTime: string): {
    minutes: number;
    overnight: boolean;
} | null {
    if (!startTime || !endTime) return null;

    const toMinutes = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
        return hours * 60 + minutes;
    };

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start === end) return null;

    const overnight = end < start;
    return { minutes: overnight ? end + 24 * 60 - start : end - start, overnight };
}

function formatDuration(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0) return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
    if (hours === 0) return `${minutes} ${minutes === 1 ? "min" : "mins"}`;
    return `${hours} ${hours === 1 ? "hr" : "hrs"} ${minutes} mins`;
}

export default function BookingSlotCard({
    slot,
    onEdit,
    onDelete,
    onToggleStatus
}: Props) {
    const duration = getSlotDuration(slot.startTime, slot.endTime);

    return (
        <div className={slot.active ? "vendor-managed-slot-card" : "vendor-managed-slot-card disabled"}>
            <div className="slot-header">
                <div>
                    <h3>#{slot.displayOrder} {slot.slotName}</h3>
                    <span className={slot.active ? "slot-status active" : "slot-status inactive"}>
                        {slot.active ? "Active" : "Disabled"}
                    </span>
                </div>
            </div>

            <div className="slot-details">
                <p className="slot-time-range">
                    <FaClock />
                    <span>
                        {formatTime(slot.startTime)} {" → "} {formatTime(slot.endTime)}
                        {duration?.overnight && <span className="slot-next-day"> +1 day</span>}
                    </span>
                </p>

                {duration && (
                    <div className="slot-duration-summary">
                        <FaClock />
                        <span>
                            <strong>{formatDuration(duration.minutes)}</strong>
                            <small>{duration.overnight ? "Overnight slot" : "Slot duration"}</small>
                        </span>
                    </div>
                )}

                <div className="capacity-box">
                    <FaUsers />
                    <div>
                        <span>Capacity</span>
                        <h4>{slot.maxBookings}</h4>
                    </div>
                </div>

                <div className="overlap-box">
                    <span>Overlap</span>
                    <h4>{slot.allowOverlap ? "Allowed" : "Not Allowed"}</h4>
                </div>
            </div>

            <div className="slot-actions">
                <button
                    className={slot.active ? "disable-btn" : "enable-btn"}
                    onClick={() => onToggleStatus(slot)}
                >
                    {slot.active ? "Disable Slot" : "Enable Slot"}
                </button>
                <button className="edit-btn" onClick={() => onEdit(slot)}>
                    Edit
                </button>
                <button className="delete-btn" onClick={() => onDelete(slot)}>
                    Delete
                </button>
            </div>
        </div>
    );
}
