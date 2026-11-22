import MobileCarousel from "../../components/common/MobileCarousel/MobileCarousel";
import Loader from "../../components/common/Loader";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

import VendorServiceService from "../../services/VendorServiceService";
import BookingSlotService from "../../services/BookingSlotService";
import type { BookingSlot } from "../../types/BookingSlot";

import BookingSlotCard from "../../components/vendor/bookingSlot/BookingSlotCard";
import BookingSlotModal from "../../components/vendor/bookingSlot/BookingSlotModal";
import Button from "../../components/common/ui/Button/Button";

import "./ManageBookingSlots.css";

export default function ManageBookingSlots() {

    const { serviceId } = useParams();

    const [slots, setSlots] = useState<BookingSlot[]>([]);

    const [loading, setLoading] = useState(true);
    const [isCateringService, setIsCateringService] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const [selectedSlot, setSelectedSlot] =
        useState<BookingSlot>();

    useEffect(() => {

        loadSlots();

    }, [serviceId]);

    const totalSlots = slots.length;

    const activeSlots = slots.filter(

        s => s.active

    ).length;

    const inactiveSlots = totalSlots - activeSlots;

    const totalCapacity = slots

        .filter(s => s.active)

        .reduce(

            (sum, slot) => sum + slot.maxBookings,

            0

        );

    async function loadSlots() {

        if (!serviceId) return;

        try {

            const service = await VendorServiceService.getServiceById(serviceId);
            setIsCateringService(String(service.category ?? "").trim().toUpperCase() === "CATERING");

            const response =
                await BookingSlotService.getSlots(serviceId);

            response.sort(

                (a, b) => a.displayOrder - b.displayOrder

            );

            setSlots(response);

        }

        catch (error) {

            console.error(error);
            if (
                axios.isAxiosError(error) &&
                error.response?.status === 403
            ) {

                toast.error("You do not have permission to load/update booking slots."
                );

                return;

            }

            toast.error("Unable to load booking slots.");

        }

        finally {

            setLoading(false);

        }

    }

    async function handleToggleStatus(
        slot: BookingSlot
    ) {

        if (!serviceId) return;

        const action =
            slot.active
                ? "disable"
                : "enable";

        const confirmed = window.confirm(

            `Are you sure you want to ${action} "${slot.slotName}"?`

        );

        if (!confirmed) return;

        try {

            await BookingSlotService.changeStatus(

                serviceId,

                slot.id,

                !slot.active

            );

            toast.success(

                `Slot ${action}d successfully.`

            );

            loadSlots();

        }

        catch (error) {

            if (
                axios.isAxiosError(error) &&
                error.response?.status === 403
            ) {

                toast.error("You do not have permission to update booking slots."
                );

                return;

            }

            toast.error("Unable to update slot.");

        }

    }

    function handleAdd() {

        setSelectedSlot(undefined);

        setShowModal(true);

    }

    function handleEdit(

        slot: BookingSlot

    ) {

        setSelectedSlot(slot);

        setShowModal(true);

    }

    async function handleDelete(slot: BookingSlot) {

        if (!serviceId) return;

        const confirmed = window.confirm(

            `Delete "${slot.slotName}"?`

        );

        if (!confirmed) return;

        try {

            await BookingSlotService.deleteSlot(

                serviceId,

                slot.id

            );

            toast.success("Slot deleted.");

            loadSlots();

        }

        catch (error) {

            if (
                axios.isAxiosError(error) &&
                error.response?.status === 403
            ) {

                toast.error("You do not have permission to delete booking slots."
                );

                return;

            }
            toast.error("Unable to delete slot.");

        }

    }

    if (loading) {

        return <Loader />;

    }

    return (

        <section className="manage-booking-slots">

            <div className="page-header">

                <Button onClick={handleAdd}>

                    <FaPlus />

                    Add Slot

                </Button>

            </div>

            <MobileCarousel className="slot-summary" ariaLabel="Booking slot statistics" itemsPerPage={2}>

                <div className="summary-card">

                    <h4>Total Slots</h4>

                    <h2>{totalSlots}</h2>

                </div>

                <div className="summary-card">

                    <h4>Active</h4>

                    <h2>{activeSlots}</h2>

                </div>

                <div className="summary-card">

                    <h4>Inactive</h4>

                    <h2>{inactiveSlots}</h2>

                </div>

                <div className="summary-card">

                    <h4>Daily Capacity</h4>

                    <h2>{totalCapacity}</h2>

                </div>

            </MobileCarousel>

            {

                slots.length === 0 ?

                    (

                        <div className="empty-state">

                            <h2>

                                No Booking Slots Yet

                            </h2>

                            <p>

                                Define booking slots so customers can choose their preferred time when making a reservation.


                            </p>
                            <Button onClick={handleAdd}>

                                Create First Slot

                            </Button>

                        </div>

                    )

                    :

                    (

                        <MobileCarousel className="slots-grid" ariaLabel="Booking slots">
                            {slots.map(slot => (
                                <BookingSlotCard
                                    key={slot.id}
                                    slot={slot}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onToggleStatus={handleToggleStatus}
                    isCateringService={isCateringService}
                                />
                            ))}
                        </MobileCarousel>

                    )

            }
            <BookingSlotModal

                serviceId={serviceId!}

                slot={selectedSlot}

                open={showModal}

                onClose={() => setShowModal(false)}

                onSaved={loadSlots}

            />

        </section>

    );

}
