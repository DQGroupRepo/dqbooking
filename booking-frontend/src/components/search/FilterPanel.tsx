import "./FilterPanel.css";


const FilterPanel = () => {


return (

<aside className="filter-panel">


<h2>
Filters
</h2>



<div className="filter-group">

<h4>
Budget
</h4>


<label>
<input type="checkbox"/>
Below ₹25,000
</label>


<label>
<input type="checkbox"/>
₹25k - ₹50k
</label>


<label>
<input type="checkbox"/>
₹50k+
</label>


</div>



<div className="filter-group">

<h4>
Rating
</h4>


<label>
<input type="checkbox"/>
4★ & Above
</label>


<label>
<input type="checkbox"/>
3★ & Above
</label>


</div>



<div className="filter-group">

<h4>
Capacity
</h4>


<label>
<input type="checkbox"/>
100 Guests
</label>


<label>
<input type="checkbox"/>
300 Guests
</label>


<label>
<input type="checkbox"/>
500+ Guests
</label>


</div>



</aside>

);

};


export default FilterPanel;