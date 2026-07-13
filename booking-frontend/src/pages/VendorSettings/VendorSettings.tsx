import { useState } from "react";

import SettingsSidebar from "../../components/vendor/settings/SettingsSidebar";

import GeneralSettings from "../../components/vendor/settings/GeneralSettings";
import VerificationSettings from "../../components/vendor/settings/VerificationSettings";
import BankSettings from "../../components/vendor/settings/BankSettings";
import SecuritySettings from "../../components/vendor/settings/SecuritySettings";
import NotificationSettings from "../../components/vendor/settings/NotificationSettings";
import SubscriptionSettings from "../../components/vendor/settings/SubscriptionSettings";
import SupportSettings from "../../components/vendor/settings/SupportSettings";

import "./VendorSettings.css";

export default function VendorSettings(){

    const [

        selected,

        setSelected

    ] = useState("General");

    return(

        <section className="vendor-settings">

            <div className="settings-header">

                <h1>

                    Vendor Settings

                </h1>

                <p>

                    Manage your business preferences and account.

                </p>

            </div>

            <div className="settings-layout">

                <SettingsSidebar

                    selected={selected}

                    onSelect={setSelected}

                />

                <div className="settings-content">

                    {

                        selected==="General" &&

                        <GeneralSettings/>

                    }

                    {

                        selected==="Verification" &&

                        <VerificationSettings/>

                    }

                    {

                        selected==="Bank" &&

                        <BankSettings/>

                    }

                    {

                        selected==="Security" &&

                        <SecuritySettings/>

                    }

                    {

                        selected==="Notifications" &&

                        <NotificationSettings/>

                    }

                    {

                        selected==="Subscription" &&

                        <SubscriptionSettings/>

                    }

                    {

                        selected==="Support" &&

                        <SupportSettings/>

                    }

                </div>

            </div>

        </section>

    );

}