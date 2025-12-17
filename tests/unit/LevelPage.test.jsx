import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LevelPage from '../../src/level-page/LevelPage';
import drawOlive from '../../src/level-page/Olive.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../src/level-page/Olive.js', () => ({
    default: vi.fn(),
}));

describe('LevelPage', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
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
        expect(screen.getByRole('heading', { name: 'Выберитеуровень' })).toBeInTheDocument();
    });

    it('должна рендерить кнопку назад', () => {
        renderLevelPage();
        const backButton = screen.getByTestId('back-button');
        expect(backButton).toBeInTheDocument();
        expect(backButton).toHaveClass('back-btn');
    });

    it('должна рендерить три кнопки уровней с правильным текстом', () => {
        renderLevelPage();
        expect(screen.getByRole('button', { name: 'Легкий' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Средний' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Сложный' })).toBeInTheDocument();
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
        fireEvent.click(screen.getByTestId('back-button'));
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('должна иметь обработчики клика на кнопках уровней', () => {
        renderLevelPage();
        fireEvent.click(screen.getByRole('button', { name: 'Легкий' }));
        expect(mockNavigate).toHaveBeenCalledWith('/game/easy');

        fireEvent.click(screen.getByRole('button', { name: 'Средний' }));
        expect(mockNavigate).toHaveBeenCalledWith('/game/medium');

        fireEvent.click(screen.getByRole('button', { name: 'Сложный' }));
        expect(mockNavigate).toHaveBeenCalledWith('/game/hard');
    });

    it('должна вызывать drawOlive при монтировании с правильными аргументами', () => {
        renderLevelPage();
        const canvases = screen.getAllByTestId('olive-canvas');

        expect(drawOlive).toHaveBeenCalledTimes(3);
        expect(drawOlive).toHaveBeenCalledWith(canvases[0], 1);
        expect(drawOlive).toHaveBeenCalledWith(canvases[1], 2);
        expect(drawOlive).toHaveBeenCalledWith(canvases[2], 3);
    });
});