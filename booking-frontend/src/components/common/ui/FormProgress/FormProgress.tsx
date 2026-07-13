import styles from "./FormProgress.module.css";

interface Props{

    progress:number;

}

export default function FormProgress({

    progress

}:Props){

    return(

        <div className={styles.container}>

            <div className={styles.header}>

                <span>

                    Form Completion

                </span>

                <span>

                    {progress}% Complete

                </span>

            </div>

            <div className={styles.track}>

                <div

                    className={styles.fill}

                    style={{

                        width:`${progress}%`

                    }}

                />

            </div>

            <p className={styles.message}>

                {

                    progress===100

                    ? "🎉 Ready to Publish"

                    : "Complete all required sections before publishing."

                }

            </p>

        </div>

    );

}