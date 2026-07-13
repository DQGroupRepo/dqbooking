import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import Button from "../../common/ui/Button/Button";

export default function SupportSettings(){

    return(

        <>

            <SectionHeader

                title="Support"

                subtitle="Need help? We're here for you."

            />

            <div className="support-grid">

                <div className="support-card">

                    <h3>

                        Help Center

                    </h3>

                    <p>

                        Browse guides and FAQs.

                    </p>

                    <Button>

                        Open Help Center

                    </Button>

                </div>

                <div className="support-card">

                    <h3>

                        Contact Support

                    </h3>

                    <p>

                        Reach our support team.

                    </p>

                    <Button>

                        Contact Us

                    </Button>

                </div>

                <div className="support-card">

                    <h3>

                        Terms & Conditions

                    </h3>

                    <p>

                        Read our latest policies.

                    </p>

                    <Button>

                        View Terms

                    </Button>

                </div>

                <div className="support-card">

                    <h3>

                        Privacy Policy

                    </h3>

                    <p>

                        Learn how we protect your data.

                    </p>

                    <Button>

                        View Policy

                    </Button>

                </div>

            </div>

            <div className="app-version">

                EventNest Vendor Portal

                <br/>

                Version 1.0.0

            </div>

        </>

    );

}