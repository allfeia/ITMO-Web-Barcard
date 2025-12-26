import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminRegisterBarForm from '../../src/admin/super-admin/AdminRegisterBarForm.jsx';

const goToMock = vi.fn();
const apiFetchMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => goToMock,
  };
});

vi.mock('../../src/apiFetch.js', () => ({
    useApiFetch: () => apiFetchMock,
}));

describe('AdminRegisterBarForm', () => {
  function fillBase(valid = true) {
  const [nameInput] = screen.getAllByLabelText('Название бара');
  fireEvent.change(nameInput, { target: { value: 'Бар 1' } });

  const keyInput = screen.getAllByLabelText('Ключ бара')
  .find(el => el.tagName === 'INPUT');

fireEvent.change(
  keyInput,
  { target: { value: valid ? 'key123' : '' } }
);
  
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
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it('успешный POST и сообщение ok', async () => {
    apiFetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Бар создан: Бар 1', name: 'Бар 1' }),
    });

    render(<AdminRegisterBarForm />);
    fillBase(true);

    fireEvent.click(screen.getByRole('button', { name: 'Создать бар' }));

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith('/api/admin/bars', expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
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

    const clickSubmit = () => {
      const [submitBtn] = screen.getAllByRole('button', { name: 'Создать бар' });
      fireEvent.click(submitBtn);
    };

    // 401
    apiFetchMock.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Не авторизовано' }),
        });
    renderAndFill();
    clickSubmit();
    expect(await screen.findByText('Не авторизовано')).toBeInTheDocument();

    // 403
    apiFetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Доступ запрещён' }),
    });
    renderAndFill();
    clickSubmit();
    expect(await screen.findByText('Доступ запрещён')).toBeInTheDocument();

    // 400 с ключом
    apiFetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Некорректный ключ бара' }),
    });
    renderAndFill();
    clickSubmit();
    expect(await screen.findByText('Некорректный ключ бара')).toBeInTheDocument();
  });
});