import { useEffect } from "react";
import "./SettingsImagePreview.css";

type Props = { src: string; alt: string; className?: string; onClick?: () => void };

export default function SettingsImagePreview({ src, alt, className = "", onClick }: Props) {
    return (
        <>
            <button type="button" className={`settings-image-trigger ${className}`} onClick={onClick} aria-label={`View ${alt} full size`}>
                <img src={src} alt={alt} />
            </button>
        </>
    );
}

export function SettingsImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [onClose]);
    return (
        <div className="settings-image-lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
            <button type="button" className="settings-image-lightbox-close" onClick={onClose} aria-label="Close image preview">×</button>
            <div className="settings-image-lightbox-content" onClick={event => event.stopPropagation()}>
                <img src={src} alt={alt} />
            </div>
        </div>
    );
}
