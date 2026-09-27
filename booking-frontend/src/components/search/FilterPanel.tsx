import {
    useState
} from "react";

import "./FilterPanel.css";


const FilterPanel = () => {

    const [
        mobileOpen,
        setMobileOpen
    ] = useState(false);


    return (

        <aside
            className={
                `filter-panel ${
                    mobileOpen
                        ? "mobile-filter-open"
                        : ""
                }`
            }
        >

            {/* =================================
                MOBILE FILTER BUTTON
            ================================= */}

            <button
                type="button"
                className="mobile-filter-toggle"
                onClick={() =>
                    setMobileOpen(
                        previous => !previous
                    )
                }
                aria-expanded={
                    mobileOpen
                }
            >

                <span>
                    Filters
                </span>

                <span
                    className="mobile-filter-arrow"
                >
                    {
                        mobileOpen
                            ? "▲"
                            : "▼"
                    }
                </span>

            </button>


            {/* =================================
                FILTER CONTENT
            ================================= */}

            <div
                className="filter-content"
            >

                <h2>
                    Filters
                </h2>


                <div className="filter-group">

                    <h4>
                        Budget
                    </h4>


                    <label>
                        <input
                            type="checkbox"
                        />
                        <span>
                            Below ₹25,000
                        </span>
                    </label>


                    <label>
                        <input
                            type="checkbox"
                        />
                        <span>
                            ₹25k - ₹50k
                        </span>
                    </label>


                    <label>
                        <input
                            type="checkbox"
                        />
                        <span>
                            ₹50k+
                        </span>
                    </label>

                </div>


                <div className="filter-group">

                    <h4>
                        Rating
                    </h4>


                    <label>
                        <input
                            type="checkbox"
                        />
                        <span>
                            4★ & Above
                        </span>
                    </label>


                    <label>
                        <input
                            type="checkbox"
                        />
                        <span>
                            3★ & Above
                        </span>
                    </label>

                </div>


                <div className="filter-group">

                    <h4>
                        Capacity
                    </h4>


                    <label>
                        <input
                            type="checkbox"
                        />
                        <span>
                            100 Guests
                        </span>
                    </label>


                    <label>
                        <input
                            type="checkbox"
                        />
                        <span>
                            300 Guests
                        </span>
                    </label>


                    <label>
                        <input
                            type="checkbox"
                        />
                        <span>
                            500+ Guests
                        </span>
                    </label>

                </div>

            </div>

        </aside>

    );

};


export default FilterPanel;