import { Link } from "react-router-dom";
import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import "./SupportSettings.css";

const supportItems = [
    { title: "Help Center", description: "Browse guides and FAQs.", action: "Open Help Center", to: "/help-center" },
    { title: "Contact Support", description: "Find the right place to get assistance.", action: "Contact Us", to: "/contact-us" },
    { title: "Terms & Conditions", description: "Read the platform terms and conditions.", action: "View Terms", to: "/terms-and-conditions" },
    { title: "Privacy Policy", description: "Learn how information is handled on DQBooking.", action: "View Policy", to: "/privacy-policy" },
];

export default function SupportSettings() {
    return (
        <>
            <SectionHeader title="Support" subtitle="Need help? We're here for you." />
            <div className="support-grid">
                {supportItems.map(item => (
                    <article className="support-card" key={item.to}>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <Link className="support-card__link" to={item.to}>{item.action}</Link>
                    </article>
                ))}
            </div>
            <div className="app-version">DQBooking.com Vendor Portal<br />Version 1.0.0</div>
        </>
    );
}
