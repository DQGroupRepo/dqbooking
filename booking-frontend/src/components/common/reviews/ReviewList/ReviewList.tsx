import { useEffect, useState } from "react";

import VendorReviewService from "../../../../services/VendorReviewService";
import type { Review } from "../../../../types/Review";

import styles from "./ReviewList.module.css";

interface Props {

    title?: string;

    limit?: number;

    layout?: "grid" | "list";

}

export default function ReviewList({

    title = "Customer Reviews",

    limit,

    layout = "list"

}: Props) {

    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {

        loadReviews();

    }, []);

    async function loadReviews() {

        const data =
            await VendorReviewService.getReviews();

        setReviews(limit ? data.slice(0, limit) : data);

    }

    return (

        <section className={styles.container}>

            {title && (

                <h2 className={styles.heading}>
                    {title}
                </h2>

            )}

            <div className={styles[layout]}>

                {reviews.map(review => (

                    <div
                        key={review.id}
                        className={styles.card}
                    >

                        <div className={styles.stars}>

                            {"⭐".repeat(review.rating)}

                        </div>

                        <p className={styles.comment}>

                            "{review.comment}"

                        </p>

                        <div className={styles.footer}>

                            <strong>

                                {review.customerName}

                            </strong>

                            <span>

                                {review.reviewDate}

                            </span>

                        </div>

                    </div>

                ))}

            </div>

        </section>

    );

}