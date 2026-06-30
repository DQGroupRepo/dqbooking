import styles from "./BookingStatsCard.module.css";

interface Props{

    title:string;

    value:number;

    color:string;

}

export default function BookingStatsCard({

    title,

    value,

    color

}:Props){

    return(

        <div
            className={styles.card}
            style={{
                borderTop:`4px solid ${color}`
            }}
        >

            <span>

                {title}

            </span>

            <h2>

                {value}

            </h2>

        </div>

    );

}