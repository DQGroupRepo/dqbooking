import { useEffect, useState } from "react";

import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import Button from "../../common/ui/Button/Button";
import toast from "react-hot-toast";

import VendorProfileService from "../../../services/VendorProfileService";

import type { VendorProfile } from "../../../types/VendorProfile";

export default function NotificationSettings(){

    const [profile,setProfile]=useState<VendorProfile>();

    useEffect(()=>{

        loadProfile();

    },[]);

    async function loadProfile(){

        const data=

            await VendorProfileService.getProfile();

        setProfile(data);

    }

    function toggle(

        field:keyof VendorProfile

    ){

        if(!profile) return;

        setProfile({

            ...profile,

            [field]:!profile[field]

        });

    }

    async function handleSave(){

        if(!profile) return;

        await VendorProfileService.updateProfile(profile);

        toast.success("Notification preferences updated.");

    }

    if(!profile){

        return <h2>Loading...</h2>;

    }

    return(

        <>

            <SectionHeader

                title="Notifications"

                subtitle="Choose how you'd like to receive updates."

            />

            <div className="notification-list">

                <div className="notification-item">

                    <div>

                        <h3>Email Notifications</h3>

                        <p>

                            Receive important updates via email.

                        </p>

                    </div>

                    <label className="switch">

                        <input

                            type="checkbox"

                            checked={profile.emailNotifications}

                            onChange={()=>toggle("emailNotifications")}

                        />

                        <span className="slider"></span>

                    </label>

                </div>

                <div className="notification-item">

                    <div>

                        <h3>SMS Notifications</h3>

                        <p>

                            Receive SMS alerts.

                        </p>

                    </div>

                    <label className="switch">

                        <input

                            type="checkbox"

                            checked={profile.smsNotifications}

                            onChange={()=>toggle("smsNotifications")}

                        />

                        <span className="slider"></span>

                    </label>

                </div>

                <div className="notification-item">

                    <div>

                        <h3>Booking Alerts</h3>

                        <p>

                            Notify when a new booking is received.

                        </p>

                    </div>

                    <label className="switch">

                        <input

                            type="checkbox"

                            checked={profile.bookingAlerts}

                            onChange={()=>toggle("bookingAlerts")}

                        />

                        <span className="slider"></span>

                    </label>

                </div>
                                <div className="notification-item">

                                    <div>

                                        <h3>Review Alerts</h3>

                                        <p>

                                            Get notified whenever customers leave reviews.

                                        </p>

                                    </div>

                                    <label className="switch">

                                        <input

                                            type="checkbox"

                                            checked={profile.reviewAlerts}

                                            onChange={()=>toggle("reviewAlerts")}

                                        />

                                        <span className="slider"></span>

                                    </label>

                                </div>

                                <div className="notification-item">

                                    <div>

                                        <h3>Payment Alerts</h3>

                                        <p>

                                            Receive notifications for payments and payouts.

                                        </p>

                                    </div>

                                    <label className="switch">

                                        <input

                                            type="checkbox"

                                            checked={profile.paymentAlerts}

                                            onChange={()=>toggle("paymentAlerts")}

                                        />

                                        <span className="slider"></span>

                                    </label>

                                </div>

                                <div className="notification-item">

                                    <div>

                                        <h3>Marketing Emails</h3>

                                        <p>

                                            Receive product updates, offers and promotions.

                                        </p>

                                    </div>

                                    <label className="switch">

                                        <input

                                            type="checkbox"

                                            checked={profile.marketingEmails}

                                            onChange={()=>toggle("marketingEmails")}

                                        />

                                        <span className="slider"></span>

                                    </label>

                                </div>

                                <div className="settings-actions">

                                    <Button

                                        onClick={handleSave}

                                    >

                                        Save Changes

                                    </Button>

                                </div>

                            </div>

                        </>

                    );

                }