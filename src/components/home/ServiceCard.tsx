import "./ServiceCard.css";


interface ServiceCardProps {

  image: string;

  title: string;

  city: string;

  detail: string;

  price: string;

}


const ServiceCard = ({
  image,
  title,
  city,
  detail,
  price
}: ServiceCardProps) => {


return (

<div className="service-card">


<img

src={image}

alt={title}

/>



<div className="service-content">


<h3>
{title}
</h3>



<p>
📍 {city}
</p>



<span>
{detail}
</span>



<h4>
{price}
</h4>



<button>
View Details
</button>


</div>


</div>

);


};


export default ServiceCard;