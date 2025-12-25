import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StartPage from "../../src/start-page/StartPage.jsx";
import { vi } from "vitest";
import AuthContext from "../../src/authContext/AuthContext.jsx";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("../glasses/BlueGlass.js", () => ({ drawBlueGlass: vi.fn() }));
vi.mock("../glasses/PinkGlass.js", () => ({ drawPinkGlass: vi.fn() }));
vi.mock("../glasses/RedGlass.js", () => ({ drawRedGlass: vi.fn() }));
vi.mock("../glasses/YellowGlass.js", () => ({ drawYellowGlass: vi.fn() }));

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
    delete window.location;
    window.location = new URL("http://localhost/");
});

const renderWithAuth = (component, initialUrl = "/") => {
    return render(
        <AuthContext.Provider
            value={{
                setBarId: vi.fn(),
                setIsBarman: vi.fn(),
                token: null,
                roles: [],
                barId: null,
                isBarman: null,
            }}
        >
            <MemoryRouter initialEntries={[initialUrl]}>
                {component}
            </MemoryRouter>
        </AuthContext.Provider>
    );
};

describe("StartPage", () => {
    test("чтение URL параметров и запись в sessionStorage", async () => {
        window.location = new URL("http://localhost/?barId=BAR123&isBarman=true");

        renderWithAuth(<StartPage />);

        await waitFor(() => {
            expect(sessionStorage.getItem("barId")).toBe("BAR123");
            expect(sessionStorage.getItem("isBarman")).toBe("true");
        });
    });

    test("клик по кнопке → переход на /signInPage, если isBarman=true", async () => {
        window.location = new URL("http://localhost/?barId=123&isBarman=true");

        renderWithAuth(<StartPage />);

        await waitFor(() => expect(sessionStorage.getItem("isBarman")).toBe("true"));

        fireEvent.click(screen.getByText("Начать"));
        expect(mockNavigate).toHaveBeenCalledWith("/signInPage");
    });

    test("клик по кнопке → переход на /menu, если isBarman=false", async () => {
        window.location = new URL("http://localhost/?barId=123&isBarman=false");

        renderWithAuth(<StartPage />);

        await waitFor(() => expect(sessionStorage.getItem("isBarman")).toBe("false"));

        fireEvent.click(screen.getByText("Начать"));
        expect(mockNavigate).toHaveBeenCalledWith("/menu");
    });

    test("если параметров нет → ничего не пишем в sessionStorage и не ломаемся", () => {
        window.location = new URL("http://localhost/");

        renderWithAuth(<StartPage />);

        expect(screen.getByText("Пожалуйста, отсканируйте QR-код, чтобы продолжить")).toBeInTheDocument();

        expect(sessionStorage.getItem("barId")).toBeNull();
        expect(sessionStorage.getItem("isBarman")).toBeNull();
    });
});