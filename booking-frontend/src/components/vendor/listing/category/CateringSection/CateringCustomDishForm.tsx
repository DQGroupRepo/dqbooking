import { useState } from "react";

import type { CateringMenuItem } from "../../../../types/CateringMenuItem";


interface Props {

    cuisine: string;

    defaultFoodType: string;

    onAdd: (
        item: CateringMenuItem
    ) => void;

    onCancel: () => void;

}


const CATEGORY_OPTIONS = [

    "Main Course",

    "Non-Vegetarian Dishes",

    "Soups",

    "Salads",

    "Breads",

    "Desserts"

];


const FOOD_TYPE_OPTIONS = [

    "Vegetarian",

    "Non-Vegetarian"

];


export default function CateringCustomDishForm({

    cuisine,

    defaultFoodType,

    onAdd,

    onCancel

}: Props) {


    const [
        dishName,
        setDishName
    ] = useState("");


    const [
        category,
        setCategory
    ] = useState(
        CATEGORY_OPTIONS[0]
    );


    const [
        foodType,
        setFoodType
    ] = useState(
        defaultFoodType ||
        FOOD_TYPE_OPTIONS[0]
    );


    const [
        pricePerPerson,
        setPricePerPerson
    ] = useState("");

    const newItem: CateringMenuItem = {
        id: `custom-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,

        dishId: undefined,

        customName: trimmedName,

        name: trimmedName,

        cuisine,

        category,

        foodType,

        pricePerPerson,

        active: true,

        custom: true,

        selected: true
    };

    return (

        <div className="catering-custom-dish-form">

            <div className="catering-custom-dish-header">

                <div>

                    <h4>
                        Add Custom Dish
                    </h4>

                    <p>
                        Add a dish that is not available
                        in the master menu.
                    </p>

                </div>

            </div>


            <div className="catering-custom-dish-grid">


                {/* DISH NAME */}

                <div className="catering-custom-field">

                    <label>
                        Dish Name
                    </label>

                    <input
                        type="text"
                        value={dishName}
                        onChange={event =>
                            setDishName(
                                event.target.value
                            )
                        }
                        placeholder="Enter dish name"
                    />

                </div>


                {/* CUISINE */}

                <div className="catering-custom-field">

                    <label>
                        Cuisine
                    </label>

                    <input
                        type="text"
                        value={cuisine}
                        disabled
                    />

                </div>


                {/* CATEGORY */}

                <div className="catering-custom-field">

                    <label>
                        Category
                    </label>

                    <select
                        value={category}
                        onChange={event =>
                            setCategory(
                                event.target.value
                            )
                        }
                    >

                        {
                            CATEGORY_OPTIONS.map(
                                option => (

                                    <option
                                        key={option}
                                        value={option}
                                    >
                                        {option}
                                    </option>

                                )
                            )
                        }

                    </select>

                </div>


                {/* FOOD TYPE */}

                <div className="catering-custom-field">

                    <label>
                        Food Type
                    </label>

                    <select
                        value={foodType}
                        onChange={event =>
                            setFoodType(
                                event.target.value
                            )
                        }
                    >

                        {
                            FOOD_TYPE_OPTIONS.map(
                                option => (

                                    <option
                                        key={option}
                                        value={option}
                                    >
                                        {option}
                                    </option>

                                )
                            )
                        }

                    </select>

                </div>


                {/* PRICE */}

                <div className="catering-custom-field">

                    <label>
                        Price / Person
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pricePerPerson}
                        onChange={event =>
                            setPricePerPerson(
                                event.target.value
                            )
                        }
                        placeholder="0.00"
                    />

                </div>

            </div>


            <div className="catering-custom-dish-actions">

                <button
                    type="button"
                    className="catering-custom-cancel"
                    onClick={onCancel}
                >
                    Cancel
                </button>


                <button
                    type="button"
                    className="catering-custom-add"
                    disabled={
                        !dishName.trim() ||
                        !pricePerPerson
                    }
                    onClick={() => {

                        const trimmedName =
                            dishName.trim();


                        if (
                            !trimmedName ||
                            !pricePerPerson
                        ) {

                            return;

                        }


                        const item: CateringMenuItem = {

                            id:
                                `custom-${Date.now()}-${Math.random()
                                    .toString(36)
                                    .slice(2, 8)}`,

                            dishId:
                                undefined,

                            customName:
                                trimmedName,

                            name:
                                trimmedName,

                            cuisine,

                            category,

                            foodType,

                            pricePerPerson,

                            active:
                                true,

                            custom:
                                true,

                            selected:
                                true

                        };


                        onAdd(item);

                    }}
                >
                    Add Dish
                </button>

            </div>

        </div>

    );

}