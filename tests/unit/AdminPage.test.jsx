import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminPage from '../../src/admin/AdminPage.jsx';
import { useAuth } from '../../src/authContext/useAuth.js';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: () => mockNavigate };
});


vi.mock('../../src/authContext/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('не показывает супер-ссылки для обычного пользователя', () => {
    useAuth.mockReturnValue({
      role: 'user',
      roles: ['staff'],
      logout: vi.fn(),
    });

    render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>
  );

    expect(screen.getByText('Добавить бар')).toBeInTheDocument();
    expect(screen.getByText('Добавить сотрудника')).toBeInTheDocument();
    expect(
      screen.getByText('Выдать/снять администраторские права для сотрудника бара')
    ).toBeInTheDocument();

    expect(screen.getByText('Административная панель')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Выйти' })).toBeInTheDocument();
  });

  it('показывает супер-ссылки когда role = super_admin', () => {
  const logout = vi.fn();
  useAuth.mockReturnValue({
    role: 'super_admin',
    roles: [],
    logout,
  });

  render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>
  );

  expect(screen.getByText('Создать бар')).toBeInTheDocument();
  expect(screen.getByText('Создать сотрудника')).toBeInTheDocument();
  expect(screen.getByText('Назначить бар‑админа')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Выйти' }));
  expect(logout).toHaveBeenCalled();
});

it('показывает супер-ссылки когда roles включает super_admin', () => {
  useAuth.mockReturnValue({
    role: 'user',
    roles: ['staff', 'super_admin'],
    logout: vi.fn(),
  });

  render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>
  );

  expect(screen.getByText('Создать бар')).toBeInTheDocument();
  expect(screen.getByText('Создать сотрудника')).toBeInTheDocument();
  expect(screen.getByText('Назначить бар‑админа')).toBeInTheDocument();
});
});