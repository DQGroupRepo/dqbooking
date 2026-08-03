import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../api/axiosConfig";
import { createBooking } from "../../services/bookingService";

import "./BookingCheckout.css";

interface VendorData {
  id: string;
  businessName: string;
  city?: string;
  imageUrl?: string;
  startingPrice?: number;
}

interface BookingLocationState {
  vendor: VendorData | null;
  serviceId?: string;
  eventDate: string;
  guests: number | string;
}

interface PricingHead {
  code: string;
  name: string;
  calculationType: "FIXED" | "PERCENTAGE" | string;
  value: number;
  calculatedAmount: number;
  displayOrder?: number;
  active?: boolean;
}

interface Discount {
  name: string;
  discountType: "FIXED" | "PERCENTAGE" | string;
  value: number;
  calculatedAmount: number;
}

interface PricingCalculationResult {
  pricingId: string;
  pricingVersion: number;

  baseAmount: number;

  pricingHeads: PricingHead[];

  subtotal: number;

  discounts: Discount[];

  discountAmount: number;

  totalAmount: number;

  advanceAmount: number;

  balanceAmount: number;
}

interface PricingApiResponse {
  data?: PricingCalculationResult;
  message?: string;
}

const BookingCheckout = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const state =
    location.state as BookingLocationState | null;

  const vendor = state?.vendor ?? null;

  const serviceId =
    state?.serviceId ?? "";

  const eventDate =
    state?.eventDate ?? "";

  const guests =
    state?.guests ?? "";

  const [eventType, setEventType] =
    useState("");

  const [specialRequest, setSpecialRequest] =
    useState("");

  const [
    paymentPreference,
    setPaymentPreference
  ] = useState(
    "PAY_AFTER_CONFIRMATION"
  );

  const [
    pricing,
    setPricing
  ] = useState<PricingCalculationResult | null>(
    null
  );

  const [
    pricingLoading,
    setPricingLoading
  ] = useState(true);

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    error,
    setError
  ] = useState<string | null>(null);


  /*
   * =========================================
   * FORMAT CURRENCY
   * =========================================
   */

  const formatCurrency = (
    amount: number | null | undefined
  ) => {

    return `₹${(
      amount ?? 0
    ).toLocaleString("en-IN")}`;

  };


  /*
   * =========================================
   * LOAD PRICING
   * =========================================
   */

  useEffect(() => {

    if (!serviceId || !eventDate) {

      setPricingLoading(false);

      return;

    }


    const loadPricing = async () => {

      try {

        setPricingLoading(true);

        setError(null);


        /*
         * Expected backend endpoint:
         *
         * GET
         * /api/pricing/calculate
         *
         * Query params:
         * serviceId
         * eventDate
         */

        const response =
            await api.get<PricingCalculationResult>(
                `/pricing/services/${serviceId}/calculate`,
                {
                    params: {
                        eventDate
                    }
                }
            );


        setPricing(
          response.data
        );


      } catch (err: any) {

        console.error(
          "Failed to load pricing:",
          err
        );


        const message =
          err?.response?.data?.message ||
          "Unable to load current pricing for this service.";


        setError(message);


        toast.error(
          message
        );


      } finally {

        setPricingLoading(false);

      }

    };


    loadPricing();

  }, [
    serviceId,
    eventDate
  ]);


  /*
   * =========================================
   * PAYMENT PREFERENCE
   * =========================================
   *
   * This is currently UI-only.
   *
   * Your current CreateBookingRequest
   * does not contain paymentPreference.
   *
   * Once payment flow is implemented,
   * this can be connected to the backend.
   */

  const paymentMessage =
    useMemo(() => {

      switch (
        paymentPreference
      ) {

        case "ADVANCE_PAYMENT":

          return "Advance payment will be required according to the vendor's payment configuration.";

        case "DISCUSS_WITH_VENDOR":

          return "You can discuss payment terms directly with the vendor.";

        default:

          return "Payment will be handled after vendor confirmation.";

      }

    }, [
      paymentPreference
    ]);


  /*
   * =========================================
   * VALIDATION
   * =========================================
   */

  if (!vendor) {

    return (

      <section className="checkout-section">

        <div className="container">

          <h2>
            Booking information not found.
          </h2>

          <button
            className="cancel-button"
            onClick={() =>
              navigate("/")
            }
          >
            Go To Home
          </button>

        </div>

      </section>

    );

  }


  if (!serviceId) {

    return (

      <section className="checkout-section">

        <div className="container">

          <h2>
            Service information is missing.
          </h2>

          <p>
            Please return to the vendor page
            and select a service again.
          </p>

          <button
            className="cancel-button"
            onClick={() =>
              navigate(-1)
            }
          >
            ← Back To Vendor
          </button>

        </div>

      </section>

    );

  }


  /*
   * =========================================
   * SUBMIT BOOKING
   * =========================================
   */

  const handleSubmit = async () => {

    if (submitting) {

      return;

    }


    if (!eventDate) {

      toast.error(
        "Please select an event date."
      );

      return;

    }


    if (!guests || Number(guests) < 1) {

      toast.error(
        "Please enter a valid guest count."
      );

      return;

    }


    if (!eventType.trim()) {

      toast.error(
        "Please enter the event type."
      );

      return;

    }


    try {

      setSubmitting(true);


      /*
       * IMPORTANT:
       *
       * Backend expects:
       *
       * serviceId
       * eventDate
       * guestCount
       * specialRequest
       * eventType
       *
       * Customer information is obtained
       * from the authenticated JWT user.
       */

      const bookingRequest = {

        serviceId,

        eventDate,

        guestCount:
          Number(guests),

        specialRequest:
          specialRequest.trim(),

        eventType:
          eventType.trim()

      };


      console.log(
        "Creating booking:",
        bookingRequest
      );


      const booking =
        await createBooking(
          bookingRequest
        );


      toast.success(
        `Booking request ${booking.bookingNumber} submitted successfully!`
      );


      /*
       * Navigate to booking confirmation.
       *
       * If this route does not exist yet,
       * temporarily change this to:
       *
       * navigate("/customer-dashboard");
       */

      navigate(
        `/booking-confirmation/${booking.id}`,
        {
          state: {
            booking
          }
        }
      );


    } catch (err: any) {

      console.error(
        "Booking creation failed:",
        err
      );


      const message =
        err?.response?.data?.message ||
        "Unable to submit booking request. Please try again.";


      toast.error(
        message
      );


    } finally {

      setSubmitting(false);

    }

  };


  /*
   * =========================================
   * PRICING DATA
   * =========================================
   */

  const baseAmount =
    pricing?.baseAmount ?? 0;

  const pricingHeads =
    pricing?.pricingHeads ?? [];

  const discounts =
    pricing?.discounts ?? [];

  const subtotal =
    pricing?.subtotal ?? 0;

  const discountAmount =
    pricing?.discountAmount ?? 0;

  const totalAmount =
    pricing?.totalAmount ?? 0;

  const advanceAmount =
    pricing?.advanceAmount ?? 0;

  const balanceAmount =
    pricing?.balanceAmount ?? 0;


  return (

    <section className="checkout-section">

      <div className="container">

        <h1>
          Complete Your Booking
        </h1>

        <p className="checkout-subtitle">

          Review your event details and
          submit your booking request.

        </p>


        <div className="checkout-layout">


          {/* =================================
              LEFT SIDE
          ================================= */}

          <div className="checkout-main">


            {/* BOOKING SUMMARY */}

            <div className="checkout-card">

              <h2>
                Booking Summary
              </h2>


              <div className="booking-summary-grid">


                <div className="summary-item">

                  <label>
                    Vendor
                  </label>

                  <p>
                    {vendor.businessName}
                  </p>

                </div>


                <div className="summary-item">

                  <label>
                    Event Date
                  </label>

                  <p>
                    {eventDate ||
                      "Not Selected"}
                  </p>

                </div>


                <div className="summary-item">

                  <label>
                    Guests
                  </label>

                  <p>
                    {guests}
                  </p>

                </div>


                <div className="summary-item">

                  <label>
                    Location
                  </label>

                  <p>
                    {vendor.city ||
                      "Not Available"}
                  </p>

                </div>


              </div>


              <button
                className="save-button"
                onClick={() =>
                  navigate(-1)
                }
              >
                Modify Booking
              </button>

            </div>


            {/* EVENT INFORMATION */}

            <div className="checkout-card">

              <h2>
                Event Information
              </h2>


              <div className="form-group">

                <label>
                  Event Type
                </label>

                <input
                  type="text"
                  value={eventType}
                  onChange={(e) =>
                    setEventType(
                      e.target.value
                    )
                  }
                  placeholder="Wedding, Birthday, Corporate Event..."
                />

              </div>


              <div className="form-group">

                <label>
                  Special Request
                </label>

                <textarea
                  rows={4}
                  value={
                    specialRequest
                  }
                  onChange={(e) =>
                    setSpecialRequest(
                      e.target.value
                    )
                  }
                  placeholder="Add any special requirements or instructions for the vendor..."
                />

              </div>

            </div>


            {/* PAYMENT PREFERENCE */}

            <div className="checkout-card">

              <h2>
                Payment Preference
              </h2>


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
                    setPaymentPreference(
                      e.target.value
                    )
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
                    setPaymentPreference(
                      e.target.value
                    )
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
                    setPaymentPreference(
                      e.target.value
                    )
                  }
                />

                Discuss With Vendor

              </label>


              <p className="payment-message">

                {paymentMessage}

              </p>

            </div>


          </div>


          {/* =================================
              RIGHT SIDE
          ================================= */}

          <div className="checkout-sidebar">


            <div className="booking-summary">


              {vendor.imageUrl && (

                <img
                  src={
                    vendor.imageUrl
                  }
                  alt={
                    vendor.businessName
                  }
                />

              )}


              <h3>
                {vendor.businessName}
              </h3>


              <p>
                📍 {vendor.city}
              </p>


              <hr />


              {/* PRICING LOADING */}

              {pricingLoading && (

                <div className="pricing-loading">

                  Loading current pricing...

                </div>

              )}


              {/* PRICING ERROR */}

              {!pricingLoading &&
                error && (

                  <div className="pricing-error">

                    <p>
                      {error}
                    </p>

                    <button
                      className="save-button"
                      onClick={() =>
                        window.location.reload()
                      }
                    >
                      Retry
                    </button>

                  </div>

                )}


              {/* PRICING */}

              {!pricingLoading &&
                !error &&
                pricing && (

                  <>


                    {/* BASE AMOUNT */}

                    <div className="summary-row">

                      <span>
                        Base Amount
                      </span>

                      <strong>
                        {formatCurrency(
                          baseAmount
                        )}
                      </strong>

                    </div>


                    {/* CONFIGURABLE PRICING HEADS */}

                    {pricingHeads.map(
                      (head) => (

                        <div
                          className="summary-row"
                          key={
                            head.code
                          }
                        >

                          <span>
                            {head.name}
                          </span>

                          <strong>
                            {formatCurrency(
                              head.calculatedAmount
                            )}
                          </strong>

                        </div>

                      )
                    )}


                    <hr />


                    {/* SUBTOTAL */}

                    <div className="summary-row">

                      <span>
                        Subtotal
                      </span>

                      <strong>
                        {formatCurrency(
                          subtotal
                        )}
                      </strong>

                    </div>


                    {/* DISCOUNTS */}

                    {discounts.map(
                      (
                        discount,
                        index
                      ) => (

                        <div
                          className="summary-row discount-row"
                          key={`${discount.name}-${index}`}
                        >

                          <span>
                            {discount.name}
                          </span>

                          <strong>
                            -
                            {formatCurrency(
                              discount.calculatedAmount
                            )}
                          </strong>

                        </div>

                      )
                    )}


                    {discountAmount > 0 && (

                      <div
                        className="summary-row discount-row"
                      >

                        <span>
                          Total Discount
                        </span>

                        <strong>
                          -
                          {formatCurrency(
                            discountAmount
                          )}
                        </strong>

                      </div>

                    )}


                    <hr />


                    {/* TOTAL */}

                    <div
                      className="summary-row total"
                    >

                      <span>
                        Total Estimate
                      </span>

                      <strong>
                        {formatCurrency(
                          totalAmount
                        )}
                      </strong>

                    </div>


                    {/* ADVANCE */}

                    {advanceAmount > 0 && (

                      <div
                        className="summary-row"
                      >

                        <span>
                          Advance Required
                        </span>

                        <strong>
                          {formatCurrency(
                            advanceAmount
                          )}
                        </strong>

                      </div>

                    )}


                    {/* BALANCE */}

                    {advanceAmount > 0 && (

                      <div
                        className="summary-row"
                      >

                        <span>
                          Balance After Advance
                        </span>

                        <strong>
                          {formatCurrency(
                            balanceAmount
                          )}
                        </strong>

                      </div>

                    )}


                  </>

                )}


              {/* ACTIONS */}

              <div className="checkout-actions">


                <button
                  className="cancel-button"
                  onClick={() =>
                    navigate(-1)
                  }
                  disabled={submitting}
                >
                  ← Back To Vendor
                </button>


                <button
                  className="save-button"
                  disabled={submitting}
                  onClick={() =>
                    toast(
                      "Save For Later will be implemented with the customer booking module."
                    )
                  }
                >
                  Save For Later
                </button>


                <button
                  className="book-button"
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    submitting ||
                    pricingLoading ||
                    !pricing ||
                    !!error
                  }
                >

                  {submitting
                    ? "Submitting..."
                    : "Send Booking Request"}

                </button>


              </div>


              <div className="booking-note">

                ✓ No payment is processed
                when sending the booking request.

              </div>


            </div>

          </div>


        </div>

      </div>

    </section>

  );

};

export default BookingCheckout;