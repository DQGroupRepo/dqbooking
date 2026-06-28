import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import styles from "./BackButton.module.css";

interface Props {

    label?: string;

    to?: string;

}

export default function BackButton({

    label = "Back",

    to

}: Props) {

    const navigate = useNavigate();

    const handleClick = () => {

        if (to) {

            navigate(to);

        }

        else {

            navigate(-1);

        }

    };

    return (

        <button

            type="button"

            className={styles.button}

            onClick={handleClick}

        >

            <FaArrowLeft />

            {label}

        </button>

    );

}