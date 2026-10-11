import { useEffect, useMemo, useState } from "react";

import AdminReviewService from "../../services/AdminReviewService";

import type { Review } from "../../types/Review";

import "./AdminReviews.css";


const AdminReviews = () => {

    const [reviews, setReviews] =
        useState<Review[]>([]);

    const [search, setSearch] =
        useState("");

    const [ratingFilter, setRatingFilter] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /*
     * =========================================
     * LOAD REVIEWS
     * =========================================
     */

    useEffect(() => {

        loadReviews();

    }, []);


    async function loadReviews() {

        try {

            setLoading(true);
            setError("");

            const data =
                await AdminReviewService.getReviews();

            setReviews(data);

        } catch (error) {

            console.error(
                "Failed to load admin reviews:",
                error
            );

            setError(
                "Unable to load reviews."
            );

        } finally {

            setLoading(false);

        }

    }


    /*
     * =========================================
     * DELETE REVIEW
     * =========================================
     */

    async function handleDelete(
        reviewId: string
    ) {

        const confirmed =
            window.confirm(
                "Are you sure you want to remove this review?"
            );

        if (!confirmed) {
            return;
        }


        try {

            await AdminReviewService.deleteReview(
                reviewId
            );

            setReviews(
                current =>
                    current.filter(
                        review =>
                            review.id !== reviewId
                    )
            );

        } catch (error) {

            console.error(
                "Failed to delete review:",
                error
            );

            alert(
                "Unable to delete the review."
            );

        }

    }


    /*
     * =========================================
     * FILTER
     * =========================================
     */

    const filteredReviews =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return reviews.filter(review => {

                const matchesSearch =
                    !searchValue ||
                    review.customerName
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    review.customerEmail
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    review.serviceName
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    review.comment
                        ?.toLowerCase()
                        .includes(searchValue);


                const matchesRating =
                    ratingFilter === 0 ||
                    review.rating === ratingFilter;


                return (
                    matchesSearch &&
                    matchesRating
                );

            });

        }, [
            reviews,
            search,
            ratingFilter
        ]);


    /*
     * =========================================
     * HELPERS
     * =========================================
     */

    function renderStars(
        rating: number
    ) {

        return (

            <div className="admin-review-stars">

                {[1, 2, 3, 4, 5].map(star => (

                    <span
                        key={star}
                        className={
                            star <= rating
                                ? "filled"
                                : ""
                        }
                    >
                        ★
                    </span>

                ))}

            </div>

        );

    }


    function formatDate(
        date?: string
    ) {

        if (!date) {
            return "—";
        }

        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    }


    /*
     * =========================================
     * LOADING
     * =========================================
     */

    if (loading) {

        return (

            <section className="admin-reviews">

                <div className="admin-review-state">

                    Loading reviews...

                </div>

            </section>

        );

    }


    /*
     * =========================================
     * PAGE
     * =========================================
     */

    return (

        <section className="admin-reviews">


            {/* HEADER */}

            <div className="admin-reviews-header">

                <div>

                    <h1>
                        Reviews
                    </h1>

                    <p>
                        Monitor customer feedback
                        across the DQBooking platform.
                    </p>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="admin-review-error">

                    {error}

                </div>

            )}


            {/* FILTERS */}

            <div className="admin-review-toolbar">

                <div className="admin-review-search">

                    <span>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search customer, service or review..."
                        value={search}
                        onChange={e =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={ratingFilter}
                    onChange={e =>
                        setRatingFilter(
                            Number(e.target.value)
                        )
                    }
                >

                    <option value={0}>
                        All Ratings
                    </option>

                    <option value={5}>
                        5 Stars
                    </option>

                    <option value={4}>
                        4 Stars
                    </option>

                    <option value={3}>
                        3 Stars
                    </option>

                    <option value={2}>
                        2 Stars
                    </option>

                    <option value={1}>
                        1 Star
                    </option>

                </select>

            </div>


            {/* SUMMARY */}

            <div className="admin-review-summary">

                <span>

                    Showing{" "}

                    <strong>
                        {filteredReviews.length}
                    </strong>{" "}

                    of{" "}

                    <strong>
                        {reviews.length}
                    </strong>{" "}

                    reviews

                </span>

            </div>


            {/* REVIEWS */}

            <div className="admin-review-list">

                {filteredReviews.length === 0 ? (

                    <div className="admin-review-empty">

                        <div>
                            ★
                        </div>

                        <h3>
                            No reviews found
                        </h3>

                        <p>
                            There are no reviews matching
                            your current filters.
                        </p>

                    </div>

                ) : (

                    filteredReviews.map(review => (

                        <article
                            className="admin-review-card"
                            key={review.id}
                        >


                            {/* TOP */}

                            <div className="admin-review-card-top">

                                <div className="admin-review-customer">

                                    <div className="admin-review-avatar">

                                        {review.customerName
                                            ?.charAt(0)
                                            .toUpperCase() || "?"}

                                    </div>

                                    <div>

                                        <strong>
                                            {review.customerName}
                                        </strong>

                                        <span>
                                            {review.customerEmail ||
                                                "Customer"}
                                        </span>

                                    </div>

                                </div>


                                <div className="admin-review-date">

                                    {formatDate(
                                        review.reviewDate
                                    )}

                                </div>

                            </div>


                            {/* SERVICE */}

                            <div className="admin-review-service">

                                <span>
                                    Service
                                </span>

                                <strong>
                                    {review.serviceName ||
                                        "Unknown Service"}
                                </strong>

                            </div>


                            {/* RATING */}

                            <div className="admin-review-rating">

                                {renderStars(
                                    review.rating
                                )}

                                <strong>
                                    {review.rating}/5
                                </strong>

                            </div>


                            {/* COMMENT */}

                            <p className="admin-review-comment">

                                "{review.comment}"

                            </p>


                            {/* VENDOR REPLY */}

                            {review.vendorReply && (

                                <div className="admin-review-reply">

                                    <span>
                                        Vendor Reply
                                    </span>

                                    <p>
                                        {review.vendorReply}
                                    </p>

                                </div>

                            )}


                            {/* ACTIONS */}

                            <div className="admin-review-actions">

                                <button
                                    type="button"
                                    className="admin-review-delete"
                                    onClick={() =>
                                        handleDelete(
                                            review.id
                                        )
                                    }
                                >
                                    Remove Review
                                </button>

                            </div>

                        </article>

                    ))

                )}

            </div>

        </section>

    );

};


export default AdminReviews;