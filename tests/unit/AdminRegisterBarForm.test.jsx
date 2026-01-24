import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminRegisterBarForm from "../../src/admin/super-admin/AdminRegisterBarForm.jsx";

const goToMock = vi.fn();
const apiFetchMock = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => goToMock,
  };
});

vi.mock("../../src/apiFetch.js", () => ({
  useApiFetch: () => apiFetchMock,
}));

vi.mock("../../src/admin/super-admin/ChatIdInfoCard.jsx", () => ({
  default: ({ open, onClose }) =>
    open ? (
      <div role="dialog" aria-label="chat-id-info">
        <button onClick={onClose}>close</button>
      </div>
    ) : null,
}));

describe("AdminRegisterBarForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function fillBase({ name = "Бар 1", barKey = "key123", chatId = "123" } = {}) {
    fireEvent.change(screen.getByLabelText("Название бара"), {
      target: { value: name },
    });
    fireEvent.change(screen.getByLabelText("Ключ бара"), {
      target: { value: barKey },
    });
    fireEvent.change(screen.getByLabelText("ID чата в Telegram"), {
      target: { value: chatId },
    });
  }

  it("валидация: пустое имя/ключ/chatId, некорректный URL", async () => {
    render(<AdminRegisterBarForm />);

    fireEvent.click(screen.getByRole("button", { name: "Создать бар" }));

    expect(await screen.findByText("Введите название бара")).toBeInTheDocument();
    expect(screen.getByText("Введите ключ бара")).toBeInTheDocument();
    expect(screen.getByText("Введите ID чата в Telegram")).toBeInTheDocument();
    expect(apiFetchMock).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Название бара"), {
      target: { value: "Бар" },
    });
    fireEvent.change(screen.getByLabelText("Web‑site (URL)"), {
      target: { value: "not-a-url" },
    });
    fireEvent.change(screen.getByLabelText("Ключ бара"), {
      target: { value: "k" },
    });
    fireEvent.change(screen.getByLabelText("ID чата в Telegram"), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Создать бар" }));

    expect(await screen.findByText("Некорректный URL")).toBeInTheDocument();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("валидация: chatId должен быть числом (поддерживает отрицательные)", async () => {
    render(<AdminRegisterBarForm />);

    fillBase({ chatId: "abc" });
    fireEvent.click(screen.getByRole("button", { name: "Создать бар" }));
    expect(await screen.findByText("ID чата в Telegram должен быть числом")).toBeInTheDocument();
    expect(apiFetchMock).not.toHaveBeenCalled();
    apiFetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: "ok" }),
    });

    fillBase({ chatId: "-100" });
    fireEvent.click(screen.getByRole("button", { name: "Создать бар" }));

    await waitFor(() => expect(apiFetchMock).toHaveBeenCalled());
  });

  it("успешный POST и сообщение ok", async () => {
    apiFetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: "Бар создан: Бар 1", name: "Бар 1" }),
    });

    render(<AdminRegisterBarForm />);
    fillBase({ name: "Бар 1", barKey: "key123", chatId: "777" });

    fireEvent.click(screen.getByRole("button", { name: "Создать бар" }));

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith(
        "/api/admin/bars",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            name: "Бар 1",
            address: undefined,
            description: undefined,
            website: undefined,
            barKey: "key123",
            chatId: 777,
          }),
        })
      );
    });

    expect(await screen.findByText(/Бар создан/)).toBeInTheDocument();
  });

  it("обрабатывает 401, 403 и 400 (ключ)", async () => {
    // 401
    apiFetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Не авторизовано" }),
    });

    render(<AdminRegisterBarForm />);
    fillBase();
    fireEvent.click(screen.getByRole("button", { name: "Создать бар" }));
    expect(await screen.findByText("Не авторизовано")).toBeInTheDocument();

    // 403
    apiFetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: "Доступ запрещён" }),
    });

    render(<AdminRegisterBarForm />);
    fillBase();
    fireEvent.click(screen.getByRole("button", { name: "Создать бар" }));
    expect(await screen.findByText("Доступ запрещён")).toBeInTheDocument();

    // 400 с ключом (в компоненте при наличии слова "ключ" -> barKeyError)
    apiFetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "Некорректный ключ бара" }),
    });

    render(<AdminRegisterBarForm />);
    fillBase();
    fireEvent.click(screen.getByRole("button", { name: "Создать бар" }));
    expect(await screen.findByText("Некорректный ключ бара")).toBeInTheDocument();
  });
});