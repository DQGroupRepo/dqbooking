import { useState } from "react";
import "./StarRating.css";

interface StarRatingProps {
    value: number;
    onChange: (rating:number)=>void;
}


const StarRating = ({value,onChange}:StarRatingProps)=>{

    const [hover,setHover]=useState(0);


    return (

        <div className="star-rating">

            {[1,2,3,4,5].map((star)=>(

                <span

                    key={star}

                    className={
                        star <= (hover || value)
                        ? "active-star"
                        : ""
                    }

                    onMouseEnter={()=>setHover(star)}

                    onMouseLeave={()=>setHover(0)}

                    onClick={()=>onChange(star)}

                >

                    ★

                </span>

            ))}

        </div>

    );

};


export default StarRating;