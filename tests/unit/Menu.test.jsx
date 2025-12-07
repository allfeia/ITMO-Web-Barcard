import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Menu from '../../src/menu-page/Menu.jsx';
import CardsGrid from '../../src/menu-page/CardsGrid.jsx';
import {AuthProvider} from "../../src/authContext/AuthContext.jsx";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: () => mockNavigate };
});

const mockUseAuth = {
    barName: 'Olive Bar',
    barSite: 'https://olivebarandkitchen.com'
};

vi.mock('../../src/authContext/useAuth.js', async () => {
    return {
        useAuth: () => mockUseAuth
    };
});

vi.mock('../../src/menu-page/CardsGrid.jsx', () => ({
    default: vi.fn(({ cocktails }) => <div data-testid="cards-grid">{cocktails.length}</div>)
}));

vi.mock('../../src/icons/userIcon.js', () => ({
    default: vi.fn()
}));

describe('Menu page', () => {

    beforeEach(() => {
        sessionStorage.clear();
        vi.clearAllMocks();
        mockUseAuth.barName = 'Olive Bar';
        mockUseAuth.barSite = 'https://olivebarandkitchen.com';
    });

    it('рендерит заголовки и поля поиска', () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <Menu />
                </MemoryRouter>
            </AuthProvider>
        );

        expect(screen.getByText(/Выберете/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Поиск/i)).toBeInTheDocument();
        expect(screen.getByText('Olive Bar')).toHaveAttribute('href', 'https://olivebarandkitchen.com');
    });

    it('клик по canvas перекидывает на сайт', async () => {
        sessionStorage.setItem('isBarman', 'true');

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Menu />
                </MemoryRouter>
            </AuthProvider>
        );

        const canvas = screen.getByTestId('account-canvas');
        fireEvent.click(canvas);
        expect(mockNavigate).toHaveBeenCalledWith('/account');
    });

    it('fetch и отображение коктейлей', async () => {
        sessionStorage.setItem('barId', '1');

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([{ name: 'Мохито' }, { name: 'Негрони' }])
            })
        );

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Menu />
                </MemoryRouter>
            </AuthProvider>
        );

        await waitFor(() => {
            const props = CardsGrid.mock.calls[CardsGrid.mock.calls.length - 1][0];
            expect(props.cocktails).toEqual([{ name: 'Мохито' }, { name: 'Негрони' }]);
        });
    });

    it('поиск фильтрует коктейли', async () => {
        sessionStorage.setItem('barId', '1');

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([{ name: 'Мохито' }, { name: 'Негрони' }])
            })
        );

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Menu />
                </MemoryRouter>
            </AuthProvider>
        );

        const searchInput = screen.getByPlaceholderText(/Поиск/i);
        await userEvent.type(searchInput, 'Негрони');

        await waitFor(() => {
            const props = CardsGrid.mock.calls[CardsGrid.mock.calls.length - 1][0];
            expect(props.cocktails).toEqual([{ name: 'Негрони' }]);
        });
    });

    it('показывает сообщение если коктейлей нет', async () => {
        sessionStorage.setItem('barId', '1');

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            })
        );

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Menu />
                </MemoryRouter>
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Такого коктейля нет :\(/)).toBeInTheDocument();
        });
    });
});
