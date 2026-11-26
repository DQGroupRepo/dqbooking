import Loader from "../../common/Loader";
import { useEffect, useState } from "react";
import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import Button from "../../common/ui/Button/Button";
import toast from "react-hot-toast";
import VendorProfileService from "../../../services/VendorProfileService";
import type { VendorProfile } from "../../../types/VendorProfile";

type NotificationPreference =
    | "emailNotifications"
    | "smsNotifications"
    | "bookingAlerts"
    | "reviewAlerts"
    | "paymentAlerts"
    | "marketingEmails";

const preferences: { field: NotificationPreference; title: string; description: string }[] = [
    { field: "emailNotifications", title: "Email Notifications", description: "Receive important updates via email." },
    { field: "smsNotifications", title: "SMS Notifications", description: "Receive SMS alerts." },
    { field: "bookingAlerts", title: "Booking Alerts", description: "Notify when a new booking is received." },
    { field: "reviewAlerts", title: "Review Alerts", description: "Get notified whenever customers leave reviews." },
    { field: "paymentAlerts", title: "Payment Alerts", description: "Receive notifications for payments and payouts." },
    { field: "marketingEmails", title: "Marketing Emails", description: "Receive product updates, offers and promotions." }
];

export default function NotificationSettings() {
    const [profile, setProfile] = useState<VendorProfile>();
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        VendorProfileService.getProfile()
            .then(data => {
                setProfile(data);
                setDirty(false);
            })
            .catch(() => toast.error("Unable to load notification preferences."));
    }, []);

    function toggle(field: NotificationPreference) {
        if (!profile) return;
        setProfile({ ...profile, [field]: !profile[field] });
        setDirty(true);
    }

    async function handleSave() {
        if (!profile) return;
        try {
            setSaving(true);
            const updated = await VendorProfileService.updateProfile(profile);
            setProfile(updated);
            setDirty(false);
            toast.success("Notification preferences updated.");
        } catch {
            toast.error("Failed to save notification preferences.");
        } finally {
            setSaving(false);
        }
    }

    if (!profile) return <Loader />;

    return (
        <>
            <SectionHeader title="Notifications" subtitle="Choose how you'd like to receive updates." />
            <div className="notification-settings-panel">
                <div className="notification-list">
                    {preferences.map(item => (
                        <div className="notification-item" key={item.field}>
                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                            <label className="switch" aria-label={item.title}>
                                <input
                                    type="checkbox"
                                    checked={Boolean(profile[item.field])}
                                    onChange={() => toggle(item.field)}
                                />
                                <span className="slider" />
                            </label>
                        </div>
                    ))}
                </div>
                <div className="settings-actions notification-settings-actions">
                    <Button onClick={handleSave} disabled={saving || !dirty}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </>
    );
}
