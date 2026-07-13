import "./ConfirmationModal.css";

import Button from "../Button/Button";

interface Props{

    isOpen:boolean;

    title:string;

    message:string;

    confirmText?:string;

    cancelText?:string;

    onConfirm:()=>void;

    onCancel:()=>void;

}

export default function ConfirmationModal({

    isOpen,

    title,

    message,

    confirmText="Confirm",

    cancelText="Cancel",

    onConfirm,

    onCancel

}:Props){

    if(!isOpen){

        return null;

    }

    return(

        <div className="confirmation-overlay">

            <div className="confirmation-modal">

                <h2>

                    {title}

                </h2>

                <p>

                    {message}

                </p>

                <div className="confirmation-actions">

                    <Button

                        variant="secondary"

                        onClick={onCancel}

                    >

                        {cancelText}

                    </Button>

                    <Button

                        variant="danger"

                        onClick={onConfirm}

                    >

                        {confirmText}

                    </Button>

                </div>

            </div>

        </div>

    );

}