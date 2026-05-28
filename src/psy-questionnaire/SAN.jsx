import {useEffect, useState} from "react";

import "./san.css";

import {Questions} from "./data/questions.js";
import {computeResults} from "./data/utils/scoring.js";

import InstructionScreen from "./components/InstructionScreen.jsx";
import QuestionScreen from "./components/QuestionScreen.jsx";
import ResultsScreen from "./components/ResultsScreen.jsx";
import PreferencesScreen from "../preferences/PreferencesScreen.jsx";

export default function SAN() {
    const [phase,      setPhase]      = useState("instruction");
    const [answers,    setAnswers]    = useState({});
    const [qIdx,       setQIdx]       = useState(0);
    const [results,    setResults]    = useState(null);
    // const [saving,     setSaving]     = useState(false);
    // const [saveStatus, setSaveStatus] = useState(null); // null | "success" | "error"

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

    // async function handleSave() {
    //     setSaving(true);
    //     setSaveStatus(null);

    //     const saved = sessionStorage.getItem("san_data");
    //     if (!saved) {
    //         setSaveStatus("error");
    //         setSaving(false);
    //         return;
    //     }
    //     const parsed = JSON.parse(saved);

    //     const { answers, results } = parsed;

    //     const questionIds = Questions.map((question) => question.id);

    //     const row = {
    //         timestamp: new Date().toISOString(),

    //         answers: questionIds.map((id) => answers?.[id] ?? ""),

    //         samochuvstvie: results?.samochuvstvie.toFixed(2) ?? "",
    //         aktivnost: results?.aktivnost.toFixed(2) ?? "",
    //         nastroenie: results?.nastroenie.toFixed(2) ?? "",
    //     };

    //     try {
    //         await fetch("https://script.google.com/macros/s/AKfycbzFiB4K9vzRxhX3JcdbfZ6HXghxm_X3_zmY31JvCmgdq29pKoG15J4MDx-1LbCuIiuZ/exec", {
    //             method: "POST",
    //             mode: "no-cors",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(row),
    //         });

    //         setSaveStatus("success");
    //     } catch {
    //         setSaveStatus("error");
    //     }

    //     setSaving(false);
    // }

    // function handleRestart() {
    //     setAnswers({});
    //     setQIdx(0);
    //     setResults(null);
    //     setSaveStatus(null);
    //     setPhase("instruction");

    //     sessionStorage.removeItem("san_data");
    // }


    const currentQuestion = Questions[qIdx];

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
            {/* {phase === "results" && results && (
                <ResultsScreen
                    results={results}
                    saving={saving}
                    saveStatus={saveStatus}
                    onSave={handleSave}
                    onRestart={handleRestart}
                />
            )} */}
            {phase === "results" && results && (
            <PreferencesScreen
                results={results}
            />
            )}
        </div>
    );
}
