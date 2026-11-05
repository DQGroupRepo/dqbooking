import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import Button from "../../common/ui/Button/Button";
import Input from "../../common/ui/Input/Input";

import BookingSlotService from "../../../services/BookingSlotService";

import type { BookingSlot } from "../../../types/BookingSlot";
import type { CreateBookingSlotRequest } from "../../../types/CreateBookingSlotRequest";

import "./BookingSlotModal.css";

interface Props {
    serviceId: string;
    slot?: BookingSlot;
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
}

function getDuration(startTime: string, endTime: string): {
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

export default function BookingSlotModal({
    serviceId,
    slot,
    open,
    onClose,
    onSaved
}: Props) {
    const isEditMode = !!slot;
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<CreateBookingSlotRequest>({
        slotName: "",
        startTime: "",
        endTime: "",
        maxBookings: 1,
        displayOrder: 1
    });

    useEffect(() => {
        if (!slot) {
            setFormData({
                slotName: "",
                startTime: "",
                endTime: "",
                maxBookings: 1,
                displayOrder: 1
            });
            return;
        }

        setFormData({
            slotName: slot.slotName,
            startTime: slot.startTime,
            endTime: slot.endTime,
            maxBookings: slot.maxBookings,
            displayOrder: slot.displayOrder
        });
    }, [slot, open]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value, type } = e.target;
        setFormData(previous => ({
            ...previous,
            [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value
        }));
    }

    async function handleSave() {
        if (!formData.slotName.trim()) {
            toast.error("Slot name is required.");
            return;
        }
        if (!formData.startTime) {
            toast.error("Start time is required.");
            return;
        }
        if (!formData.endTime) {
            toast.error("End time is required.");
            return;
        }

        // Earlier end times represent an overnight slot. Equal times are
        // rejected because they are ambiguous (zero hours vs. 24 hours).
        if (formData.endTime === formData.startTime) {
            toast.error("Start Time and End Time cannot be the same. For an overnight slot, choose an earlier end time.");
            return;
        }
        if (formData.maxBookings <= 0) {
            toast.error("Maximum bookings must be at least 1.");
            return;
        }
        if (formData.displayOrder <= 0) {
            toast.error("Display Order must be greater than zero.");
            return;
        }

        setSaving(true);
        try {
            if (isEditMode) {
                await BookingSlotService.updateSlot(serviceId, slot!.id, formData);
                toast.success("Slot updated.");
            } else {
                await BookingSlotService.createSlot(serviceId, formData);
                toast.success("Slot created.");
            }
            onSaved();
            onClose();
        } catch {
            toast.error("Unable to save slot.");
        } finally {
            setSaving(false);
        }
    }

    if (!open) return null;

    const duration = getDuration(formData.startTime, formData.endTime);

    return (
        <div className="slot-modal-overlay">
            <div className="slot-modal">
                <h2>{isEditMode ? "Edit Booking Slot" : "Add Booking Slot"}</h2>

                <Input
                    name="slotName"
                    label="Slot Name"
                    value={formData.slotName}
                    onChange={handleChange}
                />

                <Input
                    name="startTime"
                    type="time"
                    label="Start Time"
                    value={formData.startTime}
                    onChange={handleChange}
                />

                <Input
                    name="endTime"
                    type="time"
                    label="End Time"
                    value={formData.endTime}
                    onChange={handleChange}
                />

                {duration && (
                    <div className={`slot-duration-preview${duration.overnight ? " overnight" : ""}`}>
                        <span className="slot-duration-label">Selected duration</span>
                        <strong>{formatDuration(duration.minutes)}</strong>
                        <span className="slot-duration-detail">
                            {duration.overnight
                                ? "Ends the following day"
                                : "Starts and ends on the same day"}
                        </span>
                    </div>
                )}
                {formData.startTime && formData.endTime && !duration && (
                    <p className="slot-duration-error">
                        Start and end times must be different. Equal times are not treated as a 24-hour slot.
                    </p>
                )}

                <Input
                    name="maxBookings"
                    type="number"
                    label="Maximum Bookings"
                    value={formData.maxBookings.toString()}
                    onChange={handleChange}
                />

                <Input
                    name="displayOrder"
                    type="number"
                    label="Display Order"
                    value={formData.displayOrder.toString()}
                    onChange={handleChange}
                />

                <div className="slot-modal-actions">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
