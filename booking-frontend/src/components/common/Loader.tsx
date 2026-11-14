import "./Loader.css";

type LoaderProps = {
    label?: string;
};

const Loader = ({ label = "Preparing your page" }: LoaderProps) => (
    <div className="dq-loading-screen" role="status" aria-live="polite">
        <div className="dq-loading-card">
            <div className="dq-loading-mark" aria-hidden="true">
                <span />
                <span />
                <span />
        </div>
            <strong>{label}</strong>
            <div className="dq-loading-track" aria-hidden="true"><span /></div>
            <small>Please wait a moment</small>
        </div>
    </div>
);

export default Loader;
