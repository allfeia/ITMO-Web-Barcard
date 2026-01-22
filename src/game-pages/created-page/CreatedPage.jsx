import {useNavigate} from "react-router-dom";
import {useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {addHintUsage, addStageMistake, setStageStepsCount} from "../../game/gameSlice.js";
import PageHeader from "../PageHeader.jsx";
import RecipeCard from "../../menu-page/RecipeCard.jsx";
import Button from "@mui/material/Button";
import RecipeStepCard from "./RecipeStepCard.jsx";
import './created-page.css'
import {createdErrors} from "./created_error.js";
import ErrorModal from "../ErrorModal.jsx";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function CreatedPage() {
    const goTo = useNavigate();
    const hintRef = useRef(null);

    const [isHintOpen, setIsHintOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorCount, setErrorCount] = useState(0);


    const dispatch = useDispatch();
    const mode = useSelector(state => state.game.mode);
    const selectedIngredients = useSelector(state => state.game.selectedIngredients);
    const cocktail = useSelector(state => state.game.cocktailId)

    const cocktailIngredients = useSelector(state => state.game.cocktailData?.ingredients || []);

    const recipeSteps = useSelector(
        state => state.game.cocktailData?.steps || []
    );
    const [shuffledSteps, setShuffledSteps] = useState(() =>
        [...recipeSteps].sort(() => Math.random() - 0.5)
    );

    const [userAnswers, setUserAnswers] = useState({});

    const errorChecker = () => {
        const totalErrors = createdErrors(shuffledSteps, recipeSteps, cocktailIngredients, userAnswers);

        dispatch(setStageStepsCount({ stage: 'stage3', stepsCount: cocktailIngredients.length+recipeSteps.length }));

        if (totalErrors > 0) {
            dispatch(addStageMistake({ stage: 'stage3', count: totalErrors }));
            setErrorCount(totalErrors);
            setErrorModalOpen(true);
        } else {
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
                onHintClick={() => { setIsHintOpen(true); dispatch(addHintUsage({ stage: 'stage3' })); }}
            />
            {isHintOpen && (
                <RecipeCard
                    open={isHintOpen}
                    onClose={() => setIsHintOpen(false)}
                    cocktail={{id: cocktail}}
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
        </div>
    )
}
export default CreatedPage;