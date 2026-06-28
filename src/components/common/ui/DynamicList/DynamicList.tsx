import { FaPlus, FaTrash } from "react-icons/fa";
import styles from "./DynamicList.module.css";

interface Props {

    title: string;

    placeholder: string;

    values: string[];

    onChange: (values: string[]) => void;

}

export default function DynamicList({

    title,

    placeholder,

    values,

    onChange

}: Props) {

    const updateValue = (index: number, value: string) => {

        const updated = [...values];

        updated[index] = value;

        onChange(updated);

    };

    const addRow = () => {

        onChange([...values, ""]);

    };

    const removeRow = (index: number) => {

        const updated = values.filter((_, i) => i !== index);

        onChange(updated.length ? updated : [""]);

    };

    return (

        <div className={styles.container}>

            <h4>{title}</h4>

            {

                values.map((item, index) => (

                    <div

                        key={index}

                        className={styles.row}

                    >

                        <input

                            value={item}

                            placeholder={placeholder}

                            onChange={(e) =>

                                updateValue(index, e.target.value)

                            }

                        />

                        <button

                            type="button"

                            onClick={addRow}

                            className={styles.add}

                        >

                            <FaPlus />

                        </button>

                        <button

                            type="button"

                            onClick={() => removeRow(index)}

                            className={styles.remove}

                        >

                            <FaTrash />

                        </button>

                    </div>

                ))

            }

        </div>

    );

}