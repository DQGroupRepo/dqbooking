import api from "../api/axiosConfig";
import type { BookingSlot } from "../types/BookingSlot";
import type { CreateBookingSlotRequest } from "../types/CreateBookingSlotRequest";
import type { UpdateBookingSlotRequest } from "../types/UpdateBookingSlotRequest";

class BookingSlotService {
  async getSlots(serviceId: string): Promise<BookingSlot[]> {
    const response = await api.get<BookingSlot[]>(
      `/vendor/services/${serviceId}/slots`,
    );

    return response.data;
  }

  async getSlot(serviceId: string, slotId: string): Promise<BookingSlot> {
    const response = await api.get<BookingSlot>(
      `/vendor/services/${serviceId}/slots/${slotId}`,
    );

    return response.data;
  }

  async createSlot(
    serviceId: string,
    request: CreateBookingSlotRequest,
  ): Promise<BookingSlot> {
    const response = await api.post<BookingSlot>(
      `/vendor/services/${serviceId}/slots`,
      request,
    );

    return response.data;
  }

  async updateSlot(
    serviceId: string,
    slotId: string,
    request: UpdateBookingSlotRequest,
  ): Promise<BookingSlot> {
    const response = await api.put<BookingSlot>(
      `/vendor/services/${serviceId}/slots/${slotId}`,
      request,
    );

    return response.data;
  }

  async deleteSlot(serviceId: string, slotId: string): Promise<void> {
    await api.delete(`/vendor/services/${serviceId}/slots/${slotId}`);
  }

  async changeStatus(
    serviceId: string,
    slotId: string,
    active: boolean,
  ): Promise<BookingSlot> {
    const response = await api.patch<BookingSlot>(
      `/vendor/services/${serviceId}/slots/${slotId}/status`,
      { active },
    );

    return response.data;
  }
}

export default new BookingSlotService();
