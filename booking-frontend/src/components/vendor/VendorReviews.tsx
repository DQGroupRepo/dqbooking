import RatingStars from "../common/RatingStars";
import "./VendorReviews.css";


interface Review {
  name: string;
  rating: number;
  comment: string;
}


const reviews: Review[] = [

  {
    name: "Rahul",
    rating: 5,
    comment:
      "Excellent venue and very professional staff."
  },

  {
    name: "Kavitha",
    rating: 4,
    comment:
      "Beautiful decoration and spacious hall."
  }

];


const VendorReviews = () => {


  return (

    <section className="vendor-reviews">


      <h2>
        Customer Reviews
      </h2>



      <div className="reviews-carousel" aria-label="Customer reviews">

        {reviews.map((review,index)=>(

          <div
            className="review-card"
            key={index}
          >

          <div className="review-stars">

            <RatingStars value={review.rating} size="medium" />

          </div>


          <p>
            "{review.comment}"
          </p>


          <strong>
            - {review.name}
          </strong>


          </div>

        ))}

      </div>

    </section>

  );

};


export default VendorReviews;