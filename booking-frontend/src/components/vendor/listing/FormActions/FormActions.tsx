import Button from "../../../common/ui/Button/Button";
interface Props{

    onSaveDraft?:()=>void;
    publishing?:boolean;
    isEditMode?: boolean;

}

export default function FormActions({

    onSaveDraft,

    publishing,

    isEditMode = false

}: Props) {

    return(

        <div className="form-actions">

            <Button

                variant="secondary"

                type="button"

                onClick={onSaveDraft}

            >

                Save Draft

            </Button>

            <Button

                type="submit"

                disabled={publishing}

            >

                {

                    publishing

                        ? (isEditMode ? "Updating..." : "Publishing...")

                        : (isEditMode ? "Update Service" : "Publish Listing")

                }

            </Button>

        </div>

    );

}