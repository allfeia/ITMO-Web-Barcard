import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminPage from '../src/admin/AdminPage.jsx';

// Мокаем react-router-dom Link, чтобы не требовал Router
vi.mock('react-router-dom', () => ({
  Link: ({ children }) => <a>{children}</a>,
}));

// Мокаем AuthContext
vi.mock('../AuthContext.js', () => ({
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

    render(<AdminPage />);

    expect(screen.queryByText('Создать бар')).toBeNull();
    expect(screen.queryByText('Создать сотрудника')).toBeNull();
    expect(screen.queryByText('Назначить бар‑админа')).toBeNull();

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

    render(<AdminPage />);

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

    render(<AdminPage />);

    expect(screen.getByText('Создать бар')).toBeInTheDocument();
    expect(screen.getByText('Создать сотрудника')).toBeInTheDocument();
    expect(screen.getByText('Назначить бар‑админа')).toBeInTheDocument();
  });
});