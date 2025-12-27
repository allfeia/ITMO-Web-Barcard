import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import PasswordPage from "../../src/password-page/PasswordPage.jsx";

const navigateMock = vi.fn();
let locationState = { search: "", hash: "" };

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => locationState,
  };
});

const setBarIdMock = vi.fn();
const setRolesMock = vi.fn();
const setIsBarmanMock = vi.fn();

vi.mock("../../src/authContext/useAuth.js", () => ({
  useAuth: () => ({
    setBarId: setBarIdMock,
    setRoles: setRolesMock,
    setIsBarman: setIsBarmanMock,
  }),
}));

function mockFetchOnce({ ok = true, json = {}, status = 200 } = {}) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(json),
  });
}

function setModeReset() {
  locationState = { search: "?mode=reset", hash: "" };
}

function setModeInviteNoToken() {
  locationState = { search: "?mode=invite", hash: "" };
}

function setModeInviteWithToken(token = "t123") {
  locationState = { search: "", hash: `#mode=invite&token=${encodeURIComponent(token)}` };
}

describe("PasswordPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigateMock.mockReset();
    setBarIdMock.mockReset();
    setRolesMock.mockReset();
    setIsBarmanMock.mockReset();
    global.fetch = vi.fn();
    locationState = { search: "", hash: "" };
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("рендерит заголовок для reset", () => {
    setModeReset();
    render(<PasswordPage />);
    expect(screen.getByText("Смена пароля")).toBeInTheDocument();
  });

  it("рендерит заголовок для invite", () => {
    setModeInviteNoToken();
    render(<PasswordPage />);
    expect(screen.getByText("Установка пароля")).toBeInTheDocument();
  });

  it("в режиме reset поле кода принимает только цифры и обрезает до 6 символов", () => {
    setModeReset();
    render(<PasswordPage />);

    const codeInput = screen.getByLabelText("Код из письма");
    fireEvent.change(codeInput, { target: { value: "12ab34-56xx78" } });
    expect(codeInput).toHaveValue("123456");
  });

  it("кнопка Сохранить пароль отключена пока невалидные данные (reset)", () => {
    setModeReset();
    render(<PasswordPage />);

    const submit = screen.getByRole("button", { name: "Сохранить пароль" });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Код из письма"), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "1234567" } });
    fireEvent.change(screen.getByLabelText("Подтверждение пароля"), { target: { value: "1234567" } });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByLabelText("Подтверждение пароля"), { target: { value: "12345678" } });
    expect(submit).toBeEnabled();
  });

  it("успешный reset: отправляет confirm-code, показывает сообщение и редиректит на /account через 10 сек", async () => {
    setModeReset();
    mockFetchOnce({ ok: true, json: {} });

    render(<PasswordPage />);

    fireEvent.change(screen.getByLabelText("Код из письма"), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByLabelText("Подтверждение пароля"), { target: { value: "12345678" } });

    fireEvent.click(screen.getByRole("button", { name: "Сохранить пароль" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/password/confirm-code", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code: "123456", password: "12345678" }),
    }));

    await screen.findByText("Пароль успешно установлен");

    expect(screen.getByText(/Возвращение в аккаунт произойдет через 10 сек\./)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/account", { replace: true });
    });
  });

  it("ошибка reset: показывает сообщение из ответа сервера", async () => {
    setModeReset();
    mockFetchOnce({ ok: false, json: { message: "bad code" } });

    render(<PasswordPage />);

    fireEvent.change(screen.getByLabelText("Код из письма"), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByLabelText("Подтверждение пароля"), { target: { value: "12345678" } });

    fireEvent.click(screen.getByRole("button", { name: "Сохранить пароль" }));

    await screen.findByText("bad code");
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("повторная отправка кода (reset): вызывает request-reset и включает кулдаун", async () => {
    setModeReset();
    mockFetchOnce({ ok: true, json: {} });

    render(<PasswordPage />);

    const link = screen.getByText("Отправить письмо с кодом повторно");
    fireEvent.click(link);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(global.fetch).toHaveBeenCalledWith("/api/password/request-reset", expect.objectContaining({
      method: "POST",
      credentials: "include",
    }));

    expect(screen.getByText(/Повторная отправка кода будет доступна через 30 сек\./)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Повторная отправка кода будет доступна через 30 сек\./));
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/через 29 сек\./)).toBeInTheDocument();
  });

  it("invite с token в hash: запрашивает invite session и удаляет hash (replaceState)", async () => {
    setModeInviteWithToken("abc");
    mockFetchOnce({ ok: true, json: {} });
    const replaceSpy = vi.spyOn(window.history, "replaceState");

    render(<PasswordPage />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(global.fetch).toHaveBeenCalledWith("/api/password/invite/session", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token: "abc" }),
    }));

    await waitFor(() => expect(replaceSpy).toHaveBeenCalledTimes(1));
    replaceSpy.mockRestore();
  });

  it("invite без token: позволяет отправить пароль без кода и делает редирект на /signInPage через 10 сек, выставляет auth поля", async () => {
    setModeInviteNoToken();
    mockFetchOnce({ ok: true, json: { barId: "b1", roles: ["admin"] } });

    render(<PasswordPage />);

    const submit = screen.getByRole("button", { name: "Сохранить пароль" });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByLabelText("Подтверждение пароля"), { target: { value: "12345678" } });

    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(global.fetch).toHaveBeenCalledWith("/api/password/confirm", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password: "12345678" }),
    }));

    await screen.findByText("Пароль успешно установлен");

    expect(setBarIdMock).toHaveBeenCalledWith("b1");
    expect(setRolesMock).toHaveBeenCalledWith(["admin"]);
    expect(setIsBarmanMock).toHaveBeenCalledWith(true);

    expect(screen.getByText(/Переход на страницу авторизации произойдет через 10 сек\./)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/signInPage", { replace: true });
    });
  });

  it("повторная отправка приглашения (invite): вызывает request-invite-again и включает кулдаун", async () => {
    setModeInviteNoToken();
    mockFetchOnce({ ok: true, json: {} });

    render(<PasswordPage />);

    const link = screen.getByText("Отправить приглашение повторно");
    fireEvent.click(link);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(global.fetch).toHaveBeenCalledWith("/api/password/request-invite-again", expect.objectContaining({
      method: "POST",
      credentials: "include",
    }));

    expect(screen.getByText(/Повторная отправка будет доступна через 30 сек\./)).toBeInTheDocument();
  });
});