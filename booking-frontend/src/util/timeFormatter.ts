export default function formatTime(time: string): string {
    if (!time) return "";

    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    const parsedTime = new Date(`1970-01-01T${normalizedTime}`);

    if (Number.isNaN(parsedTime.getTime())) {
        return time;
    }

    // Use an explicit locale so AM/PM casing and 12-hour formatting are
    // consistent regardless of the browser's language/region settings.
    return parsedTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}
