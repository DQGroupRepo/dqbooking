import { Link } from "react-router-dom";
import "./ManageServices.css";


const ManageServices = () => {


    const services = [

        {
            id:1,

            image:
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",

            name:"Royal Palace Convention Hall",

            category:"Hall",

            location:"Chennai, Tamil Nadu",

            price:"₹45,000",

            capacity:"500 Guests",

            status:"Active"

        },


        {
            id:2,

            image:
            "https://images.unsplash.com/photo-1519741497674-611481863552",

            name:"Royal Wedding Photography",

            category:"Photography",

            location:"Chennai, Tamil Nadu",

            price:"₹75,000",

            capacity:"Full Day",

            status:"Draft"

        },


        {
            id:3,

            image:
            "https://images.unsplash.com/photo-1507504031003-b417219a0fde",

            name:"Premium Floral Decoration",

            category:"Decoration",

            location:"Chennai, Tamil Nadu",

            price:"₹35,000",

            capacity:"Event Package",

            status:"Active"

        }


    ];





    return (


<section className="manage-services">


<div className="services-container">





<div className="services-header">


<div>

<h1>
Manage Services
</h1>


<p>
View and manage all your EventNest listings.
</p>

</div>





<Link to="/add-service">


<button className="add-service-btn">

+ Add New Service

</button>


</Link>



</div>







<div className="services-grid">



{
services.map(service=>(


<div
className="service-list-card"
key={service.id}
>



<img

src={service.image}

alt={service.name}

/>





<div className="service-content">



<h2>
{service.name}
</h2>



<p>
Category : {service.category}
</p>



<p>
📍 {service.location}
</p>



<p>
Starting Price : {service.price}
</p>



<p>
Capacity : {service.capacity}
</p>





<span

className={
service.status==="Active"
?
"active-status"
:
"draft-status"
}

>

{service.status}

</span>





<div className="service-actions">


<button className="edit-btn">

Edit

</button>



<button className="delete-btn">

Delete

</button>


</div>



</div>



</div>



))

}



</div>





</div>


</section>


    );


};


export default ManageServices;