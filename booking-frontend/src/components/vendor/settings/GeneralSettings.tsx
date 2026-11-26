import Loader from "../../common/Loader";
import { useEffect, useState } from "react";
import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import Input from "../../common/ui/Input/Input";
import TextArea from "../../common/ui/TextArea/TextArea";
import Button from "../../common/ui/Button/Button";
import toast from "react-hot-toast";
import VendorProfileService from "../../../services/VendorProfileService";
import UploadService from "../../../services/UploadService";
import type { VendorProfile } from "../../../types/VendorProfile";
import "./GeneralSettings.css";
import SettingsImagePreview, { SettingsImageLightbox } from "./SettingsImagePreview";

export default function GeneralSettings() {
    const [profile, setProfile] = useState<VendorProfile>();
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [originalLogo, setOriginalLogo] = useState("");
    const [logoPending, setLogoPending] = useState(false);
    const [pendingLogoPreview, setPendingLogoPreview] = useState("");
    const [stagedLogo, setStagedLogo] = useState("");
    const [lightboxImage, setLightboxImage] = useState("");

    useEffect(() => {
        VendorProfileService.getProfile()
            .then(data => { setProfile(data); setOriginalLogo(data.logo || ""); })
            .catch(() => toast.error("Unable to load business profile."));
        VendorProfileService.getMySettingsRequests()
            .then(records => {
                const pendingLogo = records.flatMap(record => record.items || [])
                    .find((item: any) => item.key === "logo" && item.status === "PENDING");
                if (pendingLogo) {
                    setLogoPending(true);
                    setPendingLogoPreview(pendingLogo.proposedValue || "");
                }
            })
            .catch(() => undefined);
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if (profile) setProfile({ ...profile, [e.target.name]: e.target.value });
    }

    async function uploadLogo(file?: File) {
        if (!file || !profile) return;
        try {
            setUploading(true);
            const [url] = await UploadService.uploadImages([file]);
            if (!url) throw new Error("The upload did not return a file URL.");
            setStagedLogo(url);
            toast.success("Logo uploaded. Save changes to submit it for Admin approval.");
        } catch {
            toast.error("Logo upload failed.");
        } finally {
            setUploading(false);
        }
    }

    async function handleSave() {
        if (!profile) return;
        try {
            setSaving(true);
            const proposedLogo = stagedLogo === "__REMOVE__" ? "" : stagedLogo;
            const logoChanged = stagedLogo === "__REMOVE__" || (!!proposedLogo && proposedLogo !== originalLogo);
            // Never send the proposed logo through the immediate profile update.
            // The live profile must keep the currently approved logo until Admin approval.
            const updated = await VendorProfileService.updateProfile({ ...profile, logo: originalLogo });
            if (logoChanged) {
                await VendorProfileService.submitSettingsChanges({ logo: proposedLogo });
                setLogoPending(true);
                setPendingLogoPreview(proposedLogo);
                setStagedLogo("");
                toast.success("Business profile updated. Logo change submitted for Admin approval.");
            } else {
                toast.success("Profile updated successfully.");
            }
            setProfile({ ...updated, logo: originalLogo });
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.response?.data?.error || "Failed to update profile.";
            toast.error(message, { duration: 6000 });
        } finally {
            setSaving(false);
        }
    }

    if (!profile) return <Loader />;

    return (
        <>
            <SectionHeader title="General Settings" subtitle="Manage your business profile." />
            <div className="settings-form">
                <Input name="businessName" label="Business Name" value={profile.businessName || ""} onChange={handleChange} />
                <Input name="ownerName" label="Owner Name" value={profile.ownerName || ""} onChange={handleChange} />
                <Input name="email" label="Email" value={profile.email || ""} disabled />
                <Input name="phone" label="Phone" value={profile.phone || ""} onChange={handleChange} />
                <TextArea name="address" label="Business Address" value={profile.address || ""} onChange={handleChange} />
                <div className="settings-grid">
                    <Input name="city" label="City" value={profile.city || ""} onChange={handleChange} />
                    <Input name="state" label="State" value={profile.state || ""} onChange={handleChange} />
                </div>
                <div className="settings-grid">
                    <Input name="pincode" label="Pincode" value={profile.pincode || ""} onChange={handleChange} />
                    <TextArea name="description" label="Business Description" value={profile.description || ""} onChange={handleChange} />
                </div>
                <div className="logo-section">
                    <label>Business Logo</label>
                    <small className="settings-approval-note">Logo changes require Admin approval. The approved logo shown below remains active until the Admin approves a change.</small>
                    {originalLogo && (
                        <div className="business-logo-preview-wrap">
                            <SettingsImagePreview src={originalLogo} alt="Currently approved business logo" className="business-logo" onClick={() => setLightboxImage(originalLogo)} />
                            <button type="button" className="business-logo-remove-icon" onClick={() => setStagedLogo("__REMOVE__")} disabled={saving || uploading || logoPending} aria-label="Remove business logo" title="Remove logo">×</button>
                        </div>
                    )}
                    {stagedLogo && stagedLogo !== "__REMOVE__" && <div className="settings-pending-alert"><strong>New logo selected.</strong> The approved logo above remains active until Admin approval. <div className="pending-logo-preview"><span>Proposed logo:</span><SettingsImagePreview src={stagedLogo} alt="Proposed business logo" onClick={() => setLightboxImage(stagedLogo)} /></div></div>}
                    {stagedLogo === "__REMOVE__" && <div className="settings-pending-alert"><strong>Logo removal selected.</strong> The current approved logo remains active until Admin approval. Save Changes to submit removal.</div>}
                    {logoPending && <div className="settings-pending-alert" role="status">
                        <strong>Logo change awaiting Admin approval.</strong> Your current approved logo remains active on the dashboard until approval.
                        {pendingLogoPreview && <div className="pending-logo-preview"><span>Submitted logo preview:</span><img src={pendingLogoPreview} alt="Pending logo preview" /></div>}
                    </div>}
                    <input type="file" accept="image/*" onChange={e => uploadLogo(e.target.files?.[0])} disabled={uploading || logoPending} />
                    {uploading && <small>Uploading...</small>}
                    <small className="logo-help-text">Click the thumbnail to view the full-size image.</small>
                </div>
                <div className="settings-actions">
                    <Button onClick={handleSave} disabled={saving || uploading}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
            {lightboxImage && <SettingsImageLightbox src={lightboxImage} alt="Business logo preview" onClose={() => setLightboxImage("")} />}
        </>
    );
}
