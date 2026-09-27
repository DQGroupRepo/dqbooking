import {
    useEffect,
    useState
} from "react";

import VendorTeamService, {
    type VendorPage,
    type VendorTeamMember
} from "../../services/VendorTeamService";

import "./VendorTeam.css";


const pages: {
    key: VendorPage;
    label: string;
}[] = [

    {
        key: "DASHBOARD",
        label: "Dashboard"
    },

    {
        key: "SERVICES",
        label: "Services"
    },

    {
        key: "BOOKINGS",
        label: "Bookings"
    },

    {
        key: "REVIEWS",
        label: "Reviews"
    },

    {
        key: "REVENUE",
        label: "Revenue"
    },

    {
        key: "BUNDLES",
        label: "Bundles"
    },

    {
        key: "PROFILE",
        label: "Profile"
    },

    {
        key: "SETTINGS",
        label: "Settings"
    }

];


const VendorTeam = () => {

    const [
        members,
        setMembers
    ] = useState<VendorTeamMember[]>([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    /*
     * =========================================
     * CREATE / EDIT FORM VISIBILITY
     * =========================================
     */

    const [
        showForm,
        setShowForm
    ] = useState(false);


    /*
     * =========================================
     * EDITING MEMBER
     * =========================================
     *
     * null = creating a new VendorUser
     *
     * userId = editing existing VendorUser
     */

    const [
        editingMemberId,
        setEditingMemberId
    ] = useState<string | null>(null);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        form,
        setForm
    ] = useState({

        firstName: "",

        lastName: "",

        email: "",

        phone: "",

        password: "",

        viewPages: [] as VendorPage[],

        editPages: [] as VendorPage[]

    });


    useEffect(() => {

        loadMembers();

    }, []);


    async function loadMembers() {

        try {

            setLoading(true);

            setError("");

            const data =
                await VendorTeamService
                    .getTeamMembers();

            setMembers(data);

        }
        catch (err: any) {

            console.error(
                "Failed to load team members:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load team members."
            );

        }
        finally {

            setLoading(false);

        }

    }


    /*
     * =========================================
     * RESET FORM
     * =========================================
     */

    function resetForm() {

        setForm({

            firstName: "",

            lastName: "",

            email: "",

            phone: "",

            password: "",

            viewPages: [],

            editPages: []

        });

        setEditingMemberId(null);

        setShowForm(false);

    }


    /*
     * =========================================
     * OPEN CREATE FORM
     * =========================================
     */

    function openCreateForm() {

        setForm({

            firstName: "",

            lastName: "",

            email: "",

            phone: "",

            password: "",

            viewPages: [],

            editPages: []

        });

        setEditingMemberId(null);

        setError("");

        setShowForm(true);

    }


    /*
     * =========================================
     * OPEN EDIT FORM
     * =========================================
     */

    function openEditForm(
        member: VendorTeamMember
    ) {

        setForm({

            firstName:
                member.fullName
                    .split(" ")[0] || "",

            lastName:
                member.fullName
                    .split(" ")
                    .slice(1)
                    .join(" ") || "",

            email:
                member.email || "",

            phone:
                member.phone || "",

            /*
             * Password is intentionally empty.
             *
             * An empty password means:
             * keep the existing password.
             */

            password: "",

            viewPages:
                member.viewPages
                    ? [...member.viewPages]
                    : [],

            editPages:
                member.editPages
                    ? [...member.editPages]
                    : []

        });


        setEditingMemberId(
            member.id
        );


        setError("");

        setShowForm(true);

    }


    /*
     * =========================================
     * TOGGLE VIEW
     * =========================================
     */

    function toggleView(
        page: VendorPage
    ) {

        setForm(current => {

            const exists =
                current.viewPages.includes(
                    page
                );


            /*
             * If View is being removed while
             * Edit is still enabled, remove Edit
             * as well.
             *
             * This maintains:
             *
             * Edit => View
             */

            if (
                exists &&
                current.editPages.includes(page)
            ) {

                return {

                    ...current,

                    viewPages:
                        current.viewPages.filter(
                            item =>
                                item !== page
                        ),

                    editPages:
                        current.editPages.filter(
                            item =>
                                item !== page
                        )

                };

            }


            return {

                ...current,

                viewPages:
                    exists

                        ? current.viewPages.filter(
                            item =>
                                item !== page
                        )

                        : [
                            ...current.viewPages,
                            page
                        ]

            };

        });

    }


    /*
     * =========================================
     * TOGGLE EDIT
     * =========================================
     */

    function toggleEdit(
        page: VendorPage
    ) {

        setForm(current => {

            const exists =
                current.editPages.includes(
                    page
                );


            /*
             * Remove Edit.
             */

            if (exists) {

                return {

                    ...current,

                    editPages:
                        current.editPages.filter(
                            item =>
                                item !== page
                        )

                };

            }


            /*
             * Add Edit.
             *
             * Edit automatically grants View.
             */

            return {

                ...current,

                editPages: [

                    ...current.editPages,

                    page

                ],

                viewPages:
                    current.viewPages.includes(page)

                        ? current.viewPages

                        : [

                            ...current.viewPages,

                            page

                        ]

            };

        });

    }


    /*
     * =========================================
     * CREATE VENDOR USER
     * =========================================
     */

    async function handleCreate(
        event: React.FormEvent
    ) {

        event.preventDefault();


        try {

            setSaving(true);

            setError("");


            await VendorTeamService
                .createVendorUser(
                    form
                );


            resetForm();

            await loadMembers();

        }
        catch (err: any) {

            console.error(
                "Failed to create VendorUser:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to create VendorUser."
            );

        }
        finally {

            setSaving(false);

        }

    }


    /*
     * =========================================
     * UPDATE VENDOR USER
     * =========================================
     */

    async function handleUpdate(
        event: React.FormEvent
    ) {

        event.preventDefault();


        if (!editingMemberId) {

            return;

        }


        try {

            setSaving(true);

            setError("");


            /*
             * =====================================
             * STEP 1
             *
             * Update user information.
             *
             * Password is optional.
             * =====================================
             */

            await VendorTeamService
                .updateVendorUser(
                    editingMemberId,
                    {
                        firstName:
                            form.firstName,

                        lastName:
                            form.lastName,

                        email:
                            form.email,

                        phone:
                            form.phone,

                        /*
                         * Empty password means:
                         * keep existing password.
                         */

                        password:
                            form.password || undefined,

                        viewPages:
                            form.viewPages,

                        editPages:
                            form.editPages

                    }
                );


            /*
             * =====================================
             * STEP 2
             *
             * Update permissions separately.
             * =====================================
             */

            await VendorTeamService
                .updatePermissions(
                    editingMemberId,

                    form.viewPages,

                    form.editPages

                );


            /*
             * =====================================
             * SUCCESS
             * =====================================
             */

            resetForm();

            await loadMembers();

        }
        catch (err: any) {

            console.error(
                "Failed to update VendorUser:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to update VendorUser."
            );

        }
        finally {

            setSaving(false);

        }

    }


    /*
     * =========================================
     * FORM SUBMIT
     * =========================================
     */

    async function handleSubmit(
        event: React.FormEvent
    ) {

        if (editingMemberId) {

            await handleUpdate(
                event
            );

            return;

        }


        await handleCreate(
            event
        );

    }


    if (loading) {

        return (

            <section>

                Loading team...

            </section>

        );

    }


    return (

        <section className="vendor-team">


            {/* =========================================
                HEADER
            ========================================= */}

            <div className="vendor-team-header">

                <div>

                    <h1>
                        Team
                    </h1>

                    <p>
                        Manage your VendorUsers and
                        their page permissions.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={
                        showForm
                            ? resetForm
                            : openCreateForm
                    }
                >

                    {showForm
                        ? "Cancel"
                        : "+ Add VendorUser"
                    }

                </button>

            </div>


            {/* =========================================
                ERROR
            ========================================= */}

            {error && (

                <div className="vendor-team-error">

                    {error}

                </div>

            )}


            {/* =========================================
                CREATE / EDIT FORM
            ========================================= */}

            {showForm && (

                <form
                    className="vendor-team-form"
                    onSubmit={handleSubmit}
                >

                    <h2>

                        {editingMemberId
                            ? "Edit VendorUser"
                            : "Create VendorUser"
                        }

                    </h2>


                    {/* =================================
                        FIRST NAME
                    ================================= */}

                    <input
                        placeholder="First name"
                        value={
                            form.firstName
                        }
                        onChange={e =>
                            setForm(current => ({
                                ...current,

                                firstName:
                                    e.target.value

                            }))
                        }
                        required
                    />


                    {/* =================================
                        LAST NAME
                    ================================= */}

                    <input
                        placeholder="Last name"
                        value={
                            form.lastName
                        }
                        onChange={e =>
                            setForm(current => ({
                                ...current,

                                lastName:
                                    e.target.value

                            }))
                        }
                    />


                    {/* =================================
                        EMAIL
                    ================================= */}

                    <input
                        type="email"
                        placeholder="Email"
                        value={
                            form.email
                        }
                        onChange={e =>
                            setForm(current => ({
                                ...current,

                                email:
                                    e.target.value

                            }))
                        }
                        required
                    />


                    {/* =================================
                        PHONE
                    ================================= */}

                    <input
                        placeholder="Phone"
                        value={
                            form.phone
                        }
                        onChange={e =>
                            setForm(current => ({
                                ...current,

                                phone:
                                    e.target.value

                            }))
                        }
                    />


                    {/* =================================
                        PASSWORD
                    ================================= */}

                    <input
                        type="password"
                        placeholder={
                            editingMemberId
                                ? "New password (leave blank to keep current)"
                                : "Password"
                        }
                        value={
                            form.password
                        }
                        onChange={e =>
                            setForm(current => ({
                                ...current,

                                password:
                                    e.target.value

                            }))
                        }
                        required={
                            !editingMemberId
                        }
                    />


                    {/* =================================
                        PERMISSIONS
                    ================================= */}

                    <h3>
                        Permissions
                    </h3>


                    <div className="vendor-permission-table">


                        <div className="permission-row permission-header">

                            <span>
                                Page
                            </span>

                            <span>
                                View
                            </span>

                            <span>
                                Edit
                            </span>

                        </div>


                        {pages.map(page => (

                            <div
                                key={page.key}
                                className="permission-row"
                            >

                                <span>
                                    {page.label}
                                </span>


                                {/* =========================
                                    VIEW
                                ========================= */}

                                <input
                                    type="checkbox"
                                    checked={
                                        form.viewPages.includes(
                                            page.key
                                        )
                                    }
                                    onChange={() =>
                                        toggleView(
                                            page.key
                                        )
                                    }
                                />


                                {/* =========================
                                    EDIT
                                ========================= */}

                                <input
                                    type="checkbox"
                                    checked={
                                        form.editPages.includes(
                                            page.key
                                        )
                                    }
                                    onChange={() =>
                                        toggleEdit(
                                            page.key
                                        )
                                    }
                                />

                            </div>

                        ))}

                    </div>


                    {/* =================================
                        FORM ACTIONS
                    ================================= */}

                    <div>

                        <button
                            type="submit"
                            disabled={saving}
                        >

                            {saving

                                ? (
                                    editingMemberId
                                        ? "Saving..."
                                        : "Creating..."
                                )

                                : (
                                    editingMemberId
                                        ? "Save Changes"
                                        : "Create VendorUser"
                                )

                            }

                        </button>


                        <button
                            type="button"
                            onClick={
                                resetForm
                            }
                            disabled={saving}
                        >

                            Cancel

                        </button>

                    </div>

                </form>

            )}


            {/* =========================================
                TEAM MEMBERS
            ========================================= */}

            <div className="vendor-team-list">

                {members.length === 0 ? (

                    <div>

                        No VendorUsers yet.

                    </div>

                ) : (

                    members.map(member => (

                        <div
                            key={member.id}
                            className="vendor-team-member"
                        >

                            {/* =================================
                                USER
                            ================================= */}

                            <div>

                                <strong>
                                    {member.fullName}
                                </strong>

                                <span>
                                    {member.email}
                                </span>

                            </div>


                            {/* =================================
                                STATUS
                            ================================= */}

                            <div>

                                {member.active
                                    ? "Active"
                                    : "Inactive"
                                }

                            </div>


                            {/* =================================
                                VIEW PERMISSIONS
                            ================================= */}

                            <div>

                                <strong>
                                    View
                                </strong>

                                <div>

                                    {member.viewPages
                                        .map(page =>
                                            page
                                        )
                                        .join(", ") ||
                                        "None"}

                                </div>

                            </div>


                            {/* =================================
                                EDIT PERMISSIONS
                            ================================= */}

                            <div>

                                <strong>
                                    Edit
                                </strong>

                                <div>

                                    {member.editPages
                                        .map(page =>
                                            page
                                        )
                                        .join(", ") ||
                                        "None"}

                                </div>

                            </div>


                            {/* =================================
                                EDIT ACTION
                            ================================= */}

                            <div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        openEditForm(
                                            member
                                        )
                                    }
                                >

                                    Edit

                                </button>

                            </div>

                        </div>

                    ))

                )}

            </div>


        </section>

    );

};


export default VendorTeam;