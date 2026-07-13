import styles from "./Select.module.css";

interface Option {
    label: string;
    value: string;
}

interface SelectProps {
    name: string;
    label: string;
    value?: string;
    options: Option[];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function Select({
    name,
    label,
    value,
    options,
    onChange,
}: SelectProps) {

    return (
        <div className={styles.group}>
            <label>{label}</label>

            <select
                name={name}
                value={value}
                onChange={onChange}
            >
                {options.map(option => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}