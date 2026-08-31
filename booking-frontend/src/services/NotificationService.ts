import api from "../api/axiosConfig";

import type {
    Notification
} from "../types/Notification";


class NotificationService {

    async getNotifications():
        Promise<Notification[]> {

        const response =
            await api.get<Notification[]>(
                "/notifications"
            );

        return response.data;

    }


    async getUnreadCount():
        Promise<number> {

        const response =
            await api.get<{ count: number }>(
                "/notifications/unread-count"
            );

        return response.data.count;

    }


    async markAsRead(
        notificationId: string
    ): Promise<void> {

        await api.patch(
            `/notifications/${notificationId}/read`
        );

    }


    async markAllAsRead(): Promise<void> {

        await api.patch(
            "/notifications/read-all"
        );

    }

}


export default new NotificationService();