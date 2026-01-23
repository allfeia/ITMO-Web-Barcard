import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import HardModeFailModal from "../HardModeFailModal";
import {
    addHintUsage,
    addStageMistake,
    setStageScore,
    setStageStepsCount,
    setGameOver,
    resetGameOver, resetLevel,
} from "../../game/gameSlice.js";
import PageHeader from "../PageHeader.jsx";
import RecipeCard from "../../menu-page/RecipeCard.jsx";
import Button from "@mui/material/Button";
import RecipeStepCard from "./RecipeStepCard.jsx";
import './created-page.css';
import { createdErrors } from "./created_error.js";
import ErrorModal from "../ErrorModal.jsx";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { calculateStageScore } from "../../game/scoreCalculator.js";

function CreatedPage() {
    const goTo = useNavigate();
    const hintRef = useRef(null);

    const [isHintOpen, setIsHintOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorCount, setErrorCount] = useState(0);

    const dispatch = useDispatch();

    const mode = useSelector(state => state.game.mode);
    const selectedIngredients = useSelector(state => state.game.selectedIngredients);
    const cocktail = useSelector(state => state.game.cocktailId);
    const cocktailIngredients = useSelector(state => state.game.cocktailData?.ingredients || []);
    const recipeSteps = useSelector(state => state.game.cocktailData?.steps || []);
    const stage3Data = useSelector(state => state.game.stages.stage3);
    const gameOver = useSelector(state => state.game.gameOver);

    const [shuffledSteps, setShuffledSteps] = useState(() =>
        [...recipeSteps].sort(() => Math.random() - 0.5)
    );

    const [userAnswers, setUserAnswers] = useState({});

    const errorChecker = () => {
        const totalErrors = createdErrors(shuffledSteps, recipeSteps, cocktailIngredients, userAnswers);

        dispatch(setStageStepsCount({
            stage: 'stage3',
            stepsCount: cocktailIngredients.length + recipeSteps.length
        }));

        if (totalErrors > 0) {
            dispatch(addStageMistake({
                stage: 'stage3',
                count: totalErrors
            }));

            // Проверка на превышение в hard-режиме
            const currentMistakes = stage3Data.mistakes + totalErrors;
            const steps = stage3Data.stepsCount || (cocktailIngredients.length + recipeSteps.length);
            const maxAllowed = Math.max(steps - 2, 1);

            if (mode === 'hard' && currentMistakes > maxAllowed) {
                dispatch(setGameOver({
                    isOver: true,
                    reason: 'too_many_mistakes_hard'
                }));
            } else {
                setErrorCount(totalErrors);
                setErrorModalOpen(true);
            }
        } else {
            const stageScore = calculateStageScore('stage3', mode, stage3Data);
            dispatch(setStageScore({
                stage: 'stage3',
                score: stageScore
            }));
            goTo("/result");
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const newSteps = Array.from(shuffledSteps);
        const [movedStep] = newSteps.splice(result.source.index, 1);
        newSteps.splice(result.destination.index, 0, movedStep);

        setShuffledSteps(newSteps);
    };

    return (
        <div className="created-container">
            <PageHeader
                title="Коктейль"
                showHint={mode !== "hard"}
                hintCanvasRef={hintRef}
                onBack={() => { goTo(-1) }}
                onHintClick={() => {
                    setIsHintOpen(true);
                    dispatch(addHintUsage({ stage: 'stage3' }));
                    window.ym(106396717,'reachGoal','hints3')
                }}
            />

            {isHintOpen && (
                <RecipeCard
                    open={isHintOpen}
                    onClose={() => setIsHintOpen(false)}
                    cocktail={{ id: cocktail }}
                    isHint={true}
                />
            )}

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="recipeSteps">
                    {(provided) => (
                        <div
                            className="recipe-steps"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {shuffledSteps.map((step, index) => (
                                <Draggable
                                    key={step.step_number}
                                    draggableId={String(step.step_number)}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                ...provided.draggableProps.style,
                                                marginBottom: "8px",
                                                opacity: snapshot.isDragging ? 0.8 : 1,
                                            }}
                                        >
                                            <RecipeStepCard
                                                step={step}
                                                selectedIngredients={selectedIngredients}
                                                userAnswers={userAnswers}
                                                setUserAnswers={setUserAnswers}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <Button
                className="create-btn"
                variant="text"
                sx={{ backgroundColor: "#EFEEEC", border: "1px solid #333", color: "#333", fontSize: "12px", marginLeft: "35px", height: "42px", width: "45%" }}
                onClick={errorChecker}
            >
                Создать коктейль
            </Button>

            <ErrorModal
                open={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                errorCount={errorCount}
            />

            <HardModeFailModal
                open={gameOver}
                onClose={() => dispatch(resetGameOver())}
                onStudyRecipe={() => {
                    dispatch(resetGameOver());
                    setIsHintOpen(true);
                }}
                onChangeMode={() => {
                    dispatch(resetGameOver());
                    dispatch(resetLevel());
                    goTo('/levelPage');
                }}
            />
        </div>
    );
}

export default CreatedPage;