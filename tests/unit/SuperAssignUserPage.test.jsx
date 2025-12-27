import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SuperAssignUserPage from '../../src/admin/super-admin/SuperAssignUserPage.jsx';

const goToMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => goToMock,
  };
});

vi.mock('../../src/apiFetch.js', () => ({
  useApiFetch: () => global.fetch,
}));

describe('SuperAssignUserPage', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = fetchMock;
  });

  it('загружает бары и позволяет выбрать роли и отправить форму', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Бар А' },
        { id: 2, name: 'Бар B' },
      ],
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Готово' }),
    });

    render(<SuperAssignUserPage />);

    await screen.findByLabelText('Бар');

    fireEvent.mouseDown(screen.getByLabelText('Бар'));
    const optionBarA = await screen.findByText('Бар А');
    fireEvent.click(optionBarA);

    const staffCb = screen.getByLabelText('staff');
    fireEvent.click(staffCb);

    fireEvent.change(screen.getByLabelText('Имя пользователя'), { target: { value: 'Новый' } });
    fireEvent.change(screen.getByLabelText('Логин'), { target: { value: 'new' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@ex.com' } });

    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));

    await waitFor(() => {
  expect(fetchMock).toHaveBeenLastCalledWith(
    '/api/super/users/register-in-bar',
    expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barName: 'Бар А',
        roles: ['bar_admin', 'staff'],
        name: 'Новый',
        login: 'new',
        email: 'new@ex.com',
      }),
    })
  );
});

    expect(await screen.findByText('Готово')).toBeInTheDocument();
  });

  it('показывает ошибки валидации на форме', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<SuperAssignUserPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
    expect(await screen.findByText('Выберите бар')).toBeInTheDocument();
  });
});