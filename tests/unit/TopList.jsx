
import { describe, it, expect, vi, beforeEach } from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import TopList from "../../src/topList/TopList";


const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

vi.mock("../mocks/db", () => ({
    db: {
        bars: [
            { id: 123, name: "Olive Bar" },
            { id: 777, name: "Negroni Club" },
        ],
        users: [
            { login: "ivan", bar_id: 123, score: 1422 },
            { login: "alex", bar_id: 123, score: 2350 },
        ],
    },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("TopList", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem("currentBar", JSON.stringify({ id: 123 }));
    });

    it("отображает 'Загрузка рейтинга...' во время загрузки", () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ bar: { name: "Test Bar" }, rating: [] }),
        });

        render(<TopList />);

        expect(screen.getByText("Загрузка рейтинга...")).toBeInTheDocument();
    });

    it("отображает название бара и список пользователей при успешной загрузке", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                bar: { name: "Olive Bar" },
                rating: [
                    { login: "ivan", score: 1422 },
                    { login: "alex", score: 2350 },
                ],
            }),
        });

        render(<TopList />);

        await waitFor(() => {
            expect(screen.getByText("Olive Bar")).toBeInTheDocument();
            expect(screen.getByText("ivan")).toBeInTheDocument();
            expect(screen.getByText("1 422 очков")).toBeInTheDocument();
            expect(screen.getByText("alex")).toBeInTheDocument();
            expect(screen.getByText("2 350 очков")).toBeInTheDocument();
        });
    });

    it("показывает fallback данные при ошибке сети", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

        render(<TopList />);

        await waitFor(() => {
            expect(screen.getByText("Olive Bar")).toBeInTheDocument(); // fallback из db
            expect(screen.getByText(/Ошибка/i)).toBeInTheDocument();
            expect(screen.getByText("Показан резервный рейтинг")).toBeInTheDocument();
            expect(screen.getByText("alex_ivanov")).toBeInTheDocument();
            expect(screen.getByText("4 850 очков")).toBeInTheDocument();
        });
    });

    it("форматирует очки с пробелами каждые 3 цифры", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                bar: { name: "Test" },
                rating: [{ login: "test", score: 1234567 }],
            }),
        });

        render(<TopList />);

        await waitFor(() => {
            expect(screen.getByText("1 234 567 очков")).toBeInTheDocument();
        });
    });

    it("кнопка 'Назад' вызывает navigate(-1)", () => {
        render(<TopList />);

        const backButton = screen.getByTestId("back-button");
        fireEvent.click(backButton);

        expect(navigateMock).toHaveBeenCalledWith(-1);
    });

    it("ссылка на бар ведёт на /menu", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ bar: { name: "Olive Bar" }, rating: [] }),
        });

        render(<TopList />);

        await waitFor(() => {
            const barLink = screen.getByText("Olive Bar");
            expect(barLink.closest("a")).toHaveAttribute("href", "/menu");
        });
    });

    it("отображает 'Рейтинг пуст' когда пользователей нет", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ bar: { name: "Test" }, rating: [] }),
        });

        render(<TopList />);

        await waitFor(() => {
            expect(screen.getByText("Рейтинг пуст")).toBeInTheDocument();
            expect(screen.getByText("Станьте первым участником!")).toBeInTheDocument();
        });
    });
});