import "./AdminTopBar.css";

const AdminTopBar = () => {

    return (

        <header className="admin-topbar">

            <div className="admin-topbar-left">

                <h1>
                    Admin Portal
                </h1>

                <p>
                    Manage and monitor EventNest
                </p>

            </div>


            <div className="admin-topbar-right">

                <button
                    type="button"
                    className="admin-notification-button"
                >
                    🔔
                </button>


                <div className="admin-topbar-profile">

                    <div className="admin-avatar">
                        A
                    </div>

                    <div>

                        <strong>
                            Administrator
                        </strong>

                        <span>
                            Admin
                        </span>

                    </div>

                </div>

            </div>

        </header>

    );

};

export default AdminTopBar;