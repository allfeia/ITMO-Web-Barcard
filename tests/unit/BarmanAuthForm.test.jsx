import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BarmanAuthForm from "../../src/sign-in-page/BarmanAuthForm.jsx";
import { AuthProvider } from "../../src/authContext/AuthContext.jsx";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();
const mockSetToken = vi.fn();
const mockSetRoles = vi.fn();
const mockSetBarName = vi.fn();
const mockSetBarSite = vi.fn();
const mockSetSavedCocktailsId = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../src/authContext/useAuth.js", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useAuth: () => ({
            setToken: mockSetToken,
            setRoles: mockSetRoles,
            setBarName: mockSetBarName,
            setBarSite: mockSetBarSite,
            setSavedCocktailsId: mockSetSavedCocktailsId
        }),
    };
});

describe('BarmanAuthForm', () => {

    beforeEach(() => {
        sessionStorage.clear();
        mockNavigate.mockClear();
        mockSetToken.mockClear();
        mockSetRoles.mockClear();
        mockSetBarName.mockClear();
        mockSetBarSite.mockClear();
        vi.restoreAllMocks();
    });

    it('рендерит все поля и кнопку', () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <BarmanAuthForm />
                </MemoryRouter>
            </AuthProvider>
        );

        expect(screen.getByLabelText(/Почта \/ Логин \/ Имя/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Барный ключ/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument();
    });

    it('показывает ошибки при пустой форме', async () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <BarmanAuthForm />
                </MemoryRouter>
            </AuthProvider>
        );

        await userEvent.click(screen.getByRole('button', { name: /Войти/i }));

        expect(await screen.findByText(/Введите почту \/ логин \/ имя/i)).toBeInTheDocument();
        expect(screen.getByText(/Введите пароль/i)).toBeInTheDocument();
        expect(screen.getByText(/Введите ключ бара/i)).toBeInTheDocument();
    });

    it('показывает ошибку при отсутствии barId', async () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <BarmanAuthForm />
                </MemoryRouter>
            </AuthProvider>
        );

        await userEvent.type(screen.getByLabelText(/Почта \/ Логин \/ Имя/i, { selector: 'input' }), 'user');
        await userEvent.type(screen.getByLabelText(/Пароль/i, { selector: 'input' }), 'pass');
        await userEvent.type(screen.getByLabelText(/Барный ключ/i, { selector: 'input' }), 'key');

        const consoleSpy = vi.spyOn(console, 'log');
        await userEvent.click(screen.getByRole('button', { name: /Войти/i }));

        expect(consoleSpy).toHaveBeenCalledWith("Ошибка: barId не найден. QR не был сканирован.");
    });

    it('показывает ошибку при неверном пароле', async () => {
        sessionStorage.setItem("barId", "1");

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                status: 403,
                json: () => Promise.resolve({
                    error: { password: "Неверный пароль" },
                }),
            })
        );

        render(
            <AuthProvider>
                <MemoryRouter>
                    <BarmanAuthForm />
                </MemoryRouter>
            </AuthProvider>
        );

        await userEvent.type(screen.getByLabelText(/Почта \/ Логин \/ Имя/i, { selector: 'input' }), 'user');
        await userEvent.type(screen.getByLabelText(/Пароль/i, { selector: 'input' }), 'wrongpass');
        await userEvent.type(screen.getByLabelText(/Барный ключ/i, { selector: 'input' }), 'key');

        await userEvent.click(screen.getByRole('button', { name: /Войти/i }));

        expect(await screen.findByText(/Неверный пароль/i)).toBeInTheDocument();
    });

    it('показывает ошибку при неверном барном ключе', async () => {
        sessionStorage.setItem("barId", "1");

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                status: 403,
                json: () => Promise.resolve({
                    error: { barKey: "Неверный барный ключ" }
                }),
            })
        );

        render(
            <AuthProvider>
                <MemoryRouter>
                    <BarmanAuthForm />
                </MemoryRouter>
            </AuthProvider>
        );

        await userEvent.type(screen.getByLabelText(/Почта \/ Логин \/ Имя/i, { selector: 'input' }), 'user');
        await userEvent.type(screen.getByLabelText(/Пароль/i, { selector: 'input' }), '123456');
        await userEvent.type(screen.getByLabelText(/Барный ключ/i, { selector: 'input' }), 'wrongkey');

        await userEvent.click(screen.getByRole('button', { name: /Войти/i }));

        expect(await screen.findByText(/Неверный барный ключ/i)).toBeInTheDocument();
    });


    it('успешный вход вызывает setToken, setRoles и navigate', async () => {
        sessionStorage.setItem("barId", "1");

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ token: '123', user: { roles: ['BARMAN'] } }),
            })
        );

        render(
            <AuthProvider>
                <MemoryRouter>
                    <BarmanAuthForm />
                </MemoryRouter>
            </AuthProvider>
        );

        await userEvent.type(screen.getByLabelText(/Почта \/ Логин \/ Имя/i, { selector: 'input' }), 'user');
        await userEvent.type(screen.getByLabelText(/Пароль/i, { selector: 'input' }), '123456');
        await userEvent.type(screen.getByLabelText(/Барный ключ/i, { selector: 'input' }), 'key');

        await userEvent.click(screen.getByRole('button', { name: /Войти/i }));

        expect(global.fetch).toHaveBeenCalledWith("/api/barman/auth", expect.objectContaining({
            method: "POST",
        }));

        await waitFor(() => {
            expect(mockSetToken).toHaveBeenCalledWith('123');
            expect(mockSetRoles).toHaveBeenCalledWith(['BARMAN']);
            expect(mockNavigate).toHaveBeenCalledWith("/menu");
        });
    });

    it('переключает видимость пароля и барного ключа', async () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <BarmanAuthForm />
                </MemoryRouter>
            </AuthProvider>
        );

        const passwordInput = screen.getByLabelText(/Пароль/i, { selector: 'input' });
        const keyInput = screen.getByLabelText(/Барный ключ/i, { selector: 'input' });

        const passwordButton = within(passwordInput.closest('.MuiFormControl-root')).getByRole('button');
        const keyButton = within(keyInput.closest('.MuiFormControl-root')).getByRole('button');

        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(keyInput).toHaveAttribute('type', 'password');

        await userEvent.click(passwordButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        await userEvent.click(passwordButton);
        expect(passwordInput).toHaveAttribute('type', 'password');

        await userEvent.click(keyButton);
        expect(keyInput).toHaveAttribute('type', 'text');

        await userEvent.click(keyButton);
        expect(keyInput).toHaveAttribute('type', 'password');
    });

});
