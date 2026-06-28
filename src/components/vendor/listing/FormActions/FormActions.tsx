import Button from "../../../common/ui/Button/Button";

interface Props{

    onSaveDraft?:()=>void;

    publishing?:boolean;

}

export default function FormActions({

    onSaveDraft,

    publishing

}:Props){

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

                    ?

                    "Publishing..."

                    :

                    "Publish Listing"

                }

            </Button>

        </div>

    );

}