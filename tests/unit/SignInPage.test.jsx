import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignInPage from '../../src/sign-in-page/SignInPage.jsx';
import drawOlive from '../../src/sign-in-page/olive.js';
import {AuthProvider} from "../../src/authContext/AuthContext.jsx";
import {MemoryRouter} from "react-router-dom";


const mockNavigate = vi.fn();
const mockSetToken = vi.fn();
const mockSetRoles = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../src/authContext/useAuth.js", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useAuth: () => ({ setToken: mockSetToken, setRoles: mockSetRoles }) };
});

vi.mock('../../src/sign-in-page/olive.js', () => ({
    default: vi.fn(),
}));

describe('SignInPage', () => {
    it('вызывает drawOlive с canvas после монтирования', async () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <SignInPage />
                </MemoryRouter>
            </AuthProvider>
        );

        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();

        await waitFor(() => {
            expect(drawOlive).toHaveBeenCalledWith(canvas);
        });
    });
});