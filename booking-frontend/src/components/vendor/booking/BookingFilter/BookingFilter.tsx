import styles from "./BookingFilter.module.css";

interface Props {

    active: string;

    onChange: (value: string) => void;

}

const filters = [

    "All",

    "Upcoming",

    "Pending",

    "Confirmed",

    "Completed",

    "Cancelled"

];

export default function BookingFilter({

    active,

    onChange

}: Props) {

    return (

        <div className={styles.container}>

            {

                filters.map(item => (

                    <button

                        key={item}

                        onClick={() => onChange(item)}

                        className={
                            active === item
                                ? styles.active
                                : ""
                        }

                    >

                        {item}

                    </button>

                ))

            }

        </div>

    );

}