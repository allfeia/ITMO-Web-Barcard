import Result from '../../src/result-page/Result';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

vi.mock('./CocktailCanvas', () => ({
    default: () => <div data-testid="cocktail-canvas">Mocked Canvas</div>,
}));

describe('Result', () => {
    beforeEach(() => {
        mockedNavigate.mockClear();
    });

    it('отображает заголовок "Готово!"', () => {
        render(
            <MemoryRouter>
                <Result />
            </MemoryRouter>
        );
        expect(screen.getByText('Готово!')).toBeInTheDocument();
    });

    it('показывает рейтинг по умолчанию 326', () => {
        render(<MemoryRouter><Result /></MemoryRouter>);
        expect(screen.getByText(/Рейтинг: 326 ★/i)).toBeInTheDocument();
    });

    it('показывает переданный рейтинг', () => {
        render(<MemoryRouter><Result score={580} /></MemoryRouter>);
        expect(screen.getByText(/Рейтинг: 580 ★/i)).toBeInTheDocument();
    });

    it('рендерит CocktailCanvas', () => {
        render(<MemoryRouter><Result /></MemoryRouter>);
        expect(screen.getByTestId('cocktail-canvas')).toBeInTheDocument();
    });

    it('кнопка "Переиграть" вызывает navigate на /levelPage', () => {
        render(<MemoryRouter><Result /></MemoryRouter>);

        fireEvent.click(screen.getByTitle(/переиграть/i));
        expect(mockedNavigate).toHaveBeenCalledWith('/levelPage');
    });

    it('кнопка "Бар" вызывает navigate на /menu', () => {
        render(<MemoryRouter><Result /></MemoryRouter>);

        fireEvent.click(screen.getByTitle(/бар/i));
        expect(mockedNavigate).toHaveBeenCalledWith('/menu');
    });

    it('кнопка "Заказать" вызывает navigate на /order', () => {
        render(<MemoryRouter><Result /></MemoryRouter>);

        fireEvent.click(screen.getByRole('button', { name: /заказать/i }));
        expect(mockedNavigate).toHaveBeenCalledWith('/order');
    });

    it('иконки и подписи к ним присутствуют', () => {
        render(<MemoryRouter><Result /></MemoryRouter>);
        expect(screen.getByText('Переиграть')).toBeInTheDocument();
        expect(screen.getByText('Бар')).toBeInTheDocument();
    });
});