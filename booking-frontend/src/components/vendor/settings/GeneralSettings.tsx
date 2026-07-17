import { useEffect, useState } from "react";

import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import Input from "../../common/ui/Input/Input";
import TextArea from "../../common/ui/TextArea/TextArea";
import Button from "../../common/ui/Button/Button";
import toast from "react-hot-toast";

import VendorProfileService from "../../../services/VendorProfileService";

import type { VendorProfile } from "../../../types/VendorProfile";

export default function GeneralSettings(){

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

        e:React.ChangeEvent<

            HTMLInputElement|

            HTMLTextAreaElement

        >

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

        toast.success("Profile updated successfully.");

    }

    if(!profile){

        return <h2>Loading...</h2>;

    }

    return(

        <>

            <SectionHeader

                title="General Settings"

                subtitle="Manage your business profile."

            />

            <div className="settings-form">

                <Input

                    name="businessName"

                    label="Business Name"

                    value={profile.businessName}

                    onChange={handleChange}

                />

                <Input

                    name="ownerName"

                    label="Owner Name"

                    value={profile.ownerName}

                    onChange={handleChange}

                />

                <Input

                    name="email"

                    label="Email"

                    value={profile.email}

                    onChange={handleChange}

                />

                <Input

                    name="phone"

                    label="Phone"

                    value={profile.phone}

                    onChange={handleChange}

                />

                                <TextArea

                                    name="address"

                                    label="Business Address"

                                    value={profile.address}

                                    onChange={handleChange}

                                />

                                <div className="settings-grid">

                                    <Input

                                        name="city"

                                        label="City"

                                        value={profile.city}

                                        onChange={handleChange}

                                    />

                                    <Input

                                        name="state"

                                        label="State"

                                        value={profile.state}

                                        onChange={handleChange}

                                    />

                                </div>

                                <div className="settings-grid">

                                    <Input

                                        name="pincode"

                                        label="Pincode"

                                        value={profile.pincode}

                                        onChange={handleChange}

                                    />

                                    <TextArea
                                        name="description"
                                        label="Business Description"
                                        value={profile.description}
                                        onChange={handleChange}
                                    />

                                    <div className="logo-section">

                                        <label>

                                            Business Logo

                                        </label>

                                        <img

                                            src={profile.logo}

                                            alt="Business Logo"

                                            className="business-logo"

                                        />

                                        <input

                                            type="file"

                                            accept="image/*"

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