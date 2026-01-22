import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Result from '../../src/result-page/Result';

vi.mock('./CocktailCanvas', () => ({
    default: () => <div data-testid="cocktail-canvas">Mocked Canvas</div>,
}));

describe('Result', () => {
    const mockedNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
            ...actual,
        useNavigate: () => mockedNavigate,
    };
    });

    beforeEach(() => {
        mockedNavigate.mockClear();
    });

    it('отображает заголовок "Готово!"', () => {
        render(
            <MemoryRouter>
                <Result />
            </MemoryRouter>,
        );

        expect(screen.getByText('Готово!')).toBeInTheDocument();
    });

    it('показывает рейтинг по умолчанию 326', () => {
        render(
            <MemoryRouter>
                <Result />
            </MemoryRouter>,
        );

        expect(screen.getByText(/Рейтинг: 326 ★/)).toBeInTheDocument();
    });

    it('показывает переданный рейтинг', () => {
        render(
            <MemoryRouter>
                <Result score={580} />
            </MemoryRouter>,
        );

        expect(screen.getByText(/Рейтинг: 580 ★/)).toBeInTheDocument();
    });

    it('рендерит CocktailCanvas', () => {
        render(
            <MemoryRouter>
                <Result />
            </MemoryRouter>,
        );

        expect(screen.getByTestId('cocktail-canvas')).toBeInTheDocument();
    });

    it('кнопка "Переиграть" вызывает navigate на /levelPage', () => {
        render(
            <MemoryRouter>
                <Result />
            </MemoryRouter>,
        );

        const replayButton = screen.getByTitle('переиграть');
        fireEvent.click(replayButton);

        expect(mockedNavigate).toHaveBeenCalledWith('/levelPage');
    });

    it('кнопка "Бар" вызывает navigate на /menu', () => {
        render(
            <MemoryRouter>
                <Result />
            </MemoryRouter>,
        );

        const barButton = screen.getByTitle('бар');
        fireEvent.click(barButton);

        expect(mockedNavigate).toHaveBeenCalledWith('/menu');
    });

    it('кнопка "Заказать" вызывает navigate на /order', () => {
        render(
            <MemoryRouter>
                <Result />
            </MemoryRouter>,
        );

        const orderButton = screen.getByRole('button', { name: /заказать/i });
        fireEvent.click(orderButton);

        expect(mockedNavigate).toHaveBeenCalledWith('/order');
    });

    it('иконки и подписи к ним присутствуют', () => {
        render(
            <MemoryRouter>
                <Result />
            </MemoryRouter>,
        );

        expect(screen.getByText('Переиграть')).toBeInTheDocument();
        expect(screen.getByText('Бар')).toBeInTheDocument();
    });
});