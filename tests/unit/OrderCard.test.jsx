import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderModal from "../../src/game-pages/OderCard.jsx"; 

vi.mock("../../src/authContext/useAuth.js", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../src/authContext/useAuth.js";

function renderModal(props = {}) {
  const onClose = vi.fn();
  const utils = render(
    <OrderModal open={true} onClose={onClose} cocktailId={2} {...props} />
  );
  return { onClose, ...utils };
}

beforeEach(() => {
  global.fetch = vi.fn();

  useAuth.mockReturnValue({ barId: 11 });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("OrderModal", () => {
  it("рендерит модалку и кнопка отправки не активна пока не указан корректный стол", () => {
    renderModal();

    const submit = screen.getByRole("button", { name: "Отправить" });
    expect(submit).toBeDisabled();

    expect(screen.getByPlaceholderText("№")).toBeInTheDocument();
  });

  it("показывает ошибку для номера стола 0 и не дает отправить", async () => {
    const user = userEvent.setup();
    renderModal();

    const tableInput = screen.getByPlaceholderText("№");
    await user.clear(tableInput);
    await user.type(tableInput, "0");
    await user.tab();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Номер стола должен быть больше нуля"
    );

    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("не принимает нечисловой ввод для стола, показывает ошибку 'только числа'", async () => {
    const user = userEvent.setup();
    renderModal();

    const tableInput = screen.getByPlaceholderText("№");
    await user.clear(tableInput);
    await user.type(tableInput, "abc");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Поле может содержать только числа"
    );
    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
  });

  it("увеличение количества кнопкой ограничивается 10 и показывает сообщение про максимум", async () => {
    const user = userEvent.setup();
    renderModal();

    const inc = screen.getByRole("button", { name: /increase/i });
    for (let i = 0; i < 9; i++) {
      await user.click(inc);
    }
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Максимально можно заказать 10 коктелей"
    );

    await user.click(inc);
    const qtyInputs = screen.getAllByRole("textbox");
    expect(qtyInputs[1]).toHaveValue("10");
  });

  it("ручной ввод количества > 10 на blur приводит к 10 и показывает ошибку про максимум", async () => {
    const user = userEvent.setup();
    renderModal();

    const qtyInputs = screen.getAllByRole("textbox");
    const qtyInput = qtyInputs[1];

    await user.clear(qtyInput);
    await user.type(qtyInput, "999");
    await user.tab(); 

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Максимально можно заказать 10 коктелей"
    );
    expect(qtyInput).toHaveValue("10");
  });

  it("успешная отправка: вызывает fetch с правильным payload, закрывает модалку, показывает 'Заказ отправлен'", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal({ cocktailId: 7 });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    const tableInput = screen.getByPlaceholderText("№");
    await user.clear(tableInput);
    await user.type(tableInput, "5");


    const submit = screen.getByRole("button", { name: "Отправить" });
    expect(submit).toBeEnabled();

    await user.click(submit);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/order",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barId: 11,
          cocktailId: 7,
          tableNumber: "5",
          quantity: 1,
        }),
      })
    );

    await waitFor(() => expect(onClose).toHaveBeenCalled());

    expect(await screen.findByText("Заказ отправлен")).toBeInTheDocument();
  });

  it("ошибка от сервера: показывает текст ошибки и не показывает success snackbar", async () => {
    const user = userEvent.setup();
    renderModal();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "Плохой запрос" }),
    });

    const tableInput = screen.getByPlaceholderText("№");
    await user.clear(tableInput);
    await user.type(tableInput, "3");

    await user.click(screen.getByRole("button", { name: "Отправить" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Плохой запрос");
    expect(screen.queryByText("Заказ отправлен")).not.toBeInTheDocument();
  });

  it("если barId отсутствует, отправка недоступна", async () => {
    useAuth.mockReturnValueOnce({ barId: null });

    const user = userEvent.setup();
    renderModal();

    const tableInput = screen.getByPlaceholderText("№");
    await user.type(tableInput, "1");

    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});