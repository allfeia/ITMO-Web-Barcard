import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App.jsx";

describe("App component", () => {
  it("должен отобразить заголовок и кнопку", () => {
    render(<App />);

    // Проверяем заголовок
    expect(screen.getByText(/Vite \+ React/i)).toBeInTheDocument();

    // Проверяем кнопку
    const button = screen.getByRole("button", { name: /count is 0/i });
    expect(button).toBeInTheDocument();
  });

  // it("должен увеличивать счётчик при клике", () => {
  //   render(<App />);

  //   const button = screen.getByRole("button", { name: /count is 0/i });
  //   fireEvent.click(button);

  //   expect(
  //     screen.getByRole("button", { name: /count is 1/i }),
  //   ).toBeInTheDocument();
  // });
});
