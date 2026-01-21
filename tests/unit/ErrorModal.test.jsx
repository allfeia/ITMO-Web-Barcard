import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorModal from "../../src/ErrorModal";

describe("ErrorModal", () => {
    it("не рендерится, если open = false", () => {
        render(
            <ErrorModal
                open={false}
                onClose={vi.fn()}
                errorCount={3}
            />
        );

        expect(
            screen.queryByText(/Найдено ошибок/i)
        ).not.toBeInTheDocument();
    });

    it("рендерится, если open = true", () => {
        render(
            <ErrorModal
                open={true}
                onClose={vi.fn()}
                errorCount={2}
            />
        );

        expect(
            screen.getByText("Найдено ошибок: 2")
        ).toBeInTheDocument();
    });

    it("показывает корректное количество ошибок", () => {
        render(
            <ErrorModal
                open={true}
                onClose={vi.fn()}
                errorCount={5}
            />
        );

        expect(
            screen.getByText("Найдено ошибок: 5")
        ).toBeInTheDocument();
    });

    it("клик по кнопке Закрыть вызывает onClose", () => {
        const onClose = vi.fn();

        render(
            <ErrorModal
                open={true}
                onClose={onClose}
                errorCount={1}
            />
        );

        fireEvent.click(screen.getByText("Закрыть"));

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
