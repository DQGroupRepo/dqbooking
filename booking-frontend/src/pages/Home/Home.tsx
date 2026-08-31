import "./Home.css";

import FeaturedVendorCard from "../../components/vendor/FeaturedVendorCard";
import SearchBar from "../../components/search/SearchBar";
import CategoryCard from "../../components/home/CategoryCard";
import { categories } from "../../mocks/categories";
import ServiceSection from "../../components/home/ServiceSection";
import {
    popularLocations,
    testimonials
} from "../../mocks/homeExtraData";

import {
    popularHalls,
    bridalMakeup,
    photographyServices,
    videographyServices
} from "../../mocks/homeServices";

import {
    useEffect,
    useState
} from "react";

import type {
    FeaturedService
} from "../../types/FeaturedService";


const Home = () => {

    const [
        featuredServices,
        setFeaturedServices
    ] = useState<FeaturedService[]>([]);

    const featuredDisplayServices =
            featuredServices.length === 0
                ? []
                : featuredServices.length === 1
                    ? [
                        featuredServices[0],
                        featuredServices[0],
                        featuredServices[0]
                    ]
                    : featuredServices.length === 2
                        ? [
                            featuredServices[0],
                            featuredServices[1],
                            featuredServices[0]
                        ]
                        : featuredServices.slice(0, 3);
    /*
     * =========================================
     * LOAD FEATURED SERVICES
     * =========================================
     *
     * These are selected by the admin from
     * Vendor Verification.
     */

    useEffect(() => {

        loadFeaturedServices();

    }, []);


    async function loadFeaturedServices() {

        try {

            /*
             * IMPORTANT:
             *
             * This should use the CUSTOMER
             * featured-services endpoint.
             *
             * Do NOT use the admin verification
             * service here.
             */

            const response =
                await fetch(
                    "http://localhost:8080/api/customer/services/featured"
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to load featured services."
                );

            }


            const data:
                FeaturedService[] =
                await response.json();


            setFeaturedServices(
                data
            );

        }
        catch (error) {

            console.error(
                "Failed to load featured services:",
                error
            );


            setFeaturedServices(
                []
            );

        }

    }


    return (

        <>

            {/* =========================================
                HERO
            ========================================= */}

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


            {/* =========================================
                CATEGORIES
            ========================================= */}

            <section className="categories-section">

                <div className="container">

                    <h2 className="section-title">
                        Explore Categories
                    </h2>

                    <p className="section-subtitle">
                        Everything you need for your celebration
                    </p>


                    <div className="category-grid">

                        {
                            categories.map(
                                category => (

                                    <CategoryCard

                                        key={
                                            category.title
                                        }

                                        icon={
                                            category.icon
                                        }

                                        title={
                                            category.title
                                        }

                                        description={
                                            category.description
                                        }

                                        link={
                                            category.link
                                        }

                                        category={
                                            category.category
                                        }

                                    />

                                )
                            )
                        }

                    </div>

                </div>

            </section>


            {/* =========================================
                FEATURED VENDORS
            ========================================= */}

            <section className="featured-vendors">

                <div className="container">

                    <div className="section-header">

                        <h2>
                            Featured Vendors
                        </h2>


                        <div className="carousel-buttons">

                            <button
                                type="button"
                            >
                                ‹
                            </button>

                            <button
                                type="button"
                            >
                                ›
                            </button>

                        </div>

                    </div>


                    {
                        featuredServices.length === 0 ? (

                            <div className="featured-empty-state">

                                <p>
                                    No featured services available at the moment.
                                </p>

                            </div>

                        ) : (

                            <div className="vendor-grid">

                                {featuredDisplayServices.map(
                                    (service, index) => (

                                        <FeaturedVendorCard
                                            key={`${service.serviceId}-${index}`}
                                            service={service}
                                        />

                                    )
                                )}

                            </div>

                        )
                    }

                </div>

            </section>


            {/* =========================================
                POPULAR HALLS
            ========================================= */}

            <ServiceSection

                title="Popular Halls"

                subtitle="Beautiful venues for weddings and celebrations"

                services={
                    popularHalls
                }

            />


            {/* =========================================
                BRIDAL MAKEUP
            ========================================= */}

            <ServiceSection

                title="Top Bridal Makeup Artists"

                subtitle="Professional artists for your special day"

                services={
                    bridalMakeup
                }

            />


            {/* =========================================
                PHOTOGRAPHY
            ========================================= */}

            <ServiceSection

                title="Professional Photography"

                subtitle="Capture your beautiful moments"

                services={
                    photographyServices
                }

            />


            {/* =========================================
                VIDEOGRAPHY
            ========================================= */}

            <ServiceSection

                title="Wedding Videography"

                subtitle="Cinematic memories forever"

                services={
                    videographyServices
                }

            />


            {/* =========================================
                POPULAR LOCATIONS
            ========================================= */}

            <section className="locations-section">

                <div className="container">

                    <h2 className="section-title">
                        Popular Locations
                    </h2>


                    <div className="location-grid">

                        {
                            popularLocations.map(
                                location => (

                                    <div

                                        key={
                                            location.city
                                        }

                                        className="location-card"

                                    >

                                        <h3>
                                            {
                                                location.city
                                            }
                                        </h3>

                                        <p>
                                            {
                                                location.vendors
                                            }
                                        </p>

                                    </div>

                                )
                            )
                        }

                    </div>

                </div>

            </section>


            {/* =========================================
                HOW IT WORKS
            ========================================= */}

            <section className="how-it-works">

                <div className="container">

                    <h2 className="section-title">
                        How EventNest Works
                    </h2>


                    <div className="steps-grid">

                        <div className="step-card">

                            <span>
                                1
                            </span>

                            <h3>
                                Choose Service
                            </h3>

                            <p>
                                Select halls, photographers,
                                makeup artists and more.
                            </p>

                        </div>


                        <div className="step-card">

                            <span>
                                2
                            </span>

                            <h3>
                                Compare Vendors
                            </h3>

                            <p>
                                Check ratings, packages
                                and reviews.
                            </p>

                        </div>


                        <div className="step-card">

                            <span>
                                3
                            </span>

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


            {/* =========================================
                TESTIMONIALS
            ========================================= */}

            <section className="testimonial-section">

                <div className="container">

                    <h2 className="section-title">
                        Customer Reviews
                    </h2>


                    <div className="testimonial-grid">

                        {
                            testimonials.map(
                                item => (

                                    <div

                                        key={
                                            item.name
                                        }

                                        className="testimonial-card"

                                    >

                                        <div>
                                            ⭐⭐⭐⭐⭐
                                        </div>

                                        <p>
                                            "
                                            {
                                                item.review
                                            }
                                            "
                                        </p>

                                        <strong>
                                            - {item.name}
                                        </strong>

                                    </div>

                                )
                            )
                        }

                    </div>

                </div>

            </section>


            {/* =========================================
                VENDOR BANNER
            ========================================= */}

            <section className="vendor-banner">

                <div className="container">

                    <h2>
                        Are you an Event Service Provider?
                    </h2>

                    <p>
                        Join EventNest and reach
                        thousands of customers.
                    </p>

                    <button
                        type="button"
                    >
                        Register Your Business
                    </button>

                </div>

            </section>

        </>

    );

};


export default Home;