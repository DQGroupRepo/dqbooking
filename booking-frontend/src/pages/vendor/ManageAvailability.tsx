import Calendar from "react-calendar";

import AvailabilitySummary from "../../components/vendor/availability/AvailabilitySummary/AvailabilitySummary";
import AvailabilitySlotList from "../../components/vendor/availability/AvailabilitySlotList/AvailabilitySlotList";
import AvailabilityOverrideModal from "../../components/vendor/availability/AvailabilityOverrideModal/AvailabilityOverrideModal";
import "react-calendar/dist/Calendar.css";
import "./ManageAvailability.css";

import AvailabilityOverrideService
    from "../../services/AvailabilityOverrideService";

import type { AvailabilityOverride }
    from "../../types/AvailabilityOverride";


import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import BookingSlotService from "../../services/BookingSlotService";

import type { BookingSlot } from "../../types/BookingSlot";

export default function ManageAvailability() {

    const { id } = useParams();

    const [selectedDate, setSelectedDate] =
        useState<Date>(new Date());

    const [overrides, setOverrides] =
        useState<AvailabilityOverride[]>([]);

    const [slots, setSlots] =
        useState<BookingSlot[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [showModal, setShowModal] =
        useState(false);

    const [selectedSlot, setSelectedSlot] =
        useState<BookingSlot>();

    const [selectedOverride, setSelectedOverride] =
        useState<AvailabilityOverride>();

    useEffect(() => {

        loadSlots();

    }, [id]);

    useEffect(() => {

        loadOverrides();

    }, [id, selectedDate]);

    function formatDate(date: Date): string {

        return date.toISOString().split("T")[0];

    }

    async function loadOverrides() {

        if (!id) return;

        try {

            const response =
                await AvailabilityOverrideService.getOverrides(

                    id,

                    formatDate(selectedDate)

                );

            setOverrides(response);

        }

        catch (error) {

            console.error(error);

        }

    }

    function handleManage(slot: BookingSlot) {

        setSelectedSlot(slot);

        const override = overrides.find(

            o => o.slotId === slot.id

        );

        setSelectedOverride(override);

        setShowModal(true);

    }

    async function loadSlots() {

        if (!id) return;

        try {

            const response =
                await BookingSlotService.getSlots(id);

            response.sort(

                (a, b) =>

                    a.displayOrder -

                    b.displayOrder

            );

            setSlots(response);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    }

    if (loading) {

        return <h2>Loading...</h2>;

    }

    return (


        <section className="manage-availability">

            <AvailabilitySummary
                selectedDate={selectedDate}
                totalSlots={slots.length}
                blockedSlots={0}
                availableCapacity={

                    slots

                        .filter(s => s.active)

                        .reduce(

                            (sum, slot) =>

                                sum + slot.maxBookings,

                            0

                        )

                }
            />

            <div className="availability-layout">

                <div className="calendar-panel">

                    <Calendar
                        value={selectedDate}
                        onChange={(value) =>
                            setSelectedDate(value as Date)
                        }
                    />

                </div>

                <div className="slot-panel">

                    <AvailabilitySlotList
                        selectedDate={selectedDate}
                        slots={slots}
                        overrides={overrides}
                        onManage={handleManage}
                    />

                </div>

            </div>
            {
                selectedSlot && (

                    <AvailabilityOverrideModal
                        open={showModal}
                        onClose={() => setShowModal(false)}
                        onSaved={loadOverrides}
                        serviceId={id!}
                        selectedDate={selectedDate}
                        slot={selectedSlot}
                        override={selectedOverride}
                    />

                )
            }

        </section>

    );

}