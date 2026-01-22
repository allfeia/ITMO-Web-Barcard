import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Result from '../../src/game-pages/result-page/Result';
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../src/result-page/CocktailCanvas', () => ({
    default: () => (
        <canvas
            data-testid="cocktail-canvas"
            className="cocktail-canvas"
            width="200"
            height="260"
            aria-label="Нарисованный коктейль с оливкой"
            style={{ width: '200px', height: '260px' }}
        />
    ),
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

    it('отображает переданный рейтинг корректно', () => {
        renderResult({ score: 580 });
        expect(screen.getByText(/Рейтинг:\s*580\s*★/i)).toBeInTheDocument();

        renderResult({ score: 0 });
        expect(screen.getByText(/Рейтинг:\s*0\s*★/i)).toBeInTheDocument();

        renderResult({ score: 1250 });
        expect(screen.getByText(/Рейтинг:\s*1250\s*★/i)).toBeInTheDocument();
    });

    it('рендерит CocktailCanvas внутри .cocktail-container', () => {
        renderResult();

        const canvas = screen.getByTestId('cocktail-canvas');
        expect(canvas).toBeInTheDocument();
        expect(canvas.tagName).toBe('CANVAS');
        expect(canvas).toHaveClass('cocktail-canvas');
        expect(canvas).toHaveAttribute('aria-label', 'Нарисованный коктейль с оливкой');
        expect(canvas).toHaveAttribute('width', '200');
        expect(canvas).toHaveAttribute('height', '260');
        const container = canvas.closest('.cocktail-container');
        expect(container).toBeInTheDocument();
        expect(container).toContainElement(canvas);
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

    it('отображает две иконки с подписями "Переиграть" и "Бар"', () => {
        renderResult();

        expect(screen.getByText('Переиграть')).toBeInTheDocument();
        expect(screen.getByText('Бар')).toBeInTheDocument();

        expect(screen.getByText('Переиграть')).toHaveClass('icon-label');
        expect(screen.getByText('Бар')).toHaveClass('icon-label');
    });
    it('Stack с иконками отображается корректно (две группы кнопок)', () => {
        renderResult();

        const iconContainers = screen.getAllByText(/Переиграть|Бар/)
            .map(el => el.closest('.icon-button-container'))
            .filter(Boolean);

        expect(iconContainers).toHaveLength(2);
        expect(iconContainers[0]).toBeInTheDocument();
        expect(iconContainers[1]).toBeInTheDocument();
    });
    it('рендерит кнопку "Заказать" с правильными пропсами MUI', () => {
        renderResult();
        const orderBtn = screen.getByRole('button', { name: /заказать/i });

        expect(orderBtn).toHaveClass('order-button');
        expect(orderBtn).toHaveAttribute('type', 'button'); // default для Button
        expect(orderBtn).not.toBeDisabled();
    });


    it('отрисовывает правильную структуру: titleResult, subtitle, button-stack', () => {
        renderResult({ score: 777 });
        const title = screen.getByText('Готово!');
        expect(title).toHaveClass('titleResult');
        const subtitle = screen.getByText(/Рейтинг:\s*777\s*★/i);
        expect(subtitle).toHaveClass('subtitle');
        const stack = screen.getByText('Переиграть').closest('.button-stack');
        expect(stack).toBeInTheDocument();
        expect(stack).toHaveClass('button-stack');
    });

    it('handle-функции вызывают navigate с правильными путями (альтернативная проверка)', () => {
        renderResult();
        fireEvent.click(screen.getByTitle('переиграть'));
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/levelPage');
        fireEvent.click(screen.getByTitle('бар'));
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/menu');
        fireEvent.click(screen.getByRole('button', { name: /заказать/i }));
        expect(mockNavigate).toHaveBeenNthCalledWith(3, '/order');
    });

});