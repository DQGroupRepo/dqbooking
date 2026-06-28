import styles from "./CheckboxGroup.module.css";

interface CheckboxOption {

    label: string;

    value: string;

}

interface Props {

    title?: string;

    options: CheckboxOption[];

    values: Record<string, boolean>;

    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

}

export default function CheckboxGroup({

    title,

    options,

    values,

    onChange

}: Props) {

    return (

        <div className={styles.container}>

            {title && (

                <h4 className={styles.title}>

                    {title}

                </h4>

            )}

            <div className={styles.grid}>

                {

                    options.map(option => (

                        <label

                            key={option.value}

                            className={styles.item}

                        >

                            <input

                                type="checkbox"

                                name={option.value}

                                checked={values[option.value] || false}

                                onChange={onChange}

                            />

                            <span>

                                {option.label}

                            </span>

                        </label>

                    ))

                }

            </div>

        </div>

    );

}