import { useEffect, useState } from "react";

import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import Input from "../../common/ui/Input/Input";
import Button from "../../common/ui/Button/Button";
import toast from "react-hot-toast";

import VendorProfileService from "../../../services/VendorProfileService";

import type { VendorProfile } from "../../../types/VendorProfile";

export default function BankSettings(){

    const [profile,setProfile]=useState<VendorProfile>();

    const [payoutMethod,setPayoutMethod]=useState("Bank Transfer");

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

        toast.success("Bank details updated.");

    }

    if(!profile){

        return <h2>Loading...</h2>;

    }

    return(

        <>

            <SectionHeader

                title="Bank & Payout"

                subtitle="Manage your payment and payout details."

            />

            <div className="settings-form">

                <Input

                    name="accountHolder"

                    label="Account Holder"

                    value={profile.accountHolder}

                    onChange={handleChange}

                />

                <Input

                    name="bankName"

                    label="Bank Name"

                    value={profile.bankName}

                    onChange={handleChange}

                />

                <Input

                    name="accountNumber"

                    label="Account Number"

                    value={profile.accountNumber}

                    onChange={handleChange}

                />

                <Input

                    name="ifsc"

                    label="IFSC Code"

                    value={profile.ifsc}

                    onChange={handleChange}

                />
                                <Input

                                    name="upiId"

                                    label="UPI ID"

                                    value={profile.upiId}

                                    onChange={handleChange}

                                />

                                <div className="form-group">

                                    <label>

                                        Primary Payout Method

                                    </label>

                                    <select

                                        className="settings-select"

                                        value={payoutMethod}

                                        onChange={(e)=>

                                            setPayoutMethod(

                                                e.target.value

                                            )

                                        }

                                    >

                                        <option>

                                            Bank Transfer

                                        </option>

                                        <option>

                                            UPI

                                        </option>

                                    </select>

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