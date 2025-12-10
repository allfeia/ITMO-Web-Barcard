import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StartPage from "../../src/start-page/StartPage.jsx";
import { vi } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

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
        roundRect: vi.fn(),
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

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(ctxMock);

    Object.defineProperty(HTMLCanvasElement.prototype, "width", { writable: true, value: 75 });
    Object.defineProperty(HTMLCanvasElement.prototype, "height", { writable: true, value: 75 });
});

beforeEach(() => {
    sessionStorage.clear();
    mockNavigate.mockReset();
});

describe("StartPage", () => {
    test("чтение URL параметров и запись в sessionStorage", async () => {
        render(
            <MemoryRouter initialEntries={["/?barId=BAR123&isBarman=true"]}>
                <StartPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(sessionStorage.getItem("barId")).toBe("BAR123");
            expect(sessionStorage.getItem("isBarman")).toBe("true");
        });
    });

    test("клик по кнопке → переход на /signInPage, если isBarman=true", async () => {
        render(
            <MemoryRouter initialEntries={["/?barId=BAR1&isBarman=true"]}>
                <StartPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(sessionStorage.getItem("isBarman")).toBe("true");
        });

        fireEvent.click(screen.getByText("Начать"));

        expect(mockNavigate).toHaveBeenCalledWith("/signInPage");
    });

    test("клик по кнопке → переход на /menu, если isBarman=false", async () => {
        render(
            <MemoryRouter initialEntries={["/?barId=BAR1&isBarman=false"]}>
                <StartPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(sessionStorage.getItem("isBarman")).toBe("false");
        });

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
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});