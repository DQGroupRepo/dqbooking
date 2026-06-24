import { useState } from "react";
import "./AddService.css";


const AddService = () => {


    const [formData,setFormData] = useState({

        category:"",
        serviceName:"",
        location:"",
        price:"",
        capacity:"",
        description:"",

        contactPerson:"",
        mobile:"",
        email:"",

        availableFrom:"",
        availableTo:""

    });



    const [amenities,setAmenities] = useState<string[]>([]);



    const [images,setImages] = useState<File[]>([]);



    const amenityList = [

        "AC Hall",
        "Parking",
        "Dining Area",
        "Stage",
        "Generator Backup",
        "Catering Available"

    ];



    const handleChange = (
        e:React.ChangeEvent<
        HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
        >
    )=>{


        setFormData({

            ...formData,

            [e.target.name]:e.target.value

        });


    };





    const handleAmenityChange = (
        item:string
    )=>{


        if(amenities.includes(item)){


            setAmenities(
                amenities.filter(
                    amenity=>amenity!==item
                )
            );


        }
        else{


            setAmenities([
                ...amenities,
                item
            ]);


        }


    };





    const handleImages = (
        e:React.ChangeEvent<HTMLInputElement>
    )=>{


        setImages(

            Array.from(
                e.target.files || []
            )

        );


    };






    const handleSubmit=(e:React.FormEvent)=>{


        e.preventDefault();


        const serviceData={

            ...formData,

            amenities,

            images

        };


        console.log(serviceData);


    };





return (

<section className="vendor-form-section">


<div className="vendor-form-container">


<div className="vendor-form-card">



<h1>
Add New Service
</h1>



<p>
Create a new listing that customers can discover and book.
</p>





<form onSubmit={handleSubmit}>




<div className="form-group">

<label>
Service Category *
</label>


<select

name="category"

value={formData.category}

onChange={handleChange}

>


<option>
Select Category
</option>

<option>
Hall
</option>

<option>
Photography
</option>

<option>
Videography
</option>

<option>
Bridal Makeup
</option>

<option>
Floral Decoration
</option>

<option>
Catering
</option>


</select>

</div>






<div className="form-group">

<label>
Service Name *
</label>


<input

name="serviceName"

placeholder="Royal Palace Convention Hall"

onChange={handleChange}

/>

</div>







<div className="form-group">

<label>
Location *
</label>


<input

name="location"

placeholder="Chennai, Tamil Nadu"

onChange={handleChange}

/>


</div>







<div className="two-column">


<div className="form-group">

<label>
Starting Price (₹)
</label>


<input

type="number"

name="price"

placeholder="45000"

onChange={handleChange}

/>


</div>




<div className="form-group">

<label>
Maximum Capacity
</label>


<input

type="number"

name="capacity"

placeholder="500"

onChange={handleChange}

/>


</div>


</div>








<div className="form-group">

<label>
Description
</label>


<textarea

rows={6}

name="description"

placeholder="Describe your service, venue, facilities and unique features"

onChange={handleChange}

/>


</div>







<div className="form-group">


<label>
Amenities
</label>



<div className="amenities-selection">


{
amenityList.map(item=>(


<label key={item}>


<input

type="checkbox"

checked={
amenities.includes(item)
}

onChange={()=>
handleAmenityChange(item)
}


/>


{item}


</label>


))

}



</div>


</div>









<div className="form-group">


<label>
Upload Photos
</label>



<div className="upload-box">


<input

type="file"

multiple

onChange={handleImages}

/>



<p>
Upload venue/service images
</p>


</div>


</div>









<h2>
Contact Information
</h2>






<div className="two-column">


<div className="form-group">

<label>
Contact Person
</label>


<input

name="contactPerson"

placeholder="Vendor Name"

onChange={handleChange}

/>

</div>




<div className="form-group">

<label>
Mobile Number
</label>


<input

name="mobile"

placeholder="9876543210"

onChange={handleChange}

/>

</div>



</div>








<div className="form-group">

<label>
Email Address
</label>


<input

type="email"

name="email"

placeholder="vendor@email.com"

onChange={handleChange}

/>


</div>








<h2>
Availability
</h2>







<div className="two-column">


<div className="form-group">

<label>
Available From
</label>


<input

type="date"

name="availableFrom"

onChange={handleChange}

/>


</div>




<div className="form-group">

<label>
Available To
</label>


<input

type="date"

name="availableTo"

onChange={handleChange}

/>


</div>


</div>









<div className="form-actions">


<button

type="button"

className="save-button"

>

Save Draft

</button>




<button

type="submit"

className="publish-button"

>

Publish Listing

</button>



</div>





</form>


</div>


</div>


</section>

);


};


export default AddService;