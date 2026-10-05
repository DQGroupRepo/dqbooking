import { useState } from "react";
import "./VendorPackages.css";
import type { ServicePackage } from "../../types/ServicePackage";

interface Props {
    packages?: ServicePackage[];
    selectedPackage?: ServicePackage | null;
    onSelectPackage: (pkg: ServicePackage) => void;
}

const VISIBLE_PACKAGES = 3;

const VendorPackages = ({
    packages = [],
    selectedPackage,
    onSelectPackage
}: Props) => {

    const activePackages =
        packages.filter(
            pkg => pkg.active !== false
        );

    const [currentIndex, setCurrentIndex] =
        useState(0);


    if (activePackages.length === 0) {
        return null;
    }


    const totalPackages =
        activePackages.length;


    const showNavigation =
        totalPackages > VISIBLE_PACKAGES;


    const maxIndex =
        Math.max(
            0,
            totalPackages - VISIBLE_PACKAGES
        );


    const safeCurrentIndex =
        Math.min(
            currentIndex,
            maxIndex
        );


    const visiblePackages =
        showNavigation
            ? activePackages.slice(
                safeCurrentIndex,
                safeCurrentIndex + VISIBLE_PACKAGES
            )
            : activePackages;


    /*
     * =========================================
     * PACKAGE SELECTION
     * =========================================
     *
     * Prefer the package ID when available.
     *
     * If the backend does not provide an ID,
     * fall back to object reference comparison.
     *
     * This makes the selection work reliably
     * with both persisted and temporary packages.
     */
    const isPackageSelected =
        (pkg: ServicePackage): boolean => {

            if (!selectedPackage) {
                return false;
            }


            if (
                pkg.id &&
                selectedPackage.id
            ) {

                return (
                    pkg.id ===
                    selectedPackage.id
                );

            }


            return (
                pkg ===
                selectedPackage
            );

        };


    const goPrevious = () => {

        setCurrentIndex(
            previous =>
                Math.max(
                    0,
                    previous - 1
                )
        );

    };


    const goNext = () => {

        setCurrentIndex(
            previous =>
                Math.min(
                    maxIndex,
                    previous + 1
                )
        );

    };


    return (

        <section className="vendor-packages">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="packages-heading">

                <div>

                    <h2>
                        Packages
                    </h2>

                </div>


                {showNavigation && (

                    <div className="packages-navigation">

                        <button
                            type="button"
                            className="package-nav-button"
                            onClick={goPrevious}
                            disabled={
                                safeCurrentIndex === 0
                            }
                            aria-label="Previous packages"
                        >
                            ‹
                        </button>


                        <span className="package-page-count">

                            {safeCurrentIndex + 1}

                            {" / "}

                            {maxIndex + 1}

                        </span>


                        <button
                            type="button"
                            className="package-nav-button"
                            onClick={goNext}
                            disabled={
                                safeCurrentIndex >= maxIndex
                            }
                            aria-label="Next packages"
                        >
                            ›
                        </button>

                    </div>

                )}

            </div>


            <p className="package-selection-help">

                Choose a package that best suits
                your requirements.

            </p>


            {/* =========================================
                PACKAGE CARDS
            ========================================= */}

            <div className="package-carousel">

                <div
                    className={
                        showNavigation
                            ? "package-grid carousel-grid"
                            : "package-grid"
                    }
                >

                    {visiblePackages.map(
                        (
                            pkg,
                            index
                        ) => {

                            const packageKey =
                                pkg.id ??
                                `${pkg.name}-${pkg.price}-${safeCurrentIndex}-${index}`;


                            const isSelected =
                                isPackageSelected(
                                    pkg
                                );


                            return (

                                <div
                                    key={packageKey}
                                    className={
                                        isSelected
                                            ? "package-card selected"
                                            : "package-card"
                                    }
                                >

                                    {/* =================================
                                        SELECTED BADGE
                                    ================================= */}

                                    {isSelected && (

                                        <div className="package-selected-badge">

                                            ✓ Selected

                                        </div>

                                    )}


                                    <div className="package-card-content">

                                        <h3>
                                            {pkg.name}
                                        </h3>


                                        <h4>

                                            ₹
                                            {Number(
                                                pkg.price
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </h4>


                                        <div className="package-feature-area">

                                            {
                                                pkg.features &&
                                                pkg.features.length > 0
                                                    ? (

                                                        <ul className="package-features">

                                                            {
                                                                pkg.features.map(
                                                                    (
                                                                        feature,
                                                                        featureIndex
                                                                    ) => (

                                                                        <li
                                                                            key={
                                                                                featureIndex
                                                                            }
                                                                        >
                                                                            {feature}
                                                                        </li>

                                                                    )
                                                                )
                                                            }

                                                        </ul>

                                                    )
                                                    : (

                                                        <div className="package-no-features">

                                                            No additional features

                                                        </div>

                                                    )
                                            }

                                        </div>

                                    </div>


                                    {/* =================================
                                        SELECT BUTTON
                                    ================================= */}

                                    <button
                                        type="button"
                                        className={
                                            isSelected
                                                ? "package-select-button selected"
                                                : "package-select-button"
                                        }
                                        onClick={() =>
                                            onSelectPackage(
                                                pkg
                                            )
                                        }
                                    >

                                        {isSelected
                                            ? "✓ Selected"
                                            : "Select"
                                        }

                                    </button>

                                </div>

                            );

                        }
                    )}

                </div>

            </div>


            {/* =========================================
                FOOTER
            ========================================= */}

            {showNavigation && (

                <div className="package-carousel-footer">

                    <span>

                        Showing{" "}

                        {safeCurrentIndex + 1}

                        {" - "}

                        {Math.min(
                            safeCurrentIndex +
                            VISIBLE_PACKAGES,
                            totalPackages
                        )}

                        {" of "}

                        {totalPackages}

                        {" packages"}

                    </span>

                </div>

            )}

        </section>

    );

};


export default VendorPackages;