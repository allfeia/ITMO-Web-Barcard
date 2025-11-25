import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SuperAssignUserPage from '../src/admin/super-admin/SuperAssignUserPage.jsx';

vi.mock('../../AuthContext.js', () => ({
  useAuth: () => ({ token: 'jwt' }),
}));


describe('SuperAssignUserPage', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = fetchMock;
  });

  it('загружает бары и позволяет выбрать роли и отправить форму', async () => {
    // GET /api/admin/bars
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { id: 1, name: 'Бар А' },
        { id: 2, name: 'Бар B' },
      ]),
    });

    // После выбора бара — GET /api/admin/bars/:id/staff
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { id: 10, name: 'Иван' },
        { id: 11, name: 'Петр' },
      ]),
    });

    // POST /api/super/users/register-in-bar
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Готово' }),
    });

    render(<SuperAssignUserPage />);

    // Бары подгрузились
    await screen.findByLabelText('Бар');

    // Выбираем бар
    fireEvent.mouseDown(screen.getByLabelText('Бар'));
    const optionBarA = await screen.findByText('Бар А');
    fireEvent.click(optionBarA);

    // Подгрузились сотрудники
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    // Роли по умолчанию: ['bar_admin']; переключим staff
    const staffCb = screen.getByLabelText('staff');
    fireEvent.click(staffCb); // добавить staff

    // Заполняем пользователя
    fireEvent.change(screen.getByLabelText('Имя пользователя'), { target: { value: 'Новый' } });
    fireEvent.change(screen.getByLabelText('Логин'), { target: { value: 'new' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@ex.com' } });
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'secret' } });

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith('/api/super/users/register-in-bar', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer jwt',
        }),
      }));
    });

    expect(await screen.findByText('Готово')).toBeInTheDocument();
  });

  it('показывает ошибки валидации на форме', async () => {
    // GET bars
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ([]),
    });
    render(<SuperAssignUserPage />);

    // Пытаемся отправить без бара
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(await screen.findByText('Выберите бар')).toBeInTheDocument();
  });
});