import type { Review } from "../../../types/Review";
import RatingStars from "../../common/RatingStars";

import "./ReviewSummaryCard.css";

interface Props{

    reviews:Review[];

}

export default function ReviewSummaryCard({

    reviews

}:Props){

    const total = reviews.length;

    const average =

        total === 0

        ? 0

        : (

            reviews.reduce(

                (sum,item)=>sum+item.rating,

                0

            ) / total

        ).toFixed(1);

    return(

        <div className="review-summary-card">

            <h2>

                Overall Rating

            </h2>

            <div className="rating-number">
                <RatingStars value={Number(average)} size="large" />
                <span>{average}</span>
            </div>

            <p>

                Based on {total} Reviews

            </p>

        </div>

    );

}