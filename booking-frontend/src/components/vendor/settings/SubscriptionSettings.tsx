import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import Button from "../../common/ui/Button/Button";

export default function SubscriptionSettings(){

    return(

        <>

            <SectionHeader

                title="Subscription"

                subtitle="Manage your DQBooking.com subscription."

            />

            <div className="subscription-card">

                <div className="subscription-header">

                    <div>

                        <h2>

                            Premium Vendor Plan

                        </h2>

                        <p>

                            Active

                        </p>

                    </div>

                    <span className="plan-badge">

                        Premium

                    </span>

                </div>

                <div className="subscription-grid">

                    <div>

                        <h4>

                            Renewal Date

                        </h4>

                        <p>

                            15 January 2027

                        </p>

                    </div>

                    <div>

                        <h4>

                            Monthly Price

                        </h4>

                        <p>

                            ₹1,999

                        </p>

                    </div>

                </div>

                <div className="subscription-features">

                    <h3>

                        Included Features

                    </h3>

                    <ul>

                        <li>✔ Unlimited Listings</li>

                        <li>✔ Booking Management</li>

                        <li>✔ Revenue Analytics</li>

                        <li>✔ Customer Reviews</li>

                        <li>✔ Priority Support</li>

                    </ul>

                </div>

                <div className="settings-actions">

                    <Button>

                        Upgrade Plan

                    </Button>

                </div>

            </div>

        </>

    );

}