import Button from "../../../common/ui/Button/Button";

interface Props {
    publishing?: boolean;
    isEditMode?: boolean;
}

export default function FormActions({
    publishing,
    isEditMode = false,
}: Props) {
    return (
        <div className="form-actions">
            <Button type="submit" disabled={publishing}>
                {publishing
                    ? (isEditMode ? "Updating..." : "Publishing...")
                    : (isEditMode ? "Update Service" : "Publish Listing")}
            </Button>
        </div>
    );
}
