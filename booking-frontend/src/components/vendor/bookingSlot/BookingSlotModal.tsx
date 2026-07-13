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

export default function BookingSlotModal({

    serviceId,

    slot,

    open,

    onClose,

    onSaved

}: Props) {

    const isEditMode = !!slot;

    const [saving, setSaving] = useState(false);

    const [formData, setFormData] =
        useState<CreateBookingSlotRequest>({

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

    }, [slot]);

    function handleChange(

        e: React.ChangeEvent<HTMLInputElement>

    ) {

        setFormData({

            ...formData,

            [e.target.name]:

                e.target.type === "number"

                    ? Number(e.target.value)

                    : e.target.value

        });

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
        if(

            formData.endTime <= formData.startTime

        ){

            toast.error(

                "End time must be after Start Time."

            );

            return;

        }
        if(

            formData.maxBookings <= 0

        ){

            toast.error(

                "Maximum bookings must be at least 1."

            );

            return;

        }

        if (formData.displayOrder <= 0) {

            toast.error(

                "Display Order must be greater than zero."

            );

            return;

        }

        setSaving(true);

        try {

            if (isEditMode) {

                await BookingSlotService.updateSlot(

                    serviceId,

                    slot!.id,

                    formData

                );

                toast.success("Slot updated.");

            }

            else {

                await BookingSlotService.createSlot(

                    serviceId,

                    formData

                );

                toast.success("Slot created.");

            }

            onSaved();

            onClose();

        }

        catch {

            toast.error("Unable to save slot.");

        }

        finally {

            setSaving(false);

        }

    }

    if (!open) return null;

    return (

        <div className="slot-modal-overlay">

            <div className="slot-modal">

                <h2>

                    {

                        isEditMode

                            ? "Edit Booking Slot"

                            : "Add Booking Slot"

                    }

                </h2>

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

                    <Button

                        variant="secondary"

                        onClick={onClose}

                    >

                        Cancel

                    </Button>

                    <Button

                        onClick={handleSave}

                        disabled={saving}

                    >

                        {

                            saving

                                ? "Saving..."

                                : "Save"

                        }

                    </Button>

                </div>

            </div>

        </div>

    );

}