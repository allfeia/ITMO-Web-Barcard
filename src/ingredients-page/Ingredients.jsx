import { useEffect, useState } from "react";

export function useIngredients() {
    const [searchValue, setSearchValue] = useState("");
    const [ingredients, setIngredients] = useState([]);

    useEffect(() => {
        fetch("/api/ingredients",
            { method: "POST" }
        )
            .then(res => res.json())
            .then(data => {
                setIngredients(data)
                console.log("Полученные ингредиенты:", data)
            })
            .catch(err => console.error(err));
    }, []);

    const filteredIngredients = ingredients.filter(i =>
        i.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const INGREDIENT_GROUPS = {
        alcohol: "Алкогольные",
        "non-alcohol": "Безалкогольные",
        fruit: "Фрукты/Овощи/Ягоды",
        decoration: "Украшения",
        syrup: "Сиропы",
        spice: "Специи",
        added: "Добавки",
        other: "Другое",
    };

    const groupedIngredients = Object.keys(INGREDIENT_GROUPS).map(type => ({
        type,
        title: INGREDIENT_GROUPS[type],
        items: filteredIngredients.filter(i => i.type === type),
    }));

    return {
        searchValue,
        setSearchValue,
        groupedIngredients,
    };
}
