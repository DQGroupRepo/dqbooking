import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import VendorAuthService from "../../services/VendorAuthService";

import "./VendorRegister.css";


const VendorRegister = () => {


    const navigate =
        useNavigate();


    /*
     * Account Details
     */

    const [
        fullName,
        setFullName
    ] = useState("");


    const [
        email,
        setEmail
    ] = useState("");


    const [
        phone,
        setPhone
    ] = useState("");


    const [
        password,
        setPassword
    ] = useState("");


    const [
        confirmPassword,
        setConfirmPassword
    ] = useState("");


    /*
     * Business Details
     */

    const [
        businessName,
        setBusinessName
    ] = useState("");


    const [
        ownerName,
        setOwnerName
    ] = useState("");


    const [
        city,
        setCity
    ] = useState("");


    const [
        address,
        setAddress
    ] = useState("");


    const [
        description,
        setDescription
    ] = useState("");


    /*
     * UI State
     */

    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState("");


    /*
     * Handle Registration
     */

    const handleRegister = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();


        setError("");

        setSuccess("");


        /*
         * Validate Password
         */

        if (
            password.length < 8
        ) {

            setError(
                "Password must be at least 8 characters"
            );

            return;

        }


        /*
         * Confirm Password
         */

        if (
            password !==
            confirmPassword
        ) {

            setError(
                "Passwords do not match"
            );

            return;

        }


        try {

            setLoading(true);


            /*
             * Call Backend
             */

            const response =
                await VendorAuthService.register({

                    fullName,

                    email,

                    phone,

                    password,

                    businessName,

                    ownerName,

                    city,

                    address,

                    description

                });


            console.log(
                "Vendor registration response:",
                response.data
            );


            /*
             * Registration successful
             */

            setSuccess(
                "Vendor registration successful. Redirecting to login..."
            );


            /*
             * Redirect to login
             */

            setTimeout(() => {

                navigate(
                    "/login"
                );

            }, 1500);


        } catch (err: any) {

            console.error(
                "Vendor registration error:",
                err
            );


            setError(

                err.response?.data?.message ||

                err.response?.data ||

                "Vendor registration failed"

            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <section className="vendor-register-wrapper">


            <div className="vendor-register-image">

                <div className="vendor-register-overlay">

                    <h1>
                        Grow Your Business
                    </h1>

                    <p>
                        Join DQBooking and connect
                        with customers looking for
                        trusted event professionals.
                    </p>

                </div>

            </div>



            <div className="vendor-register-container">


                <div className="vendor-register-card">


                    <h2>
                        Become an DQBooking.com Vendor
                    </h2>


                    <p>
                        Create your vendor account
                        and start growing your business.
                    </p>



                    <form
                        onSubmit={
                            handleRegister
                        }
                    >


                        <h3>
                            Account Details
                        </h3>


                        <div className="form-group">

                            <label>
                                Full Name *
                            </label>

                            <input
                                type="text"
                                value={fullName}
                                onChange={
                                    (e) =>
                                        setFullName(
                                            e.target.value
                                        )
                                }
                                placeholder="Enter your full name"
                                required
                            />

                        </div>



                        <div className="form-group">

                            <label>
                                Email Address *
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={
                                    (e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                }
                                placeholder="Enter email"
                                required
                            />

                        </div>



                        <div className="form-group">

                            <label>
                                Phone Number *
                            </label>

                            <input
                                type="tel"
                                value={phone}
                                onChange={
                                    (e) =>
                                        setPhone(
                                            e.target.value
                                        )
                                }
                                placeholder="10 digit mobile number"
                                required
                            />

                        </div>



                        <div className="form-group">

                            <label>
                                Password *
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={
                                    (e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                }
                                placeholder="Minimum 8 characters"
                                required
                            />

                        </div>



                        <div className="form-group">

                            <label>
                                Confirm Password *
                            </label>

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={
                                    (e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                }
                                placeholder="Confirm password"
                                required
                            />

                        </div>



                        <hr />



                        <h3>
                            Business Details
                        </h3>



                        <div className="form-group">

                            <label>
                                Business Name *
                            </label>

                            <input
                                type="text"
                                value={businessName}
                                onChange={
                                    (e) =>
                                        setBusinessName(
                                            e.target.value
                                        )
                                }
                                placeholder="Enter business name"
                                required
                            />

                        </div>



                        <div className="form-group">

                            <label>
                                Owner Name *
                            </label>

                            <input
                                type="text"
                                value={ownerName}
                                onChange={
                                    (e) =>
                                        setOwnerName(
                                            e.target.value
                                        )
                                }
                                placeholder="Enter owner name"
                                required
                            />

                        </div>



                        <div className="form-group">

                            <label>
                                City *
                            </label>

                            <input
                                type="text"
                                value={city}
                                onChange={
                                    (e) =>
                                        setCity(
                                            e.target.value
                                        )
                                }
                                placeholder="Enter city"
                                required
                            />

                        </div>



                        <div className="form-group">

                            <label>
                                Address
                            </label>

                            <textarea
                                value={address}
                                onChange={
                                    (e) =>
                                        setAddress(
                                            e.target.value
                                        )
                                }
                                placeholder="Enter business address"
                            />

                        </div>



                        <div className="form-group">

                            <label>
                                Business Description
                            </label>

                            <textarea
                                value={description}
                                onChange={
                                    (e) =>
                                        setDescription(
                                            e.target.value
                                        )
                                }
                                placeholder="Tell customers about your business"
                                rows={4}
                            />

                        </div>



                        {
                            error && (

                                <p className="register-error">

                                    {error}

                                </p>

                            )
                        }



                        {
                            success && (

                                <p className="register-success">

                                    {success}

                                </p>

                            )
                        }



                        <button
                            className="primary-vendor-register"
                            type="submit"
                            disabled={loading}
                        >

                            {

                                loading

                                    ? "Creating Vendor Account..."

                                    : "Create Vendor Account"

                            }

                        </button>



                    </form>



                    <p className="vendor-login-link">

                        Already have an account?


                        <Link to="/login">

                            Login

                        </Link>

                    </p>



                    <p className="customer-register-link">

                        Looking to book event services?


                        <Link to="/register">

                            Register as Customer

                        </Link>

                    </p>


                </div>


            </div>


        </section>

    );

};


export default VendorRegister;