import { Children, useCallback, useRef, useState, type ReactNode } from "react";
import "./MobileCarousel.css";

type MobileCarouselProps = {
    children: ReactNode;
    className?: string;
    ariaLabel: string;
    /** Number of cards shown together on each mobile/tablet page. */
    itemsPerPage?: number;
    /** Pagination can sit above horizontally scrolling content or below it. */
    paginationPosition?: "top" | "bottom";
};

export default function MobileCarousel({
    children,
    className = "",
    ariaLabel,
    itemsPerPage = 1,
    paginationPosition = "bottom"
}: MobileCarouselProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const items = Children.toArray(children);
    const pageSize = Math.max(1, Math.floor(itemsPerPage));
    const pages: ReactNode[][] = [];
    for (let index = 0; index < items.length; index += pageSize) {
        pages.push(items.slice(index, index + pageSize));
    }

    const updateActive = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        const pageElements = Array.from(viewport.children) as HTMLElement[];
        if (!pageElements.length) {
            setActiveIndex(0);
            return;
        }
        const viewportRect = viewport.getBoundingClientRect();
        const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;
        pageElements.forEach((page, index) => {
            const rect = page.getBoundingClientRect();
            const center = rect.left - viewportRect.left + viewport.scrollLeft + rect.width / 2;
            const distance = Math.abs(center - viewportCenter);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });
        setActiveIndex(closestIndex);
    }, []);

    const goToPage = (index: number) => {
        const viewport = viewportRef.current;
        const page = viewport?.children[index] as HTMLElement | undefined;
        if (!viewport || !page) return;
        const left = page.getBoundingClientRect().left - viewport.getBoundingClientRect().left + viewport.scrollLeft;
        viewport.scrollTo({ left, behavior: "smooth" });
        setActiveIndex(index);
    };

    const pagination = pages.length > 1 ? (
        <div className="dq-mobile-carousel__pagination" role="group" aria-label={`${ariaLabel} pages`}>
            <div className="dq-mobile-carousel__dots">
                {pages.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        className={`dq-mobile-carousel__dot${activeIndex === index ? " is-active" : ""}`}
                        aria-label={`Show ${ariaLabel} page ${index + 1} of ${pages.length}`}
                        aria-current={activeIndex === index ? "true" : undefined}
                        onClick={() => goToPage(index)}
                    />
                ))}
            </div>
            <span className="dq-mobile-carousel__count">{activeIndex + 1} of {pages.length}</span>
        </div>
    ) : null;

    return (
        <div className={`dq-mobile-carousel ${className}`.trim()}>
            {paginationPosition === "top" && pagination}
            <div
                ref={viewportRef}
                className="dq-mobile-carousel__viewport"
                onScroll={updateActive}
                aria-label={ariaLabel}
            >
                {pages.map((pageItems, pageIndex) => (
                    <div className="dq-mobile-carousel__page" key={pageIndex}>
                        <div className={`dq-mobile-carousel__page-content${pageSize > 1 ? " is-multi-card" : ""}`}>
                            {pageItems.map((child, itemIndex) => (
                                <div className="dq-mobile-carousel__card" key={pageIndex * pageSize + itemIndex}>
                                    {child}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {paginationPosition === "bottom" && pagination}
        </div>
    );
}
