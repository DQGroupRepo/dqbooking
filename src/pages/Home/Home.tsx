import "./Home.css";

import FeaturedVendorCard from "../../components/vendor/FeaturedVendorCard";
import SearchBar from "../../components/search/SearchBar";
import CategoryCard from "../../components/home/CategoryCard";
import { categories } from "../../mocks/categories";
import ServiceCard from "../../components/home/ServiceCard";
import ServiceSection from "../../components/home/ServiceSection";
import { popularLocations, testimonials } from "../../mocks/homeExtraData";

import { popularHalls, bridalMakeup, photographyServices, videographyServices } from "../../mocks/homeServices";
import { mockVendors } from "../../mocks/mockVendors";

const Home = () => {
  return (
    <>

      <section className="hero">
        <div className="hero-overlay">
        <div className="hero-content">

          <h1>
            Find Everything For Your Special Occasion
          </h1>

          <p>
            Discover trusted venues,
            photographers,
            makeup artists,
            decorators and event professionals.
          </p>
          <SearchBar />
        </div>
        </div>
        </section>

        <section className="categories-section">

          <div className="container">

            <h2 className="section-title">
              Explore Categories
            </h2>

            <p className="section-subtitle">

              Everything you need for your celebration

            </p>


            <div className="category-grid">

              {categories.map((category) => (

                <CategoryCard

                  key={category.title}

                  icon={category.icon}

                  title={category.title}

                  description={category.description}

                  link={category.link}

                />

              ))}

            </div>

          </div>

        </section>

        <section className="featured-vendors">

                <div className="container">

                  <div className="section-header">

                    <h2>
                      Featured Vendors
                    </h2>

                    <div className="carousel-buttons">

                      <button>
                        ‹
                      </button>

                      <button>
                        ›
                      </button>

                    </div>

                  </div>


                  <div className="vendor-grid">

                    {mockVendors.map((vendor) => (

                      <FeaturedVendorCard
                        key={vendor.id}
                        vendor={vendor}
                      />

                    ))}

                  </div>

                </div>

              </section>

        <ServiceSection

        title="Popular Halls"

        subtitle="Beautiful venues for weddings and celebrations"

        services={popularHalls}

        />


        <ServiceSection

        title="Top Bridal Makeup Artists"

        subtitle="Professional artists for your special day"

        services={bridalMakeup}

        />


        <ServiceSection

        title="Professional Photography"

        subtitle="Capture your beautiful moments"

        services={photographyServices}

        />


        <ServiceSection

        title="Wedding Videography"

        subtitle="Cinematic memories forever"

        services={videographyServices}

        />

        <section className="locations-section">

          <div className="container">

            <h2 className="section-title">
              Popular Locations
            </h2>

            <div className="location-grid">

              {popularLocations.map((location) => (

                <div
                  key={location.city}
                  className="location-card"
                >

                  <h3>
                    {location.city}
                  </h3>

                  <p>
                    {location.vendors}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>

        <section className="how-it-works">

          <div className="container">

            <h2 className="section-title">
              How EventNest Works
            </h2>

            <div className="steps-grid">

              <div className="step-card">

                <span>1</span>

                <h3>
                  Choose Service
                </h3>

                <p>
                  Select halls, photographers,
                  makeup artists and more.
                </p>

              </div>


              <div className="step-card">

                <span>2</span>

                <h3>
                  Compare Vendors
                </h3>

                <p>
                  Check ratings, packages
                  and reviews.
                </p>

              </div>


              <div className="step-card">

                <span>3</span>

                <h3>
                  Book & Celebrate
                </h3>

                <p>
                  Confirm your booking
                  and enjoy your event.
                </p>

              </div>

            </div>

          </div>

        </section>

        <section className="testimonial-section">

          <div className="container">

            <h2 className="section-title">
              Customer Reviews
            </h2>

            <div className="testimonial-grid">

              {testimonials.map((item) => (

                <div
                  key={item.name}
                  className="testimonial-card"
                >

                  <div>
                    ⭐⭐⭐⭐⭐
                  </div>

                  <p>
                    "{item.review}"
                  </p>

                  <strong>
                    - {item.name}
                  </strong>

                </div>

              ))}

            </div>

          </div>

        </section>

        <section className="vendor-banner">

          <div className="container">

            <h2>
              Are you an Event Service Provider?
            </h2>

            <p>
              Join EventNest and reach
              thousands of customers.
            </p>

            <button>
              Register Your Business
            </button>

          </div>

        </section>



    </>
  );
};

export default Home;