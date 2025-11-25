import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SuperLoginPage from '../src/admin/super-admin/SuperLoginPage.jsx';

const setToken = vi.fn();
const setRoles = vi.fn();
const setBarId = vi.fn();

vi.mock('../../AuthContext.js', () => ({
  useAuth: () => ({ setToken, setRoles, setBarId }),
}));

describe('SuperLoginPage', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = fetchMock;
  });

  it('валидация: требует логин и пароль', async () => {
    render(<SuperLoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));
    expect(await screen.findByText('Введите логин и пароль')).toBeInTheDocument();
  });

  it('успешный логин выставляет токен/роли и редиректит', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'jwt', user: { roles: ['super_admin'] } }),
    });

    render(<SuperLoginPage />);
    fireEvent.change(screen.getByLabelText('Логин/Email/Имя'), { target: { value: 'root' } });
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'pass' } });

    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledWith('jwt');
      expect(setRoles).toHaveBeenCalledWith(['super_admin']);
      expect(setBarId).toHaveBeenCalledWith(null);
      expect(goToMock).toHaveBeenCalledWith('/administration');
    });
  });

  it('ошибка входа показывает сообщение сервера', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Ошибка входа' }),
    });

    render(<SuperLoginPage />);
    fireEvent.change(screen.getByLabelText('Логин/Email/Имя'), { target: { value: 'root' } });
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'bad' } });

    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByText('Ошибка входа')).toBeInTheDocument();
  });
});