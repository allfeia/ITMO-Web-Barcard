import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminRegisterBarForm from '../src/admin/super-admin/AdminRegisterBarForm.jsx';

vi.mock('../../AuthContext.js', () => ({
  useAuth: () => ({ token: 'jwt-super' }),
}));

describe('AdminRegisterBarForm', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = fetchMock;
  });

  function fillBase(valid = true) {
    fireEvent.change(screen.getByLabelText('Название бара'), { target: { value: 'Бар 1' } });
    fireEvent.change(screen.getByLabelText('Ключ бара'), { target: { value: valid ? 'key123' : '' } });
  }

  it('валидация: пустое имя/ключ, некорректный URL', async () => {
    render(<AdminRegisterBarForm />);

    // пустые поля
    fireEvent.click(screen.getByRole('button', { name: 'Создать бар' }));
    expect(await screen.findByText('Введите название бара')).toBeInTheDocument();
    expect(screen.getByText('Введите ключ бара')).toBeInTheDocument();

    // неверный URL
    fireEvent.change(screen.getByLabelText('Название бара'), { target: { value: 'Бар' } });
    fireEvent.change(screen.getByLabelText('Web‑site (URL)'), { target: { value: 'not-a-url' } });
    fireEvent.change(screen.getByLabelText('Ключ бара'), { target: { value: 'k' } });
    fireEvent.click(screen.getByRole('button', { name: 'Создать бар' }));
    expect(await screen.findByText('Некорректный URL')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('успешный POST и сообщение ok', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Бар создан: Бар 1', name: 'Бар 1' }),
    });

    render(<AdminRegisterBarForm />);
    fillBase(true);

    fireEvent.click(screen.getByRole('button', { name: 'Создать бар' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/admin/bars', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer jwt-super',
        }),
      }));
    });

    expect(await screen.findByText(/Бар создан/)).toBeInTheDocument();
  });

  it('обрабатывает 401, 403 и 400 (ключ)', async () => {
    const renderAndFill = () => {
      render(<AdminRegisterBarForm />);
      fillBase(true);
    };

    // 401
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    });
    renderAndFill();
    fireEvent.click(screen.getByRole('button', { name: 'Создать бар' }));
    expect(await screen.findByText('Не авторизовано')).toBeInTheDocument();

    // 403
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Доступ запрещён' }),
    });
    renderAndFill();
    fireEvent.click(screen.getByRole('button', { name: 'Создать бар' }));
    expect(await screen.findByText('Доступ запрещён')).toBeInTheDocument();

    // 400 с ключом
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Некорректный ключ бара' }),
    });
    renderAndFill();
    fireEvent.click(screen.getByRole('button', { name: 'Создать бар' }));
    expect(await screen.findByText('Некорректный ключ бара')).toBeInTheDocument();
  });
});