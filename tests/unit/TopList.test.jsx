import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import {useAuth} from "../../src/authContext/useAuth.js";
import TopList from "../../src/topList/TopList.jsx";


vi.mock("../authContext/useAuth.js", () => {
    const useAuth = vi.fn();
    return { useAuth };
});

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

const windowOpenMock = vi.fn();
vi.stubGlobal("open", windowOpenMock);

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("TopList", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useAuth).mockReturnValue({
            barId: 123,
            barName: "Olive Bar",
            barSite: "https://olivebarandkitchen.com",
        });
    });

    it("отображает 'Загрузка рейтинга...' во время загрузки", () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ rating: [] }),
        });

        render(<TopList />);

        expect(screen.getByText("Загрузка рейтинга...")).toBeInTheDocument();
    });

    it("отображает название бара и список пользователей при успешной загрузке", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
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

    it("показывает сообщение об ошибке при ошибке сети", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

        render(<TopList />);

        await waitFor(() => {
            expect(screen.getByText(/Не удалось загрузить рейтинг|Ошибка/i)).toBeInTheDocument();
        });
    });

    it("форматирует очки с пробелами каждые 3 цифры", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
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

    it("название бара является ссылкой на barSite и открывает в новой вкладке", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ rating: [] }),
        });

        render(<TopList />);

        await waitFor(() => {
            const barLink = screen.getByText("Olive Bar");
            expect(barLink.tagName).toBe("A");
            expect(barLink).toHaveAttribute("href", "https://olivebarandkitchen.com");
            expect(barLink).toHaveAttribute("target", "_blank");
            expect(barLink).toHaveAttribute("rel", "noopener noreferrer");

            fireEvent.click(barLink);
            expect(windowOpenMock).toHaveBeenCalledWith(
                "https://olivebarandkitchen.com",
                "_blank",
                "noopener,noreferrer"
            );
        });
    });

    it("если barSite нет — название бара отображается как текст без ссылки", async () => {
        vi.mocked(useAuth).mockReturnValue({
            barId: 123,
            barName: "Test Bar",
            barSite: null,
        });

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ rating: [] }),
        });

        render(<TopList />);

        await waitFor(() => {
            const barText = screen.getByText("Test Bar");
            expect(barText.tagName).not.toBe("A"); // это <span>
            expect(barText).toBeInTheDocument();
        });
    });

    it("отображает 'Рейтинг пуст' когда пользователей нет", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ rating: [] }),
        });

        render(<TopList />);

        await waitFor(() => {
            expect(screen.getByText("Рейтинг пуст")).toBeInTheDocument();
            expect(screen.getByText("Станьте первым участником!")).toBeInTheDocument();
        });
    });

    it("показывает ошибку, если barId отсутствует в контексте", () => {
        vi.mocked(useAuth).mockReturnValue({
            barId: null,
            barName: "Test",
            barSite: null,
        });

        render(<TopList />);

        expect(screen.getByText("ID бара не найден")).toBeInTheDocument();
        expect(mockFetch).not.toHaveBeenCalled();
    });
});