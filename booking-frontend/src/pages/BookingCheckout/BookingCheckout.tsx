import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./BookingCheckout.css";

const BookingCheckout = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const {
    vendor,
    eventDate,
    guests
  } = location.state || {
    vendor: null,
    eventDate: "",
    guests: ""
  };

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [paymentPreference, setPaymentPreference] =
    useState("PAY_AFTER_CONFIRMATION");

  if (!vendor) {
    return <h2>Booking information not found.</h2>;
  }

  const venuePrice = vendor.startingPrice;
  const decoration = 10000;
  const serviceCharges = 2500;

  const gst = Math.round(
    (venuePrice + decoration + serviceCharges) * 0.18
  );

  const total =
    venuePrice +
    decoration +
    serviceCharges +
    gst;

  const handleSubmit = () => {

    const bookingRequest = {
      vendorId: vendor.id,
      eventDate,
      guests,
      fullName,
      mobileNumber,
      email,
      address,
      paymentPreference
    };

    console.log("Booking Request", bookingRequest);
    toast.success("Booking request submitted successfully!");
  };

  return (
    <section className="checkout-section">

      <div className="container">

        <h1>
          Complete Your Booking
        </h1>

        <p className="checkout-subtitle">
          Review your event details before sending the booking request.
        </p>

        <div className="checkout-layout">

          {/* Left Side */}
          <div className="checkout-main">

            <div className="checkout-card">

              <h2>Booking Summary</h2>

              <div className="booking-summary-grid">

                <div className="summary-item">
                  <label>Event Date</label>
                  <p>{eventDate || "Not Selected"}</p>
                </div>

                <div className="summary-item">
                  <label>Guests</label>
                  <p>{guests}</p>
                </div>

              </div>

              <button
                className="save-button"
                onClick={() => navigate(-1)}
              >
                Modify Booking
              </button>

            </div>

            <div className="checkout-card">

              <h2>Contact Information</h2>

              <div className="two-column">

                <div className="form-group">

                  <label>Full Name</label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    placeholder="Enter Full Name"
                  />

                </div>

                <div className="form-group">

                  <label>Mobile Number</label>

                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(e.target.value)
                    }
                    placeholder="9876543210"
                  />

                </div>

              </div>

              <div className="form-group">

                <label>Email Address</label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="your@email.com"
                />

              </div>

              <div className="form-group">

                <label>Address</label>

                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  placeholder="Enter your address"
                />

              </div>

            </div>

            <div className="checkout-card">

              <h2>Payment Preference</h2>

              <label className="radio-option">

                <input
                  type="radio"
                  name="payment"
                  value="ADVANCE_PAYMENT"
                  checked={
                    paymentPreference ===
                    "ADVANCE_PAYMENT"
                  }
                  onChange={(e) =>
                    setPaymentPreference(e.target.value)
                  }
                />

                Pay Advance Now

              </label>

              <label className="radio-option">

                <input
                  type="radio"
                  name="payment"
                  value="PAY_AFTER_CONFIRMATION"
                  checked={
                    paymentPreference ===
                    "PAY_AFTER_CONFIRMATION"
                  }
                  onChange={(e) =>
                    setPaymentPreference(e.target.value)
                  }
                />

                Pay After Vendor Confirmation

              </label>

              <label className="radio-option">

                <input
                  type="radio"
                  name="payment"
                  value="DISCUSS_WITH_VENDOR"
                  checked={
                    paymentPreference ===
                    "DISCUSS_WITH_VENDOR"
                  }
                  onChange={(e) =>
                    setPaymentPreference(e.target.value)
                  }
                />

                Discuss With Vendor

              </label>

            </div>

          </div>

          {/* Right Side */}
          <div className="checkout-sidebar">

            <div className="booking-summary">

              <img
                src={vendor.imageUrl}
                alt={vendor.businessName}
              />

              <h3>
                {vendor.businessName}
              </h3>

              <p>
                📍 {vendor.city}
              </p>

              <hr />

              <div className="summary-row">
                <span>Venue Price</span>
                <strong>
                  ₹{venuePrice.toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="summary-row">
                <span>Decoration</span>
                <strong>₹10,000</strong>
              </div>

              <div className="summary-row">
                <span>Service Charges</span>
                <strong>₹2,500</strong>
              </div>

              <div className="summary-row">
                <span>GST</span>
                <strong>
                  ₹{gst.toLocaleString("en-IN")}
                </strong>
              </div>

              <hr />

              <div className="summary-row total">

                <span>Total Estimate</span>

                <strong>
                  ₹{total.toLocaleString("en-IN")}
                </strong>

              </div>

              <div className="checkout-actions">

                <button
                  className="cancel-button"
                  onClick={() => navigate(-1)}
                >
                  ← Back To Vendor
                </button>

                <button className="save-button">
                  Save For Later
                </button>

                <button
                  className="book-button"
                  onClick={handleSubmit}
                >
                  Send Booking Request
                </button>

              </div>

              <div className="booking-note">
                ✓ No payment required to send request
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default BookingCheckout;