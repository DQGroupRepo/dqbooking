import "./VendorPackages.css";


interface Package {
  name: string;
  price: number;
  description: string;
}


const packages: Package[] = [

  {
    name: "Silver Package",
    price: 45000,
    description:
      "Hall + Basic Decoration"
  },

  {
    name: "Gold Package",
    price: 75000,
    description:
      "Hall + Premium Decoration + Catering"
  },

  {
    name: "Premium Package",
    price: 120000,
    description:
      "Complete Wedding Setup"
  }

];


const VendorPackages = () => {


  return (

    <section className="vendor-packages">


      <h2>
        Packages
      </h2>



      <div className="package-grid">


        {packages.map((pkg,index)=>(

          <div
            className="package-card"
            key={index}
          >

            <h3>
              {pkg.name}
            </h3>


            <h4>
              ₹{pkg.price.toLocaleString("en-IN")}
            </h4>


            <p>
              {pkg.description}
            </p>


            <button>
              Select
            </button>


          </div>

        ))}


      </div>


    </section>

  );

};


export default VendorPackages;