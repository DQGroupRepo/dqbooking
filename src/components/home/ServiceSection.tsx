import ServiceCard from "./ServiceCard";

import "./ServiceSection.css";


interface Props {

title:string;

subtitle:string;

services:any[];

}


const ServiceSection = ({
title,
subtitle,
services
}:Props)=>{


return (

<section className="service-section">


<div className="container">


<h2 className="section-title">

{title}

</h2>


<p className="section-subtitle">

{subtitle}

</p>



<div className="service-grid">


{
services.map((service)=>(
<ServiceCard

key={service.title}

{...service}

/>
))
}


</div>


</div>


</section>

);


};


export default ServiceSection;