import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@mui/material";
import WestIcon from "@mui/icons-material/West";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext/useAuth.js";

import "./PreferencesScreen.css";
import RecommendationsPage from "../RecommendationsPage.jsx";

function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
}

export default function PreferencesScreen({ results, onRecommendations }) {
    const { barId } = useAuth();
    const goTo = useNavigate();

    const [alcoholPreference, setAlcoholPreference] = useState("any");
    const [allergyInput, setAllergyInput] = useState("");
    const [selectedAllergies, setSelectedAllergies] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [ingredients, setIngredients] = useState([]);
    const [ingredientsLoading, setIngredientsLoading] = useState(false);
    const [ingredientsError, setIngredientsError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [recommendError, setRecommendError] = useState("");
    const [recommendations, setRecommendations] = useState(null);


    useEffect(() => {
        const loadIngredients = async () => {
            if (!barId) return;

            try {
                setIngredientsLoading(true);
                setIngredientsError("");

                const response = await fetch(`/api/bar/${barId}/ingredients`);

                if (!response.ok) {
                    throw new Error("Не удалось загрузить ингредиенты");
                }

                const data = await response.json();

                setIngredients(
                    Array.isArray(data.ingredients) ? data.ingredients : []
                );
            } catch (error) {
                console.error(error);
                setIngredients([]);
                setIngredientsError("Не удалось загрузить ингредиенты бара");
            } finally {
                setIngredientsLoading(false);
            }
        };

        loadIngredients();
    }, [barId]);

    const normalizedInput = useMemo(() => {
        return normalizeText(allergyInput);
    }, [allergyInput]);

    const filteredIngredients = useMemo(() => {
    if (!normalizedInput) return [];

    return ingredients
        .filter((item) =>
            normalizeText(item.name).includes(normalizedInput)
        )
        .slice(0, 8);
    }, [ingredients, normalizedInput]);

    const hasMatches = filteredIngredients.length > 0;

    const shouldShowDropdown =
        isDropdownOpen &&
        normalizedInput.length > 0 &&
        !ingredientsLoading &&
        !ingredientsError;

    const addAllergy = (ingredient) => {
        const exists = selectedAllergies.some(
            (item) => item.id === ingredient.id
        );

        if (exists) return;

        setSelectedAllergies((prev) => [...prev, ingredient]);
        setAllergyInput("");
        setIsDropdownOpen(false);
    };

    const removeAllergy = (id) => {
        setSelectedAllergies((prev) =>
            prev.filter((item) => item.id !== id)
        );
    };

    const handleInputChange = (e) => {
        setAllergyInput(e.target.value);
        setIsDropdownOpen(true);
    };

    const handleInputFocus = () => {
        if (normalizedInput.length > 0) {
            setIsDropdownOpen(true);
        }
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setIsDropdownOpen(false);
        }, 150);
    };

    const handleKeyDown = (e) => {
        if (e.key !== "Enter") return;

        e.preventDefault();

        const exactMatch = ingredients.find(
            (item) =>
                normalizeText(item.name) === normalizedInput &&
                !selectedAllergies.some(
                    (selected) => selected.id === item.id
                )
        );

        if (exactMatch) {
            addAllergy(exactMatch);
            return;
        }

        if (filteredIngredients.length > 0) {
            addAllergy(filteredIngredients[0]);
        }
    };

    const handleSubmit = async () => {
        if (!barId) {
            setRecommendError("Не найден barId");
            return;
        }

        const payload = {
            wellbeing: results.samochuvstvie,
            activity: results.aktivnost,
            mood: results.nastroenie,
            preferences: {
                alcoholPreference,
                allergies: selectedAllergies.map((item) => item.id),
            },
        };

        try {
            setSubmitting(true);
            setRecommendError("");

            const response = await fetch(`/api/bar/${barId}/recommend`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Не удалось получить рекомендации");
            }

            const data = await response.json();

            console.log("Рекомендации:", data);
            onRecommendations(data.recommendations);

        } catch (error) {
            console.error(error);
            setRecommendError("Ошибка при получении рекомендаций");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="preferences-screen san-card san-fade-in">
            <Button
                className="back-btn"
                variant="text"
                onClick={() => goTo(-1)}
                data-testid="back-button"
            >
                <WestIcon className="learn-arrow" sx={{ fontSize: "30px" }} />
            </Button>

            <div className="san-eyebrow">Предпочтения</div>

            <h1 className="san-h1">
                Определимся с вашими предпочтениями
            </h1>

            <p className="san-body">
                Прежде чем мы подберем для вас идеальные варианты, пожалуйста, расскажите немного о своих вкусах. 
                Выберите желаемую крепость напитков и обязательно укажите, если у вас есть аллергия на какие-либо ингредиенты, 
                чтобы мы могли позаботиться о вашем комфорте и безопасности.
            </p>

            <div className="san-divider" />

            <div className="preferences-grid">
                <div>
                    <div className="section-title">
                        Крепость напитка
                    </div>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={
                                    alcoholPreference === "alcohol"
                                }
                                onChange={() =>
                                    setAlcoholPreference("alcohol")
                                }
                            />
                            Алкогольный
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={
                                    alcoholPreference === "non-alcohol"
                                }
                                onChange={() =>
                                    setAlcoholPreference(
                                        "non-alcohol"
                                    )
                                }
                            />
                            Безалкогольный
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={alcoholPreference === "any"}
                                onChange={() =>
                                    setAlcoholPreference("any")
                                }
                            />
                            Не имеет значения
                        </label>
                    </div>
                </div>

                <div className="san-divider" />

                <div>
                    <div className="section-title">
                        Аллергии
                    </div>

                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={allergyInput}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            onKeyDown={handleKeyDown}
                            placeholder="Введите ингредиент"
                            className={`san-input allergy-input ${
                                shouldShowDropdown
                                    ? "dropdown-open"
                                    : ""
                            }`}
                        />

                        {shouldShowDropdown && (
                            <div className="dropdown">
                                {hasMatches ? (
    filteredIngredients.map((ingredient, index) => {
        const alreadySelected = selectedAllergies.some(
            (selected) => selected.id === ingredient.id
        );

        return (
            <button
                key={ingredient.id}
                type="button"
                disabled={alreadySelected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addAllergy(ingredient)}
                className={`dropdown-item ${
                    index !== filteredIngredients.length - 1
                        ? "dropdown-item-border"
                        : ""
                } ${
                    alreadySelected
                        ? "dropdown-item-disabled"
                        : ""
                }`}
            >
                {alreadySelected
    ? `${ingredient.name} уже выбран`
    : ingredient.name}
            </button>
        );
    })
) : (
    <div className="dropdown-empty">
        Такие ингредиенты не используются в баре
    </div>
)}
                            </div>
                        )}
                    </div>

                    {ingredientsLoading && (
                        <p className="san-neutral-note note-spacing">
                            Загрузка ингредиентов...
                        </p>
                    )}

                    {!!ingredientsError && (
                        <p className="san-neutral-note error-text">
                            {ingredientsError}
                        </p>
                    )}

                    {!!selectedAllergies.length && (
                        <div className="allergy-tags">
                            {selectedAllergies.map((item) => (
                                <div
                                    key={item.id}
                                    className="allergy-tag"
                                >
                                    <span>{item.name}</span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeAllergy(item.id)
                                        }
                                        className="remove-tag-btn"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="san-divider" />

            {!!recommendError && (
                <p className="san-neutral-note error-text">
                    {recommendError}
                </p>
            )}

            <div className="san-btns">
                <button
                    className="san-btn"
                    onClick={handleSubmit}
                    disabled={
                        submitting || ingredientsLoading
                    }
                >
                    {submitting
                        ? "Составляем рекомендации"
                        : "Показать рекомендации"}
                </button>
            </div>
        </div>
    );
}
