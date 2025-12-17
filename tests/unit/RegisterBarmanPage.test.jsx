import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegisterBarmenPage from '../../src/admin/bar-admin/RegisterBarmanPage.jsx';

vi.mock('../../src/admin/bar-admin/AdminRegisterBarmanForm.jsx', () => ({
  default: () => <div data-testid="admin-register-barman-form">FORM</div>,
}));

describe('RegisterBarmenPage', () => {
  it('рендерит заголовок и форму', () => {
    render(<RegisterBarmenPage />);
    expect(screen.getByTestId('admin-register-barman-form')).toBeInTheDocument();
  });
});