import "./BookingStatusBadge.css";

interface Props {
    status: string;
}

const BookingStatusBadge = ({ status }: Props) => {

    const cssClass = status.toLowerCase();

    return (
        <span className={`booking-status ${cssClass}`}>
            {status}
        </span>
    );

};

export default BookingStatusBadge;