import "./SettingsSidebar.css";

interface Props{

    selected:string;

    onSelect:(item:string)=>void;

}

const menu=[

    "General",

    "Verification",

    "Bank",

    "Security",

    "Notifications",

    "Subscription",

    "Support"

];

export default function SettingsSidebar({

    selected,

    onSelect

}:Props){

    return(

        <div className="settings-sidebar">

            {

                menu.map(item=>(

                    <button

                        key={item}

                        className={

                            selected===item

                            ? "active"

                            : ""

                        }

                        onClick={()=>

                            onSelect(item)

                        }

                    >

                        {item}

                    </button>

                ))

            }

        </div>

    );

}