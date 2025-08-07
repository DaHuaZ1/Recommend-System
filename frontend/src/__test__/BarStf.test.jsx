import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import * as router from "react-router-dom";
import TopBar from "../components/BarStf";

// mock MUI icon 组件，防止报 warning 或 svg 影响
vi.mock('@mui/icons-material/SettingsOutlined', () => ({
    __esModule: true,
    default: () => <span data-testid="SettingsIcon" />
}));
vi.mock('@mui/icons-material/Logout', () => ({
    __esModule: true,
    default: () => <span data-testid="LogoutIcon" />
}));
vi.mock('@mui/icons-material/PersonOutline', () => ({
    __esModule: true,
    default: () => <span data-testid="PersonIcon" />
}));

// mock react-router-dom
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useLocation: vi.fn(),
        useNavigate: vi.fn(),
        Link: ({ to, children }) => <a href={to}>{children}</a>,
        MemoryRouter: actual.MemoryRouter, // for testing
    };
});

describe("TopBar (BarStf.jsx)", () => {
    let mockNavigate;
    beforeEach(() => {
        mockNavigate = vi.fn();
        router.useNavigate.mockReturnValue(mockNavigate);
        // 手动 mock useLocation
        router.useLocation.mockReturnValue({ pathname: "/staff/index" });
        localStorage.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders all navigation links and app title", () => {
        render(
            <router.MemoryRouter>
                <TopBar />
            </router.MemoryRouter>
        );
        expect(screen.getByText("PoJFit")).toBeInTheDocument();
        expect(screen.getByText("Projects")).toBeInTheDocument();
        expect(screen.getByText("Group")).toBeInTheDocument();
    });

    it("clicks on title triggers navigation to /staff/index", () => {
        render(
            <router.MemoryRouter>
                <TopBar />
            </router.MemoryRouter>
        );
        fireEvent.click(screen.getByText("PoJFit"));
        expect(mockNavigate).toHaveBeenCalledWith("/staff/index");
    });

    it("opens and closes the settings menu", () => {
        render(
            <router.MemoryRouter>
                <TopBar />
            </router.MemoryRouter>
        );
        // 打开设置菜单
        fireEvent.click(screen.getByTestId("SettingsIcon").closest("button"));
        expect(screen.getByText("Logout")).toBeInTheDocument();
        // 关闭菜单（点一下外部，实际 UI 交互一般会自动关闭，这里直接点 Logout 也行）
        fireEvent.click(screen.getByText("Logout"));
        // 由于点击 Logout 会弹出确认框，所以 menu 会消失，确认框会出现
        expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
    });

    it("confirms logout, clears localStorage and navigates to login", async () => {
        localStorage.setItem("token", "testtoken");
        render(
            <router.MemoryRouter>
                <TopBar />
            </router.MemoryRouter>
        );
        // 打开设置菜单并点击 Logout
        fireEvent.click(screen.getByTestId("SettingsIcon").closest("button"));
        fireEvent.click(screen.getByText("Logout"));
        // 点击 Sure
        fireEvent.click(screen.getByText("Sure"));
        await waitFor(() => {
            expect(localStorage.getItem("token")).toBeNull();
            expect(mockNavigate).toHaveBeenCalledWith("/staff/login", { replace: true });
        });
    });
});
