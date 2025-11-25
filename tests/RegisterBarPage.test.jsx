import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegisterBarPage from '../src/admin/super-admin/RegisterBarPage.jsx';

vi.mock('../src/admin/super-admin/AdminRegisterBarForm.jsx', () => ({
  default: () => <div data-testid="admin-register-bar-form">FORM</div>,
}));

describe('RegisterBarPage', () => {
  it('рендерит заголовок и форму', () => {
    render(<RegisterBarPage />);
    expect(screen.getByText('Регистрация бара')).toBeInTheDocument();
    expect(screen.getByTestId('admin-register-bar-form')).toBeInTheDocument();
  });
});