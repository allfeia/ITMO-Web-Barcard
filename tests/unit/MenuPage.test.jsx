import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MenuPage from '../../src/menu-page/MenuPage.jsx';
import CardsGrid from '../../src/menu-page/CardsGrid.jsx';
import {AuthProvider} from "../../src/authContext/AuthContext.jsx";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: () => mockNavigate };
});

const mockUseAuth = {
    barId: 123,
    isBarman: true,
    barName: 'Olive Bar',
    barSite: 'https://olivebarandkitchen.com'
};

vi.mock('../../src/authContext/useAuth.js', async () => {
    return {
        useAuth: () => mockUseAuth
    };
});

const mockDrawUserIcon = vi.fn();
vi.mock('../../src/icons/userIcon.js', () => ({
    default: (...args) => mockDrawUserIcon(...args)
}));

vi.mock('../../src/menu-page/CardsGrid.jsx', () => ({
    default: vi.fn(({ cocktails }) => <div data-testid="cards-grid">{cocktails.length}</div>)
}));

describe('MenuPage', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('рендерит заголовок, строку поиска и ссылку на бар', () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <MenuPage />
                </MemoryRouter>
            </AuthProvider>
        );

        expect(screen.getByText(/Выберите коктейль/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Поиск/i)).toBeInTheDocument();
        expect(screen.getByText('Olive Bar')).toHaveAttribute('href', 'https://olivebarandkitchen.com');
    });

    it('рендерит иконку аккаунта и вызывает navigate при клике', () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <MenuPage />
                </MemoryRouter>
            </AuthProvider>
        );

        const canvas = screen.getByTestId('account-canvas');
        fireEvent.click(canvas);

        expect(mockNavigate).toHaveBeenCalledWith('/account');
    });

    it('вызывает drawUserIcon после рендера', async () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <MenuPage />
                </MemoryRouter>
            </AuthProvider>
        );

        await waitFor(() => {
            expect(mockDrawUserIcon).toHaveBeenCalled();
        });
    });

    it('fetch отображает коктейли в CardsGrid', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([{ name: 'Мохито' }, { name: 'Негрони' }])
            })
        );

        render(
            <AuthProvider>
                <MemoryRouter>
                    <MenuPage />
                </MemoryRouter>
            </AuthProvider>
        );

        await waitFor(() => {
            const lastCall = CardsGrid.mock.calls.at(-1)[0];
            expect(lastCall.cocktails).toEqual([{ name: 'Мохито' }, { name: 'Негрони' }]);
        });
    });

    it('поиск фильтрует коктейли — CardsGrid вызывается повторно', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([{ name: 'Мохито' }, { name: 'Негрони' }])
            })
        );

        render(
            <AuthProvider>
                <MemoryRouter>
                    <MenuPage />
                </MemoryRouter>
            </AuthProvider>
        );

        const searchInput = screen.getByPlaceholderText(/Поиск/i);
        await userEvent.type(searchInput, 'негрони');

        await waitFor(() => {
            const lastCall = CardsGrid.mock.calls.at(-1)[0];
            expect(lastCall.cocktails).toEqual([{ name: 'Негрони' }]);
        });
    });

    it('показывает сообщение, если списка коктейлей нет', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([])
            })
        );

        render(
            <AuthProvider>
                <MemoryRouter>
                    <MenuPage />
                </MemoryRouter>
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Такого коктейля нет/i)).toBeInTheDocument();
        });
    });
});
