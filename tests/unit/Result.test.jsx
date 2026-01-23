import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Result from "../../src/game-pages/result-page/Result.jsx";

vi.mock("../../src/authContext/useAuth.js", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../src/game-pages/OderCard.jsx", () => ({
  default: ({ open, onClose, cocktailId }) => (
    <div data-testid="order-modal">
      <div data-testid="open">{String(open)}</div>
      <div data-testid="cocktailId">{String(cocktailId)}</div>
      <button onClick={onClose}>close</button>
    </div>
  ),
}));

const { useAuth } = await import("../../src/authContext/useAuth.js");

describe("Result", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("рендерит заголовок", () => {
    useAuth.mockReturnValue({ roles: [] });

    render(<Result />);

    expect(screen.getByRole("heading", { name: /result/i })).toBeInTheDocument();
  });

  it("показывает кнопку 'Заказать' для пользователя без ролей staff/bar_admin", () => {
    useAuth.mockReturnValue({ roles: ["user"] });

    render(<Result />);

    expect(
      screen.getByRole("button", { name: "Заказать" })
    ).toBeInTheDocument();
  });

  it("скрывает кнопку 'Заказать' для staff", () => {
    useAuth.mockReturnValue({ roles: ["staff"] });

    render(<Result />);

    expect(
      screen.queryByRole("button", { name: "Заказать" })
    ).not.toBeInTheDocument();
  });

  it("скрывает кнопку 'Заказать' для bar_admin", () => {
    useAuth.mockReturnValue({ roles: ["bar_admin"] });

    render(<Result />);

    expect(
      screen.queryByRole("button", { name: "Заказать" })
    ).not.toBeInTheDocument();
  });

  it("открывает модалку по клику 'Заказать' и прокидывает cocktailId=2", () => {
    useAuth.mockReturnValue({ roles: ["user"] });

    render(<Result />);

    expect(screen.getByTestId("open")).toHaveTextContent("false");
    expect(screen.getByTestId("cocktailId")).toHaveTextContent("2");

    fireEvent.click(screen.getByRole("button", { name: "Заказать" }));

    expect(screen.getByTestId("open")).toHaveTextContent("true");
  });

  it("закрывает модалку по onClose (кнопка close в мокнутой модалке)", () => {
    useAuth.mockReturnValue({ roles: ["user"] });

    render(<Result />);

    fireEvent.click(screen.getByRole("button", { name: "Заказать" }));
    expect(screen.getByTestId("open")).toHaveTextContent("true");

    fireEvent.click(screen.getByRole("button", { name: "close" }));
    expect(screen.getByTestId("open")).toHaveTextContent("false");
  });

  it("корректно работает, если roles приходит строкой", () => {
    useAuth.mockReturnValue({ roles: "staff" });

    render(<Result />);

    expect(
      screen.queryByRole("button", { name: "Заказать" })
    ).not.toBeInTheDocument();
  });

  it("корректно работает, если roles = null/undefined", () => {
    useAuth.mockReturnValue({ roles: null });

    render(<Result />);

    expect(
      screen.getByRole("button", { name: "Заказать" })
    ).toBeInTheDocument();
  });
});