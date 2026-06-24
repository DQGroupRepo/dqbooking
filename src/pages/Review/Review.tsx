import { useState } from "react";
import StarRating from "../../components/StarRating/StarRating";
import "./Review.css";


const Review =()=>{


const vendor={

    name:"Royal Palace Convention Hall",

    location:"Chennai, Tamil Nadu",

    image:
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3"

};



const [rating,setRating]=useState(0);


const [form,setForm]=useState({

    eventType:"",

    title:"",

    experience:"",

    venue:"5",

    staff:"5",

    value:"5"

});


const [photos,setPhotos]=useState<File[]>([]);



const handleChange=(e:any)=>{


    setForm({

        ...form,

        [e.target.name]:e.target.value

    });


};



const handleSubmit=()=>{

    console.log({

        rating,

        form,

        photos

    });

};



return (

<>

<section className="review-page">


<div className="review-layout">



{/* Vendor Summary */}

<div className="review-vendor-card">


<img
src={vendor.image}
alt={vendor.name}
/>



<h2>
{vendor.name}
</h2>


<p>
📍 {vendor.location}
</p>



<div className="vendor-stars">

★★★★★

</div>



<p>
Your feedback helps other customers make better decisions.
</p>


</div>





{/* Review Form */}


<div className="review-form-card">


<h1>
Share Your Experience
</h1>


<p>
Tell others about your event experience.
</p>





<div className="review-section">

<h3>
Overall Rating
</h3>


<StarRating

value={rating}

onChange={setRating}

/>


</div>






<div className="form-group">


<label>
Event Type
</label>


<select

name="eventType"

value={form.eventType}

onChange={handleChange}

>


<option>
Select Event
</option>

<option>
Wedding
</option>

<option>
Reception
</option>

<option>
Engagement
</option>

<option>
Birthday
</option>

<option>
Corporate Event
</option>


</select>


</div>





<div className="review-section">


<h3>
Rate Individual Areas
</h3>



<div className="rating-row">

<span>
Venue Quality
</span>


<select name="venue" onChange={handleChange}>

<option>
5 - Excellent
</option>

<option>
4 - Good
</option>

<option>
3 - Average
</option>

</select>


</div>





<div className="rating-row">

<span>
Staff Behaviour
</span>


<select name="staff" onChange={handleChange}>

<option>
5 - Excellent
</option>

<option>
4 - Good
</option>

<option>
3 - Average
</option>

</select>


</div>





<div className="rating-row">

<span>
Value For Money
</span>


<select name="value" onChange={handleChange}>

<option>
5 - Excellent
</option>

<option>
4 - Good
</option>

<option>
3 - Average
</option>

</select>


</div>



</div>





<div className="form-group">


<label>
Review Title
</label>


<input

type="text"

name="title"

placeholder="Beautiful venue and great service"

onChange={handleChange}

/>


</div>






<div className="form-group">


<label>
Your Experience
</label>


<textarea

rows={6}

name="experience"

placeholder="Write your detailed experience..."

onChange={handleChange}

/>


</div>







<div className="form-group">


<label>
Upload Event Photos
</label>



<div className="upload-box">


<input

type="file"

multiple

onChange={(e)=>

setPhotos(
Array.from(e.target.files || [])
)

}

/>


<p>
Upload wedding/event photos
</p>


</div>


</div>






<button

className="submit-review"

onClick={handleSubmit}

>

Submit Review

</button>



</div>



</div>


</section>


</>

);


};


export default Review;