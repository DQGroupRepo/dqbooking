import "./RatingStars.css";

interface RatingStarsProps {
    value: number;
    size?: "small" | "medium" | "large";
    className?: string;
}

/** Read-only, accessible star display. Supports fractional average ratings. */
export default function RatingStars({
    value,
    size = "medium",
    className = ""
}: RatingStarsProps) {
    const safeValue = Math.max(0, Math.min(5, Number.isFinite(value) ? value : 0));

    return (
        <span
            className={`rating-stars rating-stars--${size} ${className}`.trim()}
            role="img"
            aria-label={`${safeValue.toFixed(1)} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const fill = Math.max(0, Math.min(1, safeValue - (star - 1))) * 100;
                return (
                    <span className="rating-stars__item" key={star} aria-hidden="true">
                        <span className="rating-stars__empty">★</span>
                        <span className="rating-stars__fill" style={{ width: `${fill}%` }}>★</span>
                    </span>
                );
            })}
        </span>
    );
}
