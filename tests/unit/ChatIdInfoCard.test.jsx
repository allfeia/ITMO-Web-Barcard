
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatIdInfoModal from "./ChatIdInfoCard";
import ChatIdInfoCard from "../../src/admin/bar-admin/ChatIdInfoCard.jsx"

describe("ChatIdInfoModal", () => {
  it("не рендерится, когда open=false", () => {
    render(<ChatIdInfoModal open={false} onClose={vi.fn()} />);

    expect(
      screen.queryByText("Как получить ID чата в Telegram")
    ).not.toBeInTheDocument();
  });

  it("рендерится, когда open=true, и показывает шаги", () => {
    render(<ChatIdInfoModal open={true} onClose={vi.fn()} />);

    expect(
      screen.getByText("Как получить ID чата в Telegram")
    ).toBeInTheDocument();

    expect(screen.getByText("1. Создайте группу в Телеграм")).toBeInTheDocument();

    expect(
      screen.getByText(/2\. Добавьте в созданную группу бот/i)
    ).toBeInTheDocument();

    expect(screen.getByText("3. Напишите команду /chatid")).toBeInTheDocument();

    expect(
      screen.getByText('4. Скопируйте значение и вставьте в поле "ID чата в Telegram"')
    ).toBeInTheDocument();

    expect(
      screen.getByText("Обратите внимание ID группы может быть отрицательным числом")
    ).toBeInTheDocument();
  });

  it("содержит ссылку на бота с корректным href", () => {
    render(<ChatIdInfoModal open={true} onClose={vi.fn()} />);

    const link = screen.getByRole("link", { name: "@BarcardOders_bot" });
    expect(link).toHaveAttribute("href", "https://t.me/BarcardOders_bot");
  });

  it("вызывает onClose при клике на кнопку закрытия", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ChatIdInfoModal open={true} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("вызывает onClose при нажатии Escape (закрытие Dialog)", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ChatIdInfoModal open={true} onClose={onClose} />);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});