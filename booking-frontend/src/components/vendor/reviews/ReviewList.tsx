import { useState } from "react";

import type { Review } from "../../../types/Review";
import RatingStars from "../../common/RatingStars";

import Button from "../../common/ui/Button/Button";

import "./ReviewList.css";

interface Props {

    reviews: Review[];

}

export default function ReviewList({

    reviews

}: Props) {

    const [replyingId, setReplyingId] = useState<string | null>(null);

    const [reply, setReply] = useState("");

    return (

        <div className="review-list">

            {

                reviews.map(review => (

                    <div

                        key={review.id}

                        className="review-card"

                    >

                        <div className="review-header">

                            <div>

                                <h3>

                                    {review.customerName}

                                </h3>

                                <p>

                                    {review.serviceName}

                                </p>

                            </div>

                            <div className="review-rating">

                                <RatingStars value={review.rating} size="medium" />

                            </div>

                        </div>

                        <p className="review-date">

                            {review.reviewDate}

                        </p>

                        <p className="review-comment">

                            {review.comment}

                        </p>

                        {

                            review.vendorReply && (

                                <div className="vendor-reply">

                                    <strong>

                                        Vendor Reply

                                    </strong>

                                    <p>

                                        {review.vendorReply}

                                    </p>

                                </div>

                            )

                        }

                        {

                            replyingId === review.id ? (

                                <div className="reply-box">

                                    <textarea

                                        rows={4}

                                        value={reply}

                                        placeholder="Write your reply..."

                                        onChange={(e) =>

                                            setReply(

                                                e.target.value

                                            )

                                        }

                                    />

                                    <div className="reply-actions">

                                        <Button>

                                            Submit Reply

                                        </Button>

                                        <Button

                                            variant="secondary"

                                            onClick={() => {

                                                setReplyingId(null);

                                                setReply("");

                                            }}

                                        >

                                            Cancel

                                        </Button>

                                    </div>

                                </div>

                            ) : (

                                !review.vendorReply && (

                                    <Button

                                        onClick={() =>

                                            setReplyingId(review.id)

                                        }

                                    >

                                        Reply

                                    </Button>

                                )

                            )

                        }

                    </div>

                ))

            }

        </div>

    );

}
