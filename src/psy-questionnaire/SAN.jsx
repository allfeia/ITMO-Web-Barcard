import {useEffect, useState} from "react";

import "./san.css";

import {Questions} from "./data/questions.js";
import {computeResults} from "./data/utils/scoring.js";

import InstructionScreen from "./components/InstructionScreen.jsx";
import QuestionScreen from "./components/QuestionScreen.jsx";
import ResultsScreen from "./components/ResultsScreen.jsx";
import PreferencesScreen from "./preferences/PreferencesScreen.jsx";
import RecommendationsPage from "./RecommendationsPage.jsx";

export default function SAN() {
    const [phase,      setPhase]      = useState("instruction");
    const [answers,    setAnswers]    = useState({});
    const [qIdx,       setQIdx]       = useState(0);
    const [results,    setResults]    = useState(null);
    const [recommendations, setRecommendations] = useState(null);

    useEffect(() => {
        const data = {
            answers,
            results,
            qIdx,
        };
        sessionStorage.setItem("san_data", JSON.stringify(data));
    }, [answers, results, qIdx]);

    useEffect(() => {
        const saved = sessionStorage.getItem("san_data");

        if (saved) {
            const parsed = JSON.parse(saved);

            if (parsed.answers) setAnswers(parsed.answers);
            if (parsed.results) {
                setResults(parsed.results);
                setPhase("results");
            } else if (parsed.qIdx !== undefined) {
                setQIdx(parsed.qIdx);
                setPhase("instruction");
            }
        }
    }, []);

    function handleStartTest() {
        setQIdx(0);
        setAnswers({});
        setPhase("questions");
    }

    function handleAnswer(value) {
        const q = Questions[qIdx];
        const newAnswers = { ...answers, [q.id]: value };
        setAnswers(newAnswers);


        setTimeout(() => {
            if (qIdx < Questions.length - 1) {
                setQIdx((i) => i + 1);
            } else {
                setResults(computeResults(newAnswers));
                setPhase("results");
            }
        }, 320);
    }

    function handleBack() {
        if (qIdx > 0) setQIdx((i) => i - 1);
        else setPhase("instruction");
    }

    const currentQuestion = Questions[qIdx];

    if (phase === "results" && results && recommendations) {
        return (
            <RecommendationsPage
                recommendations={recommendations}
                onBack={() => setRecommendations(null)}
            />
        );
    }

    return (
        <div className="san-wrap">

            {phase === "instruction" && (
                <InstructionScreen
                    onStart={handleStartTest}
                />
            )}

            {phase === "questions" && (
                <QuestionScreen
                    key={qIdx}
                    question={currentQuestion}
                    idx={qIdx}
                    total={Questions.length}
                    selectedValue={answers[currentQuestion.id]}
                    onAnswer={handleAnswer}
                    onBack={handleBack}
                />
            )}
            {phase === "results" && results && (
                <PreferencesScreen results={results} onRecommendations={setRecommendations} />
            )}
        </div>
    );
}
