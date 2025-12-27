import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import ProtectedRoute from "../../src/ProtectedRoute.jsx"; 
import { useAuth } from "../../src/authContext/useAuth.js";

vi.mock("../../src/authContext/useAuth.js", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  Navigate: ({ to, replace }) => (
    <div data-testid="navigate" data-to={to} data-replace={String(replace)} />
  ),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("рендерит children, если allow пустой (доступ разрешён всем)", () => {
    useAuth.mockReturnValue({ role: null, roles: null });

    render(
      <ProtectedRoute allow={[]}>
        <div>SECRET</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("SECRET")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).toBeNull();
  });

  it("рендерит children, если роль входит в allow (через role)", () => {
    useAuth.mockReturnValue({ role: "admin", roles: [] });

    render(
      <ProtectedRoute allow={["admin"]}>
        <div>SECRET</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("SECRET")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).toBeNull();
  });

  it("рендерит children, если роль входит в allow (через roles массив)", () => {
    useAuth.mockReturnValue({ role: "user", roles: ["editor"] });

    render(
      <ProtectedRoute allow={["editor"]}>
        <div>SECRET</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("SECRET")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).toBeNull();
  });

  it("делает редирект на / и replace=true, если доступ запрещён", () => {
    useAuth.mockReturnValue({ role: "user", roles: ["viewer"] });

    render(
      <ProtectedRoute allow={["admin", "editor"]}>
        <div>SECRET</div>
      </ProtectedRoute>
    );

    const nav = screen.getByTestId("navigate");
    expect(nav).toHaveAttribute("data-to", "/");
    expect(nav).toHaveAttribute("data-replace", "true");
    expect(screen.queryByText("SECRET")).toBeNull();
  });
});