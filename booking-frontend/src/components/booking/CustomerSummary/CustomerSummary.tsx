import "./CustomerSummary.css";

interface Props{

    name:string;

    phone:string;

    email:string;

}

const CustomerSummary=({

    name,

    phone,

    email

}:Props)=>{

    return(

        <div className="summary-card">

            <h3>Customer Details</h3>

            <div className="summary-grid">

                <div>

                    <label>Name</label>

                    <strong>{name}</strong>

                </div>

                <div>

                    <label>Phone</label>

                    <strong>{phone}</strong>

                </div>

                <div>

                    <label>Email</label>

                    <strong>{email}</strong>

                </div>

            </div>

        </div>

    );

};

export default CustomerSummary;