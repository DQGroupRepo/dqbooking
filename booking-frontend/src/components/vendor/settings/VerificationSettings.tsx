import { useEffect, useState } from "react";

import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import Input from "../../common/ui/Input/Input";
import Button from "../../common/ui/Button/Button";

import VendorProfileService from "../../../services/VendorProfileService";

import type {
    VendorProfile,
    VendorVerificationStatus
} from "../../../types/VendorProfile";

import toast from "react-hot-toast";


export default function VerificationSettings() {


    const [
        profile,
        setProfile
    ] =
        useState<VendorProfile>();


    useEffect(() => {

        loadProfile();

    }, []);


    async function loadProfile() {

        try {

            const data =
                await VendorProfileService
                    .getProfile();

            setProfile(data);

        } catch (error) {

            console.error(
                "Failed to load vendor profile:",
                error
            );

        }

    }


    function handleChange(

        e: React.ChangeEvent<HTMLInputElement>

    ) {

        if (!profile) {

            return;

        }


        setProfile({

            ...profile,

            [e.target.name]:
                e.target.value

        });

    }


    async function handleSave() {

        if (!profile) {

            return;

        }


        try {

            await VendorProfileService
                .updateProfile(
                    profile
                );


            toast.success(
                "Verification details updated."
            );

        } catch (error) {

            console.error(
                "Failed to update verification details:",
                error
            );


            toast.error(
                "Failed to update verification details."
            );

        }

    }


    /*
     * =========================================
     * VERIFICATION STATUS LABEL
     * =========================================
     */

    function getVerificationStatusLabel(

        status:
            VendorVerificationStatus

    ) {

        switch (status) {

            case "APPROVED":

                return "Approved";


            case "REJECTED":

                return "Rejected";


            case "SUSPENDED":

                return "Suspended";


            case "PENDING":

            default:

                return "Pending Approval";

        }

    }


    /*
     * =========================================
     * VERIFICATION STATUS CLASS
     * =========================================
     */

    function getVerificationStatusClass(

        status:
            VendorVerificationStatus

    ) {

        switch (status) {

            case "APPROVED":

                return
                    "verification-status-approved";


            case "REJECTED":

                return
                    "verification-status-rejected";


            case "SUSPENDED":

                return
                    "verification-status-suspended";


            case "PENDING":

            default:

                return
                    "verification-status-pending";

        }

    }


    if (!profile) {

        return (

            <h2>
                Loading...
            </h2>

        );

    }


    return (

        <>


            <SectionHeader

                title="Business Verification"

                subtitle="
                    Manage your legal business
                    information and verification details.
                "

            />


            <div className="settings-form">


                {/* =============================
                    BUSINESS DOCUMENT DETAILS
                ============================= */}

                <Input

                    name="gstNumber"

                    label="GST Number"

                    value={
                        profile.gstNumber
                    }

                    onChange={
                        handleChange
                    }

                />


                <Input

                    name="panNumber"

                    label="PAN Number"

                    value={
                        profile.panNumber
                    }

                    onChange={
                        handleChange
                    }

                />


                <Input

                    name="businessLicense"

                    label="Business License"

                    value={
                        profile.businessLicense
                    }

                    onChange={
                        handleChange
                    }

                />


                {/* =============================
                    VERIFICATION STATUS
                ============================= */}

                <div className="verification-status">


                    <label>

                        Verification Status

                    </label>


                    <span

                        className={
                            getVerificationStatusClass(

                                profile
                                    .verificationStatus

                            )
                        }

                    >

                        {
                            getVerificationStatusLabel(

                                profile
                                    .verificationStatus

                            )
                        }

                    </span>


                </div>


                {/* =============================
                    DOCUMENT UPLOADS
                ============================= */}

                <div className="document-upload-grid">


                    <div className="upload-card">


                        <label>

                            GST Certificate

                        </label>


                        <input

                            type="file"

                            accept="
                                .pdf,
                                .jpg,
                                .jpeg,
                                .png
                            "

                        />


                    </div>


                    <div className="upload-card">


                        <label>

                            PAN Card

                        </label>


                        <input

                            type="file"

                            accept="
                                .pdf,
                                .jpg,
                                .jpeg,
                                .png
                            "

                        />


                    </div>


                    <div className="upload-card">


                        <label>

                            Business License

                        </label>


                        <input

                            type="file"

                            accept="
                                .pdf,
                                .jpg,
                                .jpeg,
                                .png
                            "

                        />


                    </div>


                </div>


                {/* =============================
                    ACTIONS
                ============================= */}

                <div className="settings-actions">


                    <Button

                        onClick={
                            handleSave
                        }

                    >

                        Save Changes

                    </Button>


                </div>


            </div>

        </>

    );

}