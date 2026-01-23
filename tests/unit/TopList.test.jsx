
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import * as authHook from '../../src/authContext/useAuth';
import TopList from "../../src/topList/TopList.jsx";

vi.mock('../../src/authContext/useAuth');

const mockedUseAuth = vi.mocked(authHook.useAuth);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('TopList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseAuth.mockReturnValue({
            barId: 123,
            barName: 'Olive Bar',
            barSite: 'https://example.com/olive',
        });
    });

    it('отображает "Загрузка рейтинга..." во время загрузки', async () => {
        global.fetch = vi.fn(() =>
            new Promise(() => {})
        );

        render(
            <MemoryRouter>
                <TopList />
            </MemoryRouter>
        );

        expect(screen.getByText('Загрузка рейтинга...')).toBeInTheDocument();
    });

    it('отображает название бара и список пользователей при успешной загрузке', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                rating: [
                    { login: 'alice', score: 1200 },
                    { login: 'bob', score: 950 },
                ],
            }),
        });

        render(
            <MemoryRouter>
                <TopList />
            </MemoryRouter>
        );

        await screen.findByText('Olive Bar');
        await screen.findByText('alice');
        await screen.findByText('1 200 очков');
        await screen.findByText('bob');
        await screen.findByText('950 очков');
    });

    it('показывает сообщение об ошибке при ошибке сети', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter>
                <TopList />
            </MemoryRouter>
        );
        await screen.findByText(/Network error|ошибк/i);
    });

    it('форматирует очки с пробелами каждые 3 цифры', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ rating: [{ login: 'test', score: 1234567 }] }),
        });

        render(<MemoryRouter><TopList /></MemoryRouter>);

        await screen.findByText('1 234 567 очков');
    });

    it("кнопка 'Назад' вызывает navigate(-1)", async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ rating: [] }) });

        render(<MemoryRouter><TopList /></MemoryRouter>);

        const backBtn = await screen.findByTestId('back-button');
        fireEvent.click(backBtn);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('название бара является ссылкой на barSite и открывает в новой вкладке', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ rating: [] }) });

        render(<MemoryRouter><TopList /></MemoryRouter>);

        const link = await screen.findByText('Olive Bar');
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href', 'https://example.com/olive');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('если barSite нет — название бара отображается как текст без ссылки', async () => {
        mockedUseAuth.mockReturnValue({
            barId: 123,
            barName: 'NoSite Bar',
            barSite: undefined,
        });

        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ rating: [] }) });

        render(<MemoryRouter><TopList /></MemoryRouter>);

        const name = await screen.findByText('NoSite Bar');
        expect(name.tagName).toBe('SPAN');
    });

    it("отображает 'Рейтинг пуст' когда пользователей нет", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ rating: [] }),
        });

        render(<MemoryRouter><TopList /></MemoryRouter>);

        await screen.findByText('Рейтинг пуст');
        await screen.findByText('Станьте первым участником!');
    });

    it('показывает ошибку, если barId отсутствует в контексте', () => {
        mockedUseAuth.mockReturnValue({
            barId: undefined,
            barName: 'Test',
            barSite: null,
        });

        render(<MemoryRouter><TopList /></MemoryRouter>);

        expect(screen.getByText('ID бара не найден')).toBeInTheDocument();
    });
});