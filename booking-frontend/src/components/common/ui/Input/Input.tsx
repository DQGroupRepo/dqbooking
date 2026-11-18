import NumericInput from "../NumericInput/NumericInput";
import styles from "./Input.module.css";

interface InputProps {
    name: string;
    label: string;
    value?: string;
    placeholder?: string;
    type?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
    name,
    label,
    placeholder,
    value,
    type = "text",
    onChange,
}: InputProps) {

    return (
        <div className={styles.group}>
            <label>{label}</label>

            {type === "number" ? (
                <NumericInput name={name} value={value} placeholder={placeholder} onChange={onChange} />
            ) : (
                <input name={name} type={type} value={value} placeholder={placeholder} onChange={onChange} />
            )}
        </div>
    );
}