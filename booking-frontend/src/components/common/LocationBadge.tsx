import "./LocationBadge.css";

interface LocationBadgeProps {
    city?: string | null;
    variant?: "detail" | "card" | "compact";
}

/** Consistent location treatment for service details, featured cards and listings. */
const LocationBadge = ({ city, variant = "card" }: LocationBadgeProps) => {
    const value = city?.trim();
    if (!value) return null;

    return (
        <span className={`location-badge location-badge--${variant}`} aria-label={`Location: ${value}`}>
            <svg className="location-badge__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M20 10.2c0 5.1-8 11.3-8 11.3S4 15.3 4 10.2a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span className="location-badge__text">{value}</span>
        </span>
    );
};

export default LocationBadge;
