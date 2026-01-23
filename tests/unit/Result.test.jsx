import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as authHook from '../../src/authContext/useAuth';
import Result from "../../src/game-pages/result-page/Result.jsx";
import gameReducer from "../../src/game/gameSlice";
vi.mock('../../src/authContext/useAuth');

vi.mock('../../src/game-pages/result-page/CocktailCanvas', () => ({
  default: () => <div data-testid="cocktail-canvas" />,
}));

const mockedUseAuth = vi.mocked(authHook.useAuth);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createTestStore = (initialState = {}) =>
    configureStore({
      reducer: { game: gameReducer },
      preloadedState: { game: initialState },
    });

describe('Result', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("отображает 'Готово!' как заголовок", () => {
    mockedUseAuth.mockReturnValue({ isBarman: false, currentUser: null });

    const store = createTestStore({
      stages: { stage1: { score: 10 }, stage2: {}, stage3: {} },
    });

    render(
        <Provider store={store}>
          <MemoryRouter>
            <Result />
          </MemoryRouter>
        </Provider>
    );

    expect(screen.getByText('Готово!')).toBeInTheDocument();
  });

  it("отображает 'Ваш результат' и кнопку 'Заказать' для обычного пользователя", () => {
    mockedUseAuth.mockReturnValue({ isBarman: false, currentUser: null });

    const store = createTestStore({
      stages: { stage1: { score: 40 }, stage2: { score: 30 }, stage3: {} },
    });

    render(
        <Provider store={store}>
          <MemoryRouter>
            <Result />
          </MemoryRouter>
        </Provider>
    );

    expect(screen.getByText('Ваш результат: 70 ★')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Заказать/i })).toBeInTheDocument();
  });

  it("отображает ссылку 'Рейтинг' и скрывает 'Заказать' для бармена", () => {
    mockedUseAuth.mockReturnValue({
      isBarman: true,
      currentUser: { login: 'bartender1', id: 777 },
    });

    const store = createTestStore({
      stages: { stage1: { score: 100 } },
    });

    render(
        <Provider store={store}>
          <MemoryRouter>
            <Result />
          </MemoryRouter>
        </Provider>
    );

    expect(screen.getByRole('link', { name: 'Рейтинг' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Заказать/i })).not.toBeInTheDocument();
  });

  it('рендерит CocktailCanvas', () => {
    mockedUseAuth.mockReturnValue({ isBarman: false, currentUser: null });
    const store = createTestStore({ stages: {} });

    render(
        <Provider store={store}>
          <MemoryRouter>
            <Result />
          </MemoryRouter>
        </Provider>
    );

    expect(screen.getByTestId('cocktail-canvas')).toBeInTheDocument();
  });

  it("кнопка 'Переиграть' ведёт на /levelPage", () => {
    mockedUseAuth.mockReturnValue({ isBarman: false, currentUser: null });
    const store = createTestStore({ stages: {} });

    render(
        <Provider store={store}>
          <MemoryRouter>
            <Result />
          </MemoryRouter>
        </Provider>
    );

    fireEvent.click(screen.getByTitle('переиграть'));
    expect(mockNavigate).toHaveBeenCalledWith('/levelPage');
  });

  it("кнопка 'Бар' ведёт на /menu", () => {
    mockedUseAuth.mockReturnValue({ isBarman: false, currentUser: null });
    const store = createTestStore({ stages: {} });

    render(
        <Provider store={store}>
          <MemoryRouter>
            <Result />
          </MemoryRouter>
        </Provider>
    );

    fireEvent.click(screen.getByTitle('бар'));
    expect(mockNavigate).toHaveBeenCalledWith('/menu');
  });

  it('отправляет очки на сервер для бармена при totalScore > 0 и currentUser.login', async () => {
    mockedUseAuth.mockReturnValue({
      isBarman: true,
      currentUser: { id: 555, login: 'superbarman' },
    });

    const store = createTestStore({
      stages: { stage1: { score: 80 }, stage2: { score: 120 } },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
        <Provider store={store}>
          <MemoryRouter>
            <Result />
          </MemoryRouter>
        </Provider>
    );

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
          '/api/rating/update-score',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ login: 'superbarman', score: 200 }),
          })
      );
    });
  });

  it('не отправляет очки, если не бармен', () => {
    mockedUseAuth.mockReturnValue({ isBarman: false, currentUser: { login: 'user' } });
    const store = createTestStore({ stages: { stage1: { score: 100 } } });

    global.fetch = vi.fn();

    render(
        <Provider store={store}>
          <MemoryRouter>
            <Result />
          </MemoryRouter>
        </Provider>
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('не отправляет очки повторно в один день', async () => {
    mockedUseAuth.mockReturnValue({
      isBarman: true,
      currentUser: { id: 100, login: 'repeat' },
    });

    const store = createTestStore({ stages: { stage1: { score: 50 } } });

    const today = new Date().toLocaleDateString();
    localStorage.setItem(`scoreSent_100_${today}`, 'true');

    global.fetch = vi.fn();

    render(
        <Provider store={store}>
          <MemoryRouter>
            <Result />
          </MemoryRouter>
        </Provider>
    );

    await vi.waitFor(() => expect(global.fetch).not.toHaveBeenCalled());
  });
});