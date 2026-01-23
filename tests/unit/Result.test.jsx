
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {useAuth} from "../../src/authContext/useAuth.js";
import Result from "../../src/game-pages/result-page/Result.jsx";
import {useSelector} from "react-redux";

vi.mock("../../authContext/useAuth.js", () => ({
  useAuth: vi.fn(),
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock("./CocktailCanvas", () => ({
  default: () => <div data-testid="cocktail-canvas" />,
}));

describe("Result", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(useAuth).mockReturnValue({
      isBarman: false,
      currentUser: null,
    });

    vi.mocked(useSelector).mockImplementation((selector) =>
        selector({
          game: {
            stages: {
              stage1: { score: 0 },
              stage2: { score: 0 },
              stage3: { score: 0 },
            },
          },
        })
    );
  });

  it("отображает 'Ваш результат' и кнопку 'Заказать' для обычного пользователя", () => {
    render(<Result />);

    expect(screen.getByText(/Ваш результат: 0 ★/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Заказать/i })).toBeInTheDocument();
    expect(screen.queryByText("Рейтинг")).not.toBeInTheDocument();
  });

  it("отображает ссылку 'Рейтинг' и скрывает 'Заказать' для бармена", () => {
    vi.mocked(useAuth).mockReturnValue({
      isBarman: true,
      currentUser: { login: "ivan" },
    });

    vi.mocked(useSelector).mockReturnValue(150);

    render(<Result />);

    const ratingLink = screen.getByRole("link", { name: "Рейтинг" });
    expect(ratingLink).toBeInTheDocument();
    expect(ratingLink).toHaveAttribute("href", "/top");

    expect(screen.getByText(/Рейтинг: 150 ★/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Заказать/i })).not.toBeInTheDocument();
  });

  it("отправляет очки на сервер для бармена при totalScore > 0 и currentUser.login", async () => {
    const today = new Date().toLocaleDateString();

    vi.mocked(useAuth).mockReturnValue({
      isBarman: true,
      currentUser: { id: 42, login: "ivan" },
    });

    vi.mocked(useSelector).mockReturnValue(200);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, newScore: 1622 }),
    });

    render(<Result />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
          "/api/rating/update-score",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ login: "ivan", score: 200 }),
          })
      );
    });

    expect(localStorage.getItem(`scoreSent_42_${today}`)).toBe("true");
  });

  it("не отправляет очки, если не бармен", () => {
    vi.mocked(useAuth).mockReturnValue({
      isBarman: false,
      currentUser: { login: "guest" },
    });

    vi.mocked(useSelector).mockReturnValue(300);

    render(<Result />);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("не отправляет очки, если totalScore = 0", () => {
    vi.mocked(useAuth).mockReturnValue({
      isBarman: true,
      currentUser: { login: "ivan" },
    });

    vi.mocked(useSelector).mockReturnValue(0);

    render(<Result />);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("не отправляет очки повторно в один день", async () => {
    const today = new Date().toLocaleDateString();
    localStorage.setItem(`scoreSent_42_${today}`, "true");

    vi.mocked(useAuth).mockReturnValue({
      isBarman: true,
      currentUser: { id: 42, login: "ivan" },
    });

    vi.mocked(useSelector).mockReturnValue(100);

    render(<Result />);

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  it("кнопка 'Переиграть' ведёт на /levelPage", () => {
    render(<Result />);

    fireEvent.click(screen.getByTitle("переиграть"));

    expect(navigateMock).toHaveBeenCalledWith("/levelPage");
  });

  it("кнопка 'Бар' ведёт на /menu", () => {
    render(<Result />);

    fireEvent.click(screen.getByTitle("бар"));

    expect(navigateMock).toHaveBeenCalledWith("/menu");
  });

  it("рендерит CocktailCanvas", () => {
    render(<Result />);

    expect(screen.getByTestId("cocktail-canvas")).toBeInTheDocument();
  });

  it("отображает 'Готово!' как заголовок", () => {
    render(<Result />);

    expect(screen.getByRole("heading", { name: "Готово!" })).toBeInTheDocument();
  });
});