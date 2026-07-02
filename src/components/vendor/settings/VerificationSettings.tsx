import { useEffect, useState } from "react";

import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import Input from "../../common/ui/Input/Input";
import Button from "../../common/ui/Button/Button";

import VendorProfileService from "../../../services/VendorProfileService";

import type { VendorProfile } from "../../../types/VendorProfile";

export default function VerificationSettings(){

    const [profile,setProfile]=useState<VendorProfile>();

    useEffect(()=>{

        loadProfile();

    },[]);

    async function loadProfile(){

        const data=

            await VendorProfileService.getProfile();

        setProfile(data);

    }

    function handleChange(

        e:React.ChangeEvent<HTMLInputElement>

    ){

        if(!profile) return;

        setProfile({

            ...profile,

            [e.target.name]:e.target.value

        });

    }

    async function handleSave(){

        if(!profile) return;

        await VendorProfileService.updateProfile(profile);

        alert("Verification details updated.");

    }

    if(!profile){

        return <h2>Loading...</h2>;

    }

    return(

        <>

            <SectionHeader

                title="Business Verification"

                subtitle="Manage your legal business information."

            />

            <div className="settings-form">

                <Input

                    name="gstNumber"

                    label="GST Number"

                    value={profile.gstNumber}

                    onChange={handleChange}

                />

                <Input

                    name="panNumber"

                    label="PAN Number"

                    value={profile.panNumber}

                    onChange={handleChange}

                />

                <Input

                    name="businessLicense"

                    label="Business License"

                    value={profile.businessLicense}

                    onChange={handleChange}

                />
                                <div className="verification-status">

                                    <label>

                                        Verification Status

                                    </label>

                                    <span
                                        className={
                                            profile.verificationStatus === "Verified"
                                                ? "verified-badge"
                                                : "pending-badge"
                                        }
                                    >

                                        {profile.verificationStatus}

                                    </span>

                                </div>

                                <div className="document-upload-grid">

                                    <div className="upload-card">

                                        <label>

                                            GST Certificate

                                        </label>

                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />

                                    </div>

                                    <div className="upload-card">

                                        <label>

                                            PAN Card

                                        </label>

                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />

                                    </div>

                                    <div className="upload-card">

                                        <label>

                                            Business License

                                        </label>

                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />

                                    </div>

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