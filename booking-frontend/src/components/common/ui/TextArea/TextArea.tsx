import styles from "./TextArea.module.css";

interface Props {
    label: string;
    rows?: number;
    value?: string;
    placeholder?: string;
    name: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function TextArea({
    name,
    label,
    rows = 5,
    value,
    placeholder,
    onChange,
}: Props) {

    return (
        <div className={styles.group}>
            <label>{label}</label>

            <textarea
                name={name}
                rows={rows}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
            />
        </div>
    );
}