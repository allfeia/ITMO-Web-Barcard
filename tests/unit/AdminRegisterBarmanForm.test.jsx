import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminRegisterBarmanForm from '../../src/admin/bar-admin/AdminRegisterBarmanForm.jsx';
import { useAuth } from '../../src/authContext/useAuth.js';

const goToMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => goToMock,
  };
});

vi.mock('../../src/authContext/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

describe('AdminRegisterBarmanForm', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = fetchMock;

    useAuth.mockReturnValue({
      roles: ['bar_admin'],
      barId: 123,
    });

    sessionStorage.setItem('barId', '123');
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  function fillValidForm() {
    fireEvent.change(screen.getByLabelText('Имя'), { target: { value: 'Иван' } });
    fireEvent.change(screen.getByLabelText('Логин'), { target: { value: 'ivan' } });
    fireEvent.change(screen.getByLabelText('Почта'), { target: { value: 'ivan@example.com' } });
  }

  it('показывает ошибки валидации при пустых полях', async () => {
    render(<AdminRegisterBarmanForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));

    expect(await screen.findByText('Введите имя')).toBeInTheDocument();
    expect(screen.getByText('Введите логин')).toBeInTheDocument();
    expect(screen.getByText('Введите почту')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('показывает ошибку при некорректном email', async () => {
    render(<AdminRegisterBarmanForm />);

    fireEvent.change(screen.getByLabelText('Имя'), { target: { value: 'Иван' } });
    fireEvent.change(screen.getByLabelText('Логин'), { target: { value: 'ivan' } });
    fireEvent.change(screen.getByLabelText('Почта'), { target: { value: 'ivan-at-example.com' } });
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'secret' } });

    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));

    expect(await screen.findByText('Некорректный e‑mail')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('когда нет контекста бара — показывает ошибку и не шлёт запрос', async () => {
    vi.clearAllMocks();
    const localFetchMock = vi.fn();
    global.fetch = localFetchMock;

    useAuth.mockReturnValue({
      roles: ['staff'],
      barId: null,
    });

    render(<AdminRegisterBarmanForm />);

    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));

    expect(await screen.findByText('Нет контекста бара')).toBeInTheDocument();
    expect(localFetchMock).not.toHaveBeenCalled();
  });

  it('отправляет запрос и показывает success', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Бармен зарегистрирован' }),
    });

    render(<AdminRegisterBarmanForm />);
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/super/users/register-in-bar',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            barId: 123,
            roles: ['staff'],
            name: 'Иван',
            login: 'ivan',
            email: 'ivan@example.com',
          }),
        })
      );
    });

    expect(await screen.findByText('Бармен зарегистрирован')).toBeInTheDocument();
  });

  it('обрабатывает 403/404/409 и общую ошибку', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Запрещено' }),
    });

    render(<AdminRegisterBarmanForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
    expect(await screen.findByText('Запрещено')).toBeInTheDocument();

    // 404
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Не найдено' }),
    });

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
    expect(await screen.findByText('Не найдено')).toBeInTheDocument();

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Сотрудник с такими данными уже существует' }),
    });

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
    expect(await screen.findByText('Сотрудник с такими данными уже существует')).toBeInTheDocument();

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: async () => ({ error: 'Ошибка регистрации' }),
    });

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
    expect(await screen.findByText('Ошибка регистрации')).toBeInTheDocument();
  });
});