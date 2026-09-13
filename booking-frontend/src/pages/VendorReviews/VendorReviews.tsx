import {

    useEffect,
    useMemo,
    useState

} from "react";

import ReviewService from "../../services/ReviewService";

import type { Review } from "../../types/Review";

import ReviewSummaryCard from "../../components/vendor/reviews/ReviewSummaryCard";

import ReviewFilters from "../../components/vendor/reviews/ReviewFilters";

import ReviewList from "../../components/vendor/reviews/ReviewList";

import "./VendorReviews.css";

export default function VendorReviews() {

    const [reviews, setReviews] = useState<Review[]>([]);

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState(0);

    useEffect(() => {

        loadReviews();

    }, []);

    async function loadReviews() {

        const data =

            await ReviewService.getReviews();

        setReviews(data);

    }

    const filteredReviews = useMemo(() => {

        return reviews.filter(review => {

            const matchesSearch =

                review.customerName ?? "Customer"

                    .toLowerCase()

                    .includes(

                        search.toLowerCase()

                    );

            const matchesRating =

                filter === 0 ||

                review.rating === filter;

            return (

                matchesSearch &&

                matchesRating

            );

        });

    }, [reviews, search, filter]);

    return (

        <section className="vendor-reviews">

            <div className="page-header">

                <h1>

                    Customer Reviews

                </h1>

                <p>

                    Monitor customer feedback and respond to reviews.

                </p>

            </div>

            <ReviewSummaryCard

                reviews={reviews}

            />

            <ReviewFilters

                search={search}

                setSearch={setSearch}

                filter={filter}

                setFilter={setFilter}

            />

            <ReviewList

                reviews={filteredReviews}

            />

        </section>

    );

}