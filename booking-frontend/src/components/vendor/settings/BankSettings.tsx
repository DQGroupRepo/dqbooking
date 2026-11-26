import Loader from "../../common/Loader";
import { useEffect, useState } from "react";

import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import Input from "../../common/ui/Input/Input";
import Button from "../../common/ui/Button/Button";
import toast from "react-hot-toast";

import VendorProfileService from "../../../services/VendorProfileService";

import type { VendorProfile } from "../../../types/VendorProfile";

export default function BankSettings(){

    const [profile,setProfile]=useState<VendorProfile>();
    const [pendingCount,setPendingCount]=useState(0);



    useEffect(()=>{

        loadProfile();

    },[]);

    async function loadProfile(){

        const data=

            await VendorProfileService.getProfile();

        setProfile(data);
        const records = await VendorProfileService.getMySettingsRequests();
        setPendingCount(records.reduce((count, record) => count + (record.items || []).filter((item: any) => item.status === "PENDING").length, 0));

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

        try {
            await VendorProfileService.submitSettingsChanges({
                accountHolder: profile.accountHolder || "",
                bankName: profile.bankName || "",
                accountNumber: profile.accountNumber || "",
                ifsc: profile.ifsc || "",
                upiId: profile.upiId || "",
                payoutMethod: profile.payoutMethod || ""
            });

            const pendingRecords = await VendorProfileService.getMySettingsRequests();
            setPendingCount(pendingRecords.reduce((count, record) => count + (record.items || []).filter((item: any) => item.status === "PENDING").length, 0));
            toast.success("Bank and payout changes submitted for Admin approval. Current approved details remain active until approval.");
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.response?.data?.error || "Failed to submit bank and payout changes for approval.";
            toast.error(message, { duration: 6000 });
        }

    }

    if(!profile){

        return <Loader />;

    }

    return(

        <>

            <SectionHeader

                title="Bank & Payout"

                subtitle="Manage your payment and payout details."

            />

            <div className="settings-form">
                <p className="settings-approval-note">Bank and payout details are reviewed together as one group. Existing approved details remain active until Admin approval.{pendingCount > 0 ? ` ${pendingCount} change item(s) are currently awaiting review.` : ""}</p>

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

                                        value={profile.payoutMethod || "Bank Transfer"}

                                        onChange={(e)=>

                                            setProfile({...profile,payoutMethod:e.target.value})

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
