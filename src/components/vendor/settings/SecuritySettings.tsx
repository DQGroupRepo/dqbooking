import { useState } from "react";

import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import Input from "../../common/ui/Input/Input";
import Button from "../../common/ui/Button/Button";

export default function SecuritySettings(){

    const [currentPassword,setCurrentPassword]=useState("");

    const [newPassword,setNewPassword]=useState("");

    const [confirmPassword,setConfirmPassword]=useState("");

    const handleSave=()=>{

        if(newPassword!==confirmPassword){

            alert("Passwords do not match.");

            return;

        }

        alert("Password updated successfully.");

        setCurrentPassword("");

        setNewPassword("");

        setConfirmPassword("");

    };

    return(

        <>

            <SectionHeader

                title="Security"

                subtitle="Update your account password."

            />

            <div className="settings-form">

                <Input

                    name="currentPassword"

                    label="Current Password"

                    type="password"

                    value={currentPassword}

                    onChange={(e)=>

                        setCurrentPassword(

                            e.target.value

                        )

                    }

                />

                <Input

                    name="newPassword"

                    label="New Password"

                    type="password"

                    value={newPassword}

                    onChange={(e)=>

                        setNewPassword(

                            e.target.value

                        )

                    }

                />

                <Input

                    name="confirmPassword"

                    label="Confirm Password"

                    type="password"

                    value={confirmPassword}

                    onChange={(e)=>

                        setConfirmPassword(

                            e.target.value

                        )

                    }

                />
                                <div className="password-guidelines">

                                    <h3>

                                        Password Requirements

                                    </h3>

                                    <ul>

                                        <li>

                                            Minimum 8 characters

                                        </li>

                                        <li>

                                            At least one uppercase letter

                                        </li>

                                        <li>

                                            At least one lowercase letter

                                        </li>

                                        <li>

                                            At least one number

                                        </li>

                                        <li>

                                            At least one special character

                                        </li>

                                    </ul>

                                </div>

                                <div className="two-factor-card">

                                    <h3>

                                        Two-Factor Authentication

                                    </h3>

                                    <p>

                                        Coming soon. Enable an extra layer of security for your account.

                                    </p>

                                </div>

                                <div className="settings-actions">

                                    <Button

                                        onClick={handleSave}

                                    >

                                        Change Password

                                    </Button>

                                </div>

                            </div>

                        </>

                    );

                }