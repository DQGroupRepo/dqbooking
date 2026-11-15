import "./Home.css";

import CategoryCard
    from "../../components/home/CategoryCard";

import ServiceSection
    from "../../components/home/ServiceSection";

import MobileCarousel
    from "../../components/common/MobileCarousel/MobileCarousel";

import RatingStars
    from "../../components/common/RatingStars";

import {
    categories
} from "../../mocks/categories";

import {
    popularLocations,
    testimonials
} from "../../mocks/homeExtraData";

import {
    useEffect,
    useState
} from "react";

import CustomerService
    from "../../services/CustomerService";

import type {
    VendorListing
} from "../../types/VendorListing";


const Home = () => {


    /*
     * =========================================
     * HOME DISCOVERY DATA
     * =========================================
     */

    const [
        featuredServices,
        setFeaturedServices
    ] = useState<VendorListing[]>([]);


    const [
        popularHalls,
        setPopularHalls
    ] = useState<VendorListing[]>([]);


    const [
        bridalMakeup,
        setBridalMakeup
    ] = useState<VendorListing[]>([]);


    const [
        photographyServices,
        setPhotographyServices
    ] = useState<VendorListing[]>([]);


    const [
        videographyServices,
        setVideographyServices
    ] = useState<VendorListing[]>([]);


    /*
     * =========================================
     * LOAD HOME PAGE DATA
     * =========================================
     */

    useEffect(() => {

        loadHomeServices();

    }, []);


    async function loadHomeServices() {

        try {

            const [

                featuredData,

                popularHallsData,

                bridalMakeupData,

                photographyData,

                videographyData

            ] =
                await Promise.all([

                    CustomerService
                        .getFeaturedServices(),

                    CustomerService
                        .getPopularHalls(),

                    CustomerService
                        .getTopBridalMakeup(),

                    CustomerService
                        .getProfessionalPhotography(),

                    CustomerService
                        .getWeddingVideography()

                ]);


            setFeaturedServices(
                featuredData
            );


            setPopularHalls(
                popularHallsData
            );


            setBridalMakeup(
                bridalMakeupData
            );


            setPhotographyServices(
                photographyData
            );


            setVideographyServices(
                videographyData
            );

        }
        catch (error) {

            console.error(
                "Failed to load home services:",
                error
            );


            setFeaturedServices([]);

            setPopularHalls([]);

            setBridalMakeup([]);

            setPhotographyServices([]);

            setVideographyServices([]);

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


                    <MobileCarousel
                        className="category-grid home-category-carousel"
                        ariaLabel="Service categories"
                    >
                        {categories.map(category => (
                            <CategoryCard
                                key={category.category}
                                icon={category.icon}
                                title={category.title}
                                description={category.description}
                                link={category.link}
                                category={category.category}
                            />
                        ))}
                    </MobileCarousel>

                </div>

            </section>


            {/* =========================================
                FEATURED VENDORS
            ========================================= */}

            <ServiceSection

                title="Featured Vendors"

                subtitle="Discover handpicked event professionals"

                services={
                    featuredServices
                }

            />


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
                        How DQBooking.com works
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


                    <MobileCarousel
                        className="testimonial-grid home-testimonial-carousel"
                        ariaLabel="Customer reviews"
                    >
                        {testimonials.map(item => (
                            <div className="testimonial-card" key={item.name}>
                                <RatingStars value={5} size="medium" />
                                <p>"{item.review}"</p>
                                <strong>- {item.name}</strong>
                            </div>
                        ))}
                    </MobileCarousel>

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
                        Join DQBooking.com and reach
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