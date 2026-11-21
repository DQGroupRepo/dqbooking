import { useEffect, useState } from "react";
import SectionHeader from "../../common/ui/SectionHeader/SectionHeader";
import Input from "../../common/ui/Input/Input";
import Button from "../../common/ui/Button/Button";
import Loader from "../../common/Loader";
import VendorProfileService from "../../../services/VendorProfileService";
import UploadService from "../../../services/UploadService";
import type { VendorProfile } from "../../../types/VendorProfile";
import toast from "react-hot-toast";
import SettingsImagePreview, { SettingsImageLightbox } from "./SettingsImagePreview";
import "./ApprovalPendingNotice.css";

type DocumentField = "gstCertificateUrl" | "panCardUrl" | "businessLicenseUrl";

const documents: { label: string; field: DocumentField; accept: string }[] = [
    { label: "GST Certificate", field: "gstCertificateUrl", accept: ".pdf,.jpg,.jpeg,.png" },
    { label: "PAN Card", field: "panCardUrl", accept: ".pdf,.jpg,.jpeg,.png" },
    { label: "Business License", field: "businessLicenseUrl", accept: ".pdf,.jpg,.jpeg,.png" }
];

function isImage(url: string) {
    const cleanUrl = url.split("?")[0].toLowerCase();
    return /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(cleanUrl);
}

function documentName(url: string) {
    try {
        return decodeURIComponent(new URL(url).pathname.split("/").pop() || "Uploaded document");
    } catch {
        return "Uploaded document";
    }
}

