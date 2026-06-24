import SearchBar from "../../components/search/SearchBar";
import FilterPanel from "../../components/search/FilterPanel";

import VendorCard from "../../components/vendor/VendorCard";

import Pagination from "../../components/vendor/Pagination"

import { mockVendors } from "../../data/mockVendors";

import "./CategoryListing.css";


const CategoryListing = () => {


return (

<>


<SearchBar />



<section className="results-section">


<div className="container results-layout">


<FilterPanel />



<div className="results-content">


<div className="results-header">


<h2>

{mockVendors.length} Vendors Found

</h2>



<select>

<option>
Sort by Popularity
</option>

<option>
Price Low to High
</option>

<option>
Rating
</option>


</select>


</div>




<div className="vendor-results">


{
mockVendors.map(vendor=>(


<VendorCard

key={vendor.id}

vendor={vendor}

/>


))
}
<Pagination />



</div>



</div>



</div>


</section>


</>

);

};


export default CategoryListing;