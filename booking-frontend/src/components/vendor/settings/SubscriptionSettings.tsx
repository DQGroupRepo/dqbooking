import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";

const plans = [
    {
        name: "Gold",
        price: "₹10,000",
        period: "per year",
        users: "6 users can access the system — 1 admin and 5 users with limited/all rights",
        services: "Up to 6 services for the same vendor",
        media: "10 pictures + 3 videos for each service",
        promotion: "Added promotions for the service",
        support: "24/7 Priority Support",
        platformFee: "2% + payment gateway charges (1.5–2%) per booking",
        retention: "Data available for 3 years",
        features: [
            "Reports can be generated",
            "Booking notifications",
            "GST and non-GST invoicing",
            "Real-time booking — Online/Offline",
        ],
        featured: true,
    },
    {
        name: "Silver",
        price: "₹7,500",
        period: "per year",
        users: "3 users can access the system — 1 admin and 2 users with limited/all rights",
        services: "Up to 3 services for the same vendor",
        media: "5 pictures + 1 video for each service",
        promotion: "Standard promotion",
        support: "24/7 Support",
        platformFee: "3% + payment gateway charges (1.5–2%) per booking",
        retention: "Data available for 3 years",
        features: [
            "Reports can be generated",
            "Booking notifications",
            "GST and non-GST invoicing",
            "Real-time booking — Online/Offline",
        ],
    },
    {
        name: "Platinum",
        price: "₹5,000",
        period: "per year",
        users: "Only 1 user can access the system",
        services: "Only 1 service can be added",
        media: "3 pictures",
        promotion: undefined,
        support: "On-call Support",
        platformFee: "4% + payment gateway charges (1.5–2%) per booking",
        retention: "Data available for 1 year",
        features: [
            "Reports can be generated",
            "Booking notifications",
            "GST and non-GST invoicing",
            "Real-time booking — Online/Offline",
        ],
    },
];

export default function SubscriptionSettings() {
    return (
        <>
            <SectionHeader
                title="Subscription"
                subtitle="Compare the DQBooking.com plans and their included features."
            />

            <div className="subscription-plans-grid">
                {plans.map((plan) => (
                    <article
                        className={`subscription-plan-card${plan.featured ? " subscription-plan-card--featured" : ""}`}
                        key={plan.name}
                    >
                        <div className="subscription-plan-heading">
                            <div>
                                <span className="subscription-plan-eyebrow">DQBooking Plan</span>
                                <h2>{plan.name}</h2>
                            </div>
                            {plan.featured && <span className="subscription-plan-badge">Best value</span>}
                        </div>

                        <div className="subscription-plan-price">
                            <strong>{plan.price}</strong>
                            <span>{plan.period}</span>
                        </div>

                        <ul className="subscription-plan-highlights">
                            <li>{plan.users}</li>
                            <li>{plan.services}</li>
                            <li>{plan.media}</li>
                            {plan.promotion && <li>{plan.promotion}</li>}
                            <li>{plan.support}</li>
                            <li>{plan.retention}</li>
                        </ul>

                        <div className="subscription-plan-fee">
                            <span>Booking platform fee</span>
                            <strong>{plan.platformFee}</strong>
                        </div>

                        <div className="subscription-plan-includes">
                            <h3>Also included</h3>
                            <ul>
                                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                            </ul>
                        </div>
                    </article>
                ))}
            </div>
            <p className="subscription-plan-note">
                These plans are displayed for information only. Subscription selection and payment are not enabled yet.
            </p>
        </>
    );
}
