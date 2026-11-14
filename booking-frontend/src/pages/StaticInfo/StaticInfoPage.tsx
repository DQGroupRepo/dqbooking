import { Link } from "react-router-dom";
import "./StaticInfoPage.css";

type PageKey = "help" | "contact" | "terms" | "privacy";
type Section = { heading: string; paragraphs?: string[]; bullets?: string[] };
type PageContent = { title: string; intro: string; sections: Section[] };

const content: Record<PageKey, PageContent> = {
  help: {
    title: "Help Center",
    intro: "Find guidance for discovering services, managing bookings and using DQBooking.",
    sections: [
      { heading: "Finding a service", paragraphs: ["Choose a service category from the homepage or open Explore Categories. Use the category and location filters to narrow the listings."] },
      { heading: "Making a booking", paragraphs: ["Open a listing to review its details, available packages, dates and booking conditions. Follow the booking steps shown on screen and review the summary before confirming."] },
      { heading: "Managing your booking", paragraphs: ["Sign in and open My Bookings to review your booking details and available actions. Cancellation and refund options depend on the policy shown for the booking."] },
      { heading: "Vendor assistance", paragraphs: ["Vendors can sign in to manage listings, services, availability, pricing and booking requests from the Vendor Portal."] },
    ],
  },
  contact: {
    title: "Contact Us",
    intro: "We want your DQBooking experience to be straightforward. Use the relevant account area to find help with your request.",
    sections: [
      { heading: "Customer booking support", paragraphs: ["For a booking question, sign in and open My Bookings. Keep your booking reference available when reviewing the booking or requesting assistance."] },
      { heading: "Vendor support", paragraphs: ["For listing, pricing, availability or account questions, sign in to the Vendor Portal and open Settings → Support."] },
      { heading: "What to include", bullets: ["Your booking reference, if the request relates to a booking", "The service or listing name", "A short description of the issue and the steps you have already tried"] },
      { heading: "Support contact details", paragraphs: ["Additional direct support contact details will be published here when they are configured by DQBooking."] },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: "These are preliminary website terms for the current static page. They should be reviewed and approved by DQBooking before being treated as final legal terms.",
    sections: [
      { heading: "Using the platform", paragraphs: ["DQBooking provides an online marketplace to discover event-related services and communicate booking requests between customers and service providers. Users must provide accurate information and use the platform lawfully."] },
      { heading: "Listings and bookings", paragraphs: ["Service descriptions, prices, availability, package details and cancellation conditions are provided for each listing. Customers should review the applicable details before submitting or confirming a booking."] },
      { heading: "Payments and cancellations", paragraphs: ["Any advance payment, payment schedule, cancellation rule or refund condition applicable to a booking is the condition displayed during the booking process or in the booking details."] },
      { heading: "Platform availability", paragraphs: ["DQBooking may update, improve or temporarily restrict parts of the platform to maintain or improve the service. These preliminary terms do not replace any booking-specific agreement or applicable law."] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "This is a preliminary privacy notice for the static page and must be reviewed against DQBooking's actual data practices before publication as a final policy.",
    sections: [
      { heading: "Information provided by users", paragraphs: ["DQBooking may process information that users submit when creating an account, contacting a vendor, making a booking or managing a service listing. This can include contact, booking and listing information."] },
      { heading: "How information is used", paragraphs: ["Information may be used to operate accounts, display relevant listings, process booking workflows, communicate booking updates, provide support and maintain platform security."] },
      { heading: "Sharing", paragraphs: ["Information needed to fulfil a booking may be made available to the relevant customer or service provider. Information may also be processed by service providers that support the operation of the platform."] },
      { heading: "Data requests", paragraphs: ["Users should use the account and support options available in DQBooking to raise questions about their information. Specific retention periods, legal bases and request procedures should be added after the platform's data practices are confirmed."] },
    ],
  },
};

export default function StaticInfoPage({ page }: { page: PageKey }) {
  const pageContent = content[page];
  return (
    <main className="static-info-page">
      <div className="static-info-page__inner">
        <nav className="static-info-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span aria-hidden="true">/</span><span>{pageContent.title}</span>
        </nav>
        <header className="static-info-header">
          <h1>{pageContent.title}</h1>
          <p>{pageContent.intro}</p>
        </header>
        <div className="static-info-content">
          {pageContent.sections.map(section => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              {section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
            </section>
          ))}
        </div>
        <Link className="static-info-home-link" to="/">Back to DQBooking</Link>
      </div>
    </main>
  );
}
