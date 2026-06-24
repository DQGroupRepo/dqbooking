import "./SearchBar.css";


const SearchBar = () => {


  return (

    <section className="search-strip">

      <div className="container">
      <div className="search-results-box">


        <input
          type="text"
          placeholder="Location"
        />


        <select>

          <option>
            Halls
          </option>

          <option>
            Photography
          </option>

          <option>
            Videography
          </option>

          <option>
            Makeup
          </option>

        </select>



        <input
          type="date"
        />


        <input
          type="date"
        />



        <button>
          Search
        </button>


      </div>

    </div>
    </section>

  );

};


export default SearchBar;