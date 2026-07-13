import "./ReviewFilters.css";

interface Props{

    search:string;

    setSearch:(value:string)=>void;

    filter:number;

    setFilter:(value:number)=>void;

}

export default function ReviewFilters({

    search,

    setSearch,

    filter,

    setFilter

}:Props){

    return(

        <div className="review-filters">

            <input

                type="text"

                placeholder="Search customer..."

                value={search}

                onChange={(e)=>

                    setSearch(

                        e.target.value

                    )

                }

            />

            <select

                value={filter}

                onChange={(e)=>

                    setFilter(

                        Number(e.target.value)

                    )

                }

            >

                <option value={0}>

                    All Ratings

                </option>

                <option value={5}>5 ★</option>

                <option value={4}>4 ★</option>

                <option value={3}>3 ★</option>

                <option value={2}>2 ★</option>

                <option value={1}>1 ★</option>

            </select>

        </div>

    );

}