import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Result from '../../src/result-page/Result';
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../src/result-page/CocktailCanvas', () => ({
    default: () => <div data-testid="cocktail-canvas">Mocked Cocktail Canvas</div>,
}));

describe('Result', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    const renderResult = (props = {}) => {
        return render(
            <MemoryRouter>
                <Result {...props} />
            </MemoryRouter>
        );
    };

    it('отображает заголовок "Готово!"', () => {
        renderResult();
        expect(screen.getByText('Готово!')).toBeInTheDocument();
    });

    it('показывает рейтинг по умолчанию 326', () => {
        renderResult();
        expect(screen.getByText(/Рейтинг:\s*326\s*★/i)).toBeInTheDocument();
    });

    it('показывает переданный рейтинг', () => {
        renderResult({ score: 580 });
        expect(screen.getByText(/Рейтинг:\s*580\s*★/i)).toBeInTheDocument();
    });

    it('рендерит CocktailCanvas', () => {
        renderResult();
        expect(screen.getByTestId('cocktail-canvas')).toBeInTheDocument();
    });

    it('кнопка "Переиграть" вызывает navigate на /levelPage', () => {
        renderResult();

        const replayButton = screen.getByRole('button', { name: /переиграть/i });
        fireEvent.click(replayButton);

        expect(mockNavigate).toHaveBeenCalledWith('/levelPage');
    });

    it('кнопка "Бар" вызывает navigate на /menu', () => {
        renderResult();

        const barButton = screen.getByRole('button', { name: /бар/i });
        fireEvent.click(barButton);

        expect(mockNavigate).toHaveBeenCalledWith('/menu');
    });

    it('кнопка "Заказать" вызывает navigate на /order', () => {
        renderResult();

        const orderButton = screen.getByRole('button', { name: /заказать/i });
        fireEvent.click(orderButton);

        expect(mockNavigate).toHaveBeenCalledWith('/order');
    });

    it('отображает подписи к иконкам "Переиграть" и "Бар"', () => {
        renderResult();
        expect(screen.getByText('Переиграть')).toBeInTheDocument();
        expect(screen.getByText('Бар')).toBeInTheDocument();
    });
});