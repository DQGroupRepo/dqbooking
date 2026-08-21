import "./VendorPackages.css";

import type { ServicePackage } from "../../types/ServicePackage";

interface Props {
    packages?: ServicePackage[];

    selectedPackageId?: string;

    onSelectPackage: (
        pkg: ServicePackage
    ) => void;
}

const getPackageDisplayName = (
    type: ServicePackage["type"]
): string => {

    switch (type) {

        case "SILVER":
            return "Silver Package";

        case "GOLD":
            return "Gold Package";

        case "PREMIUM":
            return "Premium Package";

        default:
            return type;
    }
};

const VendorPackages = ({
    packages = [],
    selectedPackageId,
    onSelectPackage
}: Props) => {

    const activePackages =
        packages.filter(
            pkg => pkg.active !== false
        );

    /*
     * Do not render the Packages section when
     * the service has no packages.
     */
    if (activePackages.length === 0) {
        return null;
    }

    const orderedPackages =
        [...activePackages].sort(
            (a, b) => {

                const order: Record<
                    ServicePackage["type"],
                    number
                > = {
                    SILVER: 1,
                    GOLD: 2,
                    PREMIUM: 3
                };

                return (
                    order[a.type] -
                    order[b.type]
                );
            }
        );

    /*
     * If there is only one package, don't make
     * the customer choose it.
     */
    const singlePackage =
        orderedPackages.length === 1;

    return (

        <section className="vendor-packages">

            <h2>
                Packages
            </h2>


            {
                singlePackage ? (

                    <div className="package-grid">

                        <div className="package-card selected">

                            <h3>
                                {
                                    getPackageDisplayName(
                                        orderedPackages[0].type
                                    )
                                }
                            </h3>

                            <h4>
                                ₹
                                {Number(
                                    orderedPackages[0].price
                                ).toLocaleString("en-IN")}
                            </h4>


                            {
                                orderedPackages[0].features?.length > 0 && (

                                    <ul className="package-features">

                                        {
                                            orderedPackages[0]
                                                .features
                                                .map(
                                                    (
                                                        feature,
                                                        index
                                                    ) => (

                                                        <li
                                                            key={index}
                                                        >
                                                            {feature}
                                                        </li>

                                                    )
                                                )
                                        }

                                    </ul>

                                )
                            }


                            <span className="package-selected-label">
                                Included
                            </span>

                        </div>

                    </div>

                ) : (

                    <>

                        <p className="package-selection-help">
                            Choose a package that best suits your requirements.
                        </p>


                        <div className="package-grid">

                            {
                                orderedPackages.map(
                                    pkg => {

                                        const packageKey =
                                            pkg.id ??
                                            pkg.type;

                                        const isSelected =
                                            selectedPackageId ===
                                            packageKey;

                                        return (

                                            <div
                                                key={
                                                    packageKey
                                                }
                                                className={
                                                    isSelected
                                                        ? "package-card selected"
                                                        : "package-card"
                                                }
                                            >

                                                <h3>
                                                    {
                                                        getPackageDisplayName(
                                                            pkg.type
                                                        )
                                                    }
                                                </h3>


                                                <h4>
                                                    ₹
                                                    {Number(
                                                        pkg.price
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </h4>


                                                {
                                                    pkg.features?.length > 0 && (

                                                        <ul className="package-features">

                                                            {
                                                                pkg.features.map(
                                                                    (
                                                                        feature,
                                                                        index
                                                                    ) => (

                                                                        <li
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            {feature}
                                                                        </li>

                                                                    )
                                                                )
                                                            }

                                                        </ul>

                                                    )
                                                }


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onSelectPackage(
                                                            pkg
                                                        )
                                                    }
                                                >
                                                    {
                                                        isSelected
                                                            ? "Selected"
                                                            : "Select"
                                                    }
                                                </button>

                                            </div>

                                        );

                                    }
                                )
                            }

                        </div>

                    </>

                )
            }

        </section>

    );
};

export default VendorPackages;