import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SuperGrantBarAdminPage from '../../src/admin/super-admin/SuperGrantBarAdminPage.jsx';

const goToMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => goToMock,
  };
});

vi.mock('../../src/authContext/useAuth.js', () => ({
  useAuth: () => ({ token: 'jwt' }),
}));


describe('SuperGrantBarAdminPage', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = fetchMock;
  });

  it('загружает бары и сотрудников, отправляет grant', async () => {
    // GET /api/admin/bars
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { id: 1, name: 'Бар А' },
      ]),
    });

    // GET /api/admin/bars/1/staff
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { id: 10, name: 'Иван' },
      ]),
    });

    // POST /api/super/grant-bar-admin
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'ok' }),
    });

    render(<SuperGrantBarAdminPage />);

    // Бары
    const barSelect = await screen.findByLabelText('Бар');
    fireEvent.mouseDown(barSelect);
    fireEvent.click(await screen.findByText('Бар А'));

    // Сотрудники
    const staffSelect = await screen.findByLabelText('Сотрудник бара');
    fireEvent.mouseDown(staffSelect);
    fireEvent.click(await screen.findByText('Иван'));

    // Действие grant по умолчанию, отправляем
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith('/api/super/grant-bar-admin', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer jwt',
        }),
        body: expect.any(String),
      }));
    });

    const body = JSON.parse(fetchMock.mock.calls.at(-1)[1].body);
    expect(body).toEqual({ userId: 10, makeBarAdmin: true });
  });

  it('показывает ошибки если не выбран бар или сотрудник', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ([]),
    });

    render(<SuperGrantBarAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(await screen.findByText('Сначала выберите бар')).toBeInTheDocument();
  });
});