import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AvailabilityOverrideService
    from "../../../../services/AvailabilityOverrideService";

import type { AvailabilityOverride }
    from "../../../types/AvailabilityOverride";

import type { BookingSlot } from "../../../types/BookingSlot";

import Button from "../../../common/ui/Button/Button";

import "./AvailabilityOverrideModal.css";

interface Props {

    open: boolean;

    onClose: () => void;

    onSaved: () => void;

    serviceId: string;

    selectedDate: Date;

    slot: BookingSlot;

    override?: AvailabilityOverride;

}

export default function AvailabilityOverrideModal({

    open,

    onClose,

    onSaved,

    serviceId,

    selectedDate,

    slot,

    override

}: Props) {

    const [blocked, setBlocked] = useState(false);

    const [reason, setReason] = useState("");

    const [capacity, setCapacity] =
        useState<number | "">("");

    useEffect(() => {

        if (!open) return;

        setBlocked(
            override?.blocked ?? false
        );

        setReason(
            override?.reason ?? ""
        );

        setCapacity(
            override?.capacityOverride ?? ""
        );

    }, [override, open]);

    async function handleDelete() {

        if (!override) return;

        const confirmed = window.confirm(

            "Remove this availability override?"

        );

        if (!confirmed) return;

        try {

            await AvailabilityOverrideService.deleteOverride(

                serviceId,

                override.id

            );

            toast.success(

                "Availability restored."

            );

            onSaved();

            onClose();

        }

        catch {

            toast.error(

                "Unable to delete override."

            );

        }

    }

    async function handleSave() {

        try {

            const request = {

                slotId: slot.id,

                date: selectedDate
                    .toISOString()
                    .split("T")[0],

                blocked,

                reason,

                capacityOverride:

                    capacity === ""

                        ? null

                        : Number(capacity)

            };

            if (override) {

                await AvailabilityOverrideService.updateOverride(

                    serviceId,

                    override.id,

                    request

                );

            }

            else {

                await AvailabilityOverrideService.createOverride(

                    serviceId,

                    request

                );

            }

            toast.success("Availability updated.");

            onSaved();

            onClose();

        }

        catch {

            toast.error("Unable to save.");

        }

    }

    if (!open) return null;

    return (

        <div className="availability-modal-backdrop">

            <div className="availability-modal">

                <h2>

                    Manage Availability

                </h2>

                <p>

                    <strong>

                        {slot.slotName}

                    </strong>

                </p>

                <label>

                    <input

                        type="checkbox"

                        checked={blocked}

                        onChange={e =>

                            setBlocked(e.target.checked)

                        }

                    />

                    Block this slot

                </label>

                <label>

                    Reason

                    <textarea

                        value={reason}

                        onChange={e =>

                            setReason(e.target.value)

                        }

                    />

                </label>

                <label>

                    Capacity Override

                    <input

                        type="number"

                        value={capacity}

                        onChange={e =>

                            setCapacity(

                                e.target.value === ""

                                    ? ""

                                    : Number(e.target.value)

                            )

                        }

                    />

                </label>

                <div className="modal-actions">

                    {

                        override && (

                            <Button

                                variant="danger"

                                onClick={handleDelete}

                            >

                                Restore Default

                            </Button>

                        )

                    }

                    <Button

                        variant="secondary"

                        onClick={onClose}

                    >

                        Cancel

                    </Button>

                    <Button

                        onClick={handleSave}

                    >

                        Save

                    </Button>

                </div>

            </div>

        </div>

    );

}
