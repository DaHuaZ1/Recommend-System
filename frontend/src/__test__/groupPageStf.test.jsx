import React from "react";
import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GroupStf from "../components/groupPageStf";

// 1. mock backendURL 和 TopBar
vi.mock("../backendURL", () => ({ default: "http://test-backend" }));
vi.mock("../BarStf", () => () => <div data-testid="topbar">TopBar</div>);

// 2. mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("GroupStf (groupPageStf.jsx)", () => {
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockReset();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("redirects to login if token is missing", () => {
        render(
            <MemoryRouter>
                <GroupStf />
            </MemoryRouter>
        );
        expect(mockNavigate).toHaveBeenCalledWith("/staff/login");
    });

    it("shows loading and then renders group cards", async () => {
        localStorage.setItem("token", "mock-token");
        const mockGroups = [
            {
                groupName: "Group A",
                groupMembers: [
                    { name: "Alice", email: "alice@test.com", major: "CS", skill: "React" },
                    { name: "Bob", email: "bob@test.com", major: "Math", skill: "Vue" },
                ],
                recommendProjects: [
                    { projectNumber: 1, projectTitle: "Project One", final_score: 88, rank: 1 },
                    { projectNumber: 2, projectTitle: "Project Two", final_score: 80, rank: 2 },
                ],
            },
            {
                groupName: "Group B",
                groupMembers: [],
                recommendProjects: [],
            },
        ];
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ groups: mockGroups }),
        });

        render(
            <MemoryRouter>
                <GroupStf />
            </MemoryRouter>
        );

        expect(screen.getByRole("progressbar")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText("Group A")).toBeInTheDocument();
            expect(screen.getByText("Group B")).toBeInTheDocument();
        });

        expect(screen.getByText(/Alice \(alice@test.com\)/)).toBeInTheDocument();
        expect(screen.getByText(/Bob \(bob@test.com\)/)).toBeInTheDocument();
    });

    it("shows message when no recommended projects", async () => {
        localStorage.setItem("token", "mock-token");
        const group = {
            groupName: "EmptyGroup",
            groupMembers: [],
            recommendProjects: [],
        };
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ groups: [group] }),
        });

        render(
            <MemoryRouter>
                <GroupStf />
            </MemoryRouter>
        );

        await screen.findByText("EmptyGroup");
        fireEvent.click(screen.getByText("EmptyGroup"));

        expect(screen.getByText("Group has not clicked recommend button.")).toBeInTheDocument();
    });

    it("redirects to login on 401 when fetching groups", async () => {
        localStorage.setItem("token", "mock-token");
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            status: 401,
            text: async () => "Unauthorized",
        });

        render(
            <MemoryRouter>
                <GroupStf />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/staff/login");
        });
    });

    it("redirects to login on 401 when fetching project", async () => {
        localStorage.setItem("token", "mock-token");
        const group = {
            groupName: "NeedLogin",
            groupMembers: [],
            recommendProjects: [
                { projectNumber: 123, projectTitle: "P123", final_score: 80, rank: 1 },
            ],
        };
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ groups: [group] }),
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 401,
                text: async () => "Unauthorized",
            });

        render(
            <MemoryRouter>
                <GroupStf />
            </MemoryRouter>
        );

        await screen.findByText("NeedLogin");
        fireEvent.click(screen.getByText("NeedLogin"));
        fireEvent.click(screen.getByText("P123"));
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/staff/login");
        });
    });
});
