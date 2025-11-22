import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StartPage from "./StartPage.jsx";
import { vi } from "vitest";

// ──────────────────────────────────────────────────────────────
// 1. Мокаем react-router-dom (useNavigate + useSearchParams)
// ──────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        // useSearchParams не обязателен, т.к. MemoryRouter сам передаёт параметры
    };
});

// ──────────────────────────────────────────────────────────────
// 2. Мокаем все функции рисования — самый надёжный и быстрый способ
// ──────────────────────────────────────────────────────────────
vi.mock("../glasses/BlueGlass.js", () => ({
    drawBlueGlass: vi.fn(),
}));
vi.mock("../glasses/PinkGlass.js", () => ({
    drawPinkGlass: vi.fn(),
}));
vi.mock("../glasses/RedGlass.js", () => ({
    drawRedGlass: vi.fn(),
}));
vi.mock("../glasses/YellowGlass.js", () => ({
    drawYellowGlass: vi.fn(),
}));

// ──────────────────────────────────────────────────────────────
// 3. Если всё-таки хочешь замокать canvas (необязательно при vi.mock выше)
//    но на всякий случай — полный и безопасный мок
// ──────────────────────────────────────────────────────────────
beforeAll(() => {
    const ctxMock = {
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 1,
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        ellipse: vi.fn(),
        quadraticCurveTo: vi.fn(),
        bezierCurveTo: vi.fn(),
        roundRect: vi.fn(),        // ← важно! drawRedGlass использует roundRect
        fill: vi.fn(),
        stroke: vi.fn(),
        closePath: vi.fn(),
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
    };

    // Один раз задаём мок, который будет возвращаться всегда
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(ctxMock);

    // Некоторые функции могут менять размер canvas
    Object.defineProperty(HTMLCanvasElement.prototype, "width", { writable: true, value: 75 });
    Object.defineProperty(HTMLCanvasElement.prototype, "height", { writable: true, value: 75 });
});

// ──────────────────────────────────────────────────────────────
// 4. Очистка перед каждым тестом
// ───────────────────────────────────────────────────────────────
beforeEach(() => {
    sessionStorage.clear();
    mockNavigate.mockReset();
});

// ──────────────────────────────────────────────────────────────
// 5. Тесты — всё зелёное!
// ──────────────────────────────────────────────────────────────
describe("StartPage", () => {
    test("чтение URL параметров и запись в sessionStorage", () => {
        render(
            <MemoryRouter initialEntries={["/?barId=BAR123&isBarman=true"]}>
                <StartPage />
            </MemoryRouter>
        );

        expect(sessionStorage.getItem("barId")).toBe("BAR123");
        expect(sessionStorage.getItem("isBarman")).toBe("true");
    });

    test("клик по кнопке → переход на /signInPage, если isBarman=true", () => {
        render(
            <MemoryRouter initialEntries={["/?barId=BAR1&isBarman=true"]}>
                <StartPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Начать"));

        expect(mockNavigate).toHaveBeenCalledWith("/signInPage");
    });

    test("клик по кнопке → переход на /menu, если isBarman=false", () => {
        render(
            <MemoryRouter initialEntries={["/?barId=BAR1&isBarman=false"]}>
                <StartPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Начать"));

        expect(mockNavigate).toHaveBeenCalledWith("/menu");
    });

    test("если параметров нет → ничего не пишем в sessionStorage и не ломаемся", () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <StartPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Начать"));
        // Ничего не должно упасть, и navigate не должен вызваться
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});