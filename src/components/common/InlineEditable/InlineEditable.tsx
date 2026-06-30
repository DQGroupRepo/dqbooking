import { useEffect, useState } from "react";
import { FaPen, FaCheck, FaTimes } from "react-icons/fa";

import "./InlineEditable.css";

interface InlineEditableProps {

    value: string | number;

    type?: "text" | "number";

    multiline?: boolean;

    className?: string;

    onSave: (value: string) => void;

}

export default function InlineEditable({

    value,

    type = "text",

    multiline = false,

    className = "",

    onSave

}: InlineEditableProps) {

    const [editing, setEditing] = useState(false);

    const [currentValue, setCurrentValue] =
        useState(String(value));

    useEffect(() => {

        setCurrentValue(String(value));

    }, [value]);

    const save = () => {

        onSave(currentValue);

        setEditing(false);

    };

    const cancel = () => {

        setCurrentValue(String(value));

        setEditing(false);

    };

    if (!editing) {

        return (

            <div className={`inline-display ${className}`}>

                <span>{value}</span>

                <button

                    className="inline-edit-btn"

                    onClick={() => setEditing(true)}

                >

                    <FaPen />

                </button>

            </div>

        );

    }

    return (

        <div className="inline-editor">

            {

                multiline ?

                (

                    <textarea

                        value={currentValue}

                        onChange={(e) =>
                            setCurrentValue(e.target.value)
                        }

                        rows={5}

                    />

                )

                :

                (

                    <input

                        type={type}

                        value={currentValue}

                        onChange={(e) =>
                            setCurrentValue(e.target.value)
                        }

                    />

                )

            }

            <div className="inline-buttons">

                <button
                    className="save-inline"
                    onClick={save}
                >

                    <FaCheck />

                </button>

                <button
                    className="cancel-inline"
                    onClick={cancel}
                >

                    <FaTimes />

                </button>

            </div>

        </div>

    );

}