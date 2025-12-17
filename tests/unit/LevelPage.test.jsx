import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LevelPage from '../../src/level-page/LevelPage';
import drawOlive from '../../src/level-page/Olive.js';

vi.mock('../../src/level-page/Olive.js', () => ({
    default: vi.fn(),
}));

describe('LevelPage', () => {
    beforeEach(() => {
        vi.mocked(drawOlive).mockClear();
    });
    const renderLevelPage = () => {
        return render(
            <MemoryRouter>
                <LevelPage />
            </MemoryRouter>
        );
    };
    it('должна рендерить заголовок', () => {
        renderLevelPage();
        expect(screen.getByText(/Выберите/i)).toBeInTheDocument();
        expect(screen.getByText(/уровень/i)).toBeInTheDocument();
    });
    it('должна рендерить кнопку назад', () => {
        renderLevelPage();
        const backButton = screen.getByText('←');
        expect(backButton).toBeInTheDocument();
        expect(backButton.closest('button')).toHaveClass('back-btn');
    });

    it('должна рендерить три кнопки уровней с правильным текстом', () => {
        renderLevelPage();
        expect(screen.getByText('Легкий')).toBeInTheDocument();
        expect(screen.getByText('Средний')).toBeInTheDocument();
        expect(screen.getByText('Сложный')).toBeInTheDocument();
    });

    it('должна рендерить подсказки (hint) над каждой кнопкой', () => {
        renderLevelPage();
        expect(screen.getByText('С подсказками без штрафов')).toBeInTheDocument();
        expect(screen.getByText('С подсказками и штрафами')).toBeInTheDocument();
        expect(screen.getByText('Без подсказок и штрафами за ошибки')).toBeInTheDocument();
    });

    it('должна рендерить три canvas для оливок', () => {
        renderLevelPage();
        const oliveCanvases = screen.getAllByTestId('olive-canvas');
        expect(oliveCanvases).toHaveLength(3);
    });

    it('должна иметь обработчик клика на кнопке назад', () => {
        renderLevelPage();
        act(() => {
            screen.getByText('←').click();
        });
    });

    it('должна иметь обработчики клика на кнопках уровней', () => {
        renderLevelPage();
        act(() => {
            screen.getByText('Легкий').click();
            screen.getByText('Средний').click();
            screen.getByText('Сложный').click();
        });
    });

    it('должна вызывать drawOlive при монтировании с правильными аргументами', () => {
        renderLevelPage();

        expect(drawOlive).toHaveBeenCalledTimes(3);
        expect(drawOlive).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 1);
        expect(drawOlive).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 2);
        expect(drawOlive).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 3);
    });
});