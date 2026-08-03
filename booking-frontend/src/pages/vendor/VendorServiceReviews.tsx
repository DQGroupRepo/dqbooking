import {
    useEffect,
    useMemo,
    useState
} from "react";

import { useParams } from "react-router-dom";

import VendorReviewService from "../../services/VendorReviewService";

import type { Review } from "../../types/Review";

import ReviewSummaryCard from "../../components/vendor/reviews/ReviewSummaryCard";
import ReviewFilters from "../../components/vendor/reviews/ReviewFilters";
import ReviewList from "../../components/vendor/reviews/ReviewList";

import "../VendorReviews/VendorReviews.css";

export default function VendorServiceReviews() {

    const { serviceId } = useParams();

    const [reviews, setReviews] = useState<Review[]>([]);

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState(0);

    useEffect(() => {

        if (serviceId) {

            loadReviews(serviceId);

        }

    }, [serviceId]);

    async function loadReviews(serviceId: string) {

        const data =
            await VendorReviewService.getReviews(serviceId);

        setReviews(data);

    }

    const filteredReviews = useMemo(() => {

        return reviews.filter(review => {

            const matchesSearch =
                review.customerName
                    .toLowerCase()
                    .includes(search.toLowerCase());

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

                <h1>Service Reviews</h1>

                <p>

                    Reviews received for this service.

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