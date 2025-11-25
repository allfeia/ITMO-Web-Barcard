import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BarmanAuthForm from "../BarmanAuthForm";
import {MemoryRouter} from "react-router-dom";

test("shows validation messages when submitting empty form", async () => {
    render(
        <MemoryRouter>
            <BarmanAuthForm />
        </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /войти/i });

    await userEvent.click(button);

    expect(screen.getByText("Введите почту / логин / имя")).toBeInTheDocument();
    expect(screen.getByText("Введите пароль")).toBeInTheDocument();
    expect(screen.getByText("Введите ключ бара")).toBeInTheDocument();
});