export default function VerificationSettings() {
    const [profile, setProfile] = useState<VendorProfile>();
    const [busy, setBusy] = useState<DocumentField | "save" | "">("");
    const [pendingCount, setPendingCount] = useState(0);
    const [pendingValues, setPendingValues] = useState<Record<string, string>>({});
    const [stagedDocuments, setStagedDocuments] = useState<Partial<Record<DocumentField, string>>>({});
    const [lightboxImage, setLightboxImage] = useState("");

    useEffect(() => {
        VendorProfileService.getProfile()
            .then(setProfile)
            .catch(() => toast.error("Unable to load verification details."));
        VendorProfileService.getMySettingsRequests()
            .then(records => {
                const items = records.flatMap(record => record.items || []).filter((item: any) => item.status === "PENDING");
                setPendingCount(items.length);
                const values: Record<string, string> = {};
                items.forEach((item: any) => { if ((item.oldValue ?? "") !== (item.proposedValue ?? "")) values[item.key] = item.proposedValue ?? ""; });
                setPendingValues(values);
            })
            .catch(() => undefined);
    }, []);

    function change(e: React.ChangeEvent<HTMLInputElement>) {
        if (profile) setProfile({ ...profile, [e.target.name]: e.target.value });
    }

    async function upload(field: DocumentField, file?: File) {
        if (!file || !profile) return;
        try {
            setBusy(field);
            const [url] = await UploadService.uploadImages([file]);
            if (!url) throw new Error("The upload did not return a file URL.");
            setStagedDocuments(current => ({ ...current, [field]: url }));
            toast.success("Document uploaded. Save Changes to submit it for Admin approval.");
        } catch {
            toast.error("Document upload failed.");
        } finally {
            setBusy("");
        }
    }

    async function save() {
        if (!profile) return;
        try {
            setBusy("save");
            await VendorProfileService.submitSettingsChanges({
                gstNumber: profile.gstNumber || "",
                panNumber: profile.panNumber || "",
                businessLicense: profile.businessLicense || "",
                ...Object.fromEntries(Object.entries(stagedDocuments).filter(([, value]) => !!value))
            });
            const pendingRecords = await VendorProfileService.getMySettingsRequests();
            const pendingItems = pendingRecords.flatMap(record => record.items || []).filter((item: any) => item.status === "PENDING");
            setPendingCount(pendingItems.length);
            const values: Record<string, string> = {};
            pendingItems.forEach((item: any) => { if ((item.oldValue ?? "") !== (item.proposedValue ?? "")) values[item.key] = item.proposedValue ?? ""; });
            setPendingValues(values);
            setStagedDocuments({});
            toast.success("Verification changes submitted for Admin approval. Your current approved details remain active until approval.");
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.response?.data?.error || "Failed to submit verification changes for approval.";
            toast.error(message, { duration: 6000 });
        } finally {
            setBusy("");
        }
    }

    function renderPendingNotice(key: string) {
        if (!(key in pendingValues)) return null;
        const value = pendingValues[key];
        const documentUrl = key.endsWith("Url");
        return <div className="approval-pending-notice" role="status"><strong>Admin approval pending.</strong>{" "}
            {documentUrl ? <>A replacement document has been submitted for review. {value && <button type="button" className="pending-document-view" onClick={() => setLightboxImage(value)}>View submitted document</button>}{" "}</> : <>Submitted value: {value || "—"}. </>}
            Your currently approved information remains active until Admin approval.
        </div>;
    }

    if (!profile) return <Loader />;

    return (
        <>
            <SectionHeader title="Business Verification" subtitle="Manage your legal business information and verification details." />
            <div className="settings-form">
                <p className="settings-approval-note">Changes to verification details and documents require Admin approval. Existing approved details remain active until approved.{pendingCount > 0 ? ` ${pendingCount} change item(s) are currently awaiting review.` : ""}</p>
                <Input name="gstNumber" label="GST Number" value={profile.gstNumber || ""} onChange={change} />
                {renderPendingNotice("gstNumber")}
                <Input name="panNumber" label="PAN Number" value={profile.panNumber || ""} onChange={change} />
                {renderPendingNotice("panNumber")}
                <Input name="businessLicense" label="Business License Number" value={profile.businessLicense || ""} onChange={change} />
                {renderPendingNotice("businessLicense")}

                <div className="verification-status">
                    <label>Verification Status</label>
                    <span className={profile.verificationStatus === "APPROVED" ? "verified-badge" : "pending-badge"}>
                        {(profile.verificationStatus || "PENDING").replace("_", " ")}
                    </span>
                </div>

                <div className="document-upload-grid">
                    {documents.map(doc => {
                        const url = profile[doc.field];
                        const proposedUrl = stagedDocuments[doc.field] || pendingValues[doc.field];
                        return (
                            <div className="upload-card" key={doc.field}>
                                <label>{doc.label}</label>
                                {url ? (
                                    <div className="uploaded-document">
                                        <div className="uploaded-document-link">
                                            {isImage(url) ? (
                                                <SettingsImagePreview src={url} alt={`${doc.label} approved document`} className="verification-document-thumbnail" onClick={() => setLightboxImage(url)} />
                                            ) : (
                                                <a href={url} target="_blank" rel="noopener noreferrer" className="verification-document-file">PDF</a>
                                            )}
                                            <span className="uploaded-document-name">{documentName(url)}</span>
                                            {!isImage(url) && <a href={url} target="_blank" rel="noopener noreferrer" className="uploaded-document-open">View uploaded document ↗</a>}
                                            {isImage(url) && <button type="button" className="uploaded-document-open" onClick={() => setLightboxImage(url)}>View uploaded document</button>}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="no-uploaded-document">No document uploaded yet.</p>
                                )}
                                <input
                                    type="file"
                                    accept={doc.accept}
                                    onChange={e => upload(doc.field, e.target.files?.[0])}
                                    disabled={busy === doc.field || busy === "save"}
                                />
                                {busy === doc.field && <small>Uploading...</small>}
                                {proposedUrl && <div className="approval-pending-notice" role="status"><strong>Admin approval pending.</strong> Proposed replacement: {documentName(proposedUrl)}. The approved document above remains active until approval. {isImage(proposedUrl) ? <button type="button" className="pending-document-view" onClick={() => setLightboxImage(proposedUrl)}>View submitted document</button> : <a href={proposedUrl} target="_blank" rel="noopener noreferrer">View submitted document</a>}</div>}
                                {url && <small className="document-replace-hint">Choose a file to replace the current document.</small>}
                            </div>
                        );
                    })}
                </div>

                <div className="settings-actions">
                    <Button onClick={save} disabled={busy !== ""}>
                        {busy === "save" ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
            {lightboxImage && <SettingsImageLightbox src={lightboxImage} alt="Verification document preview" onClose={() => setLightboxImage("")} />}
        </>
    );
}
