import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { BrowserRouter, useNavigate } from "react-router-dom";
import UploadStf from "../components/uploadPageStf";

// mock useNavigate
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

// mock TopBar, 图片等静态资源
vi.mock("../../components/BarStf", () => () => <div data-testid="topbar">TopBar</div>);
vi.mock("../../assets/file_logo2.png", () => "file_logo2.png");
vi.mock("../../assets/file_logo.png", () => "file_logo.png");

// mock backendURL
vi.mock("../../backendURL", () => ({ default: "http://mock-backend" }));

describe("UploadStf (uploadPageStf.jsx)", () => {
    let mockNavigate;
    beforeEach(() => {
        mockNavigate = vi.fn();
        useNavigate.mockReturnValue(mockNavigate);
        localStorage.setItem("token", "testtoken");
    });

    afterEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("does not proceed to next step if no files uploaded", () => {
        render(
            <BrowserRouter>
                <UploadStf />
            </BrowserRouter>
        );
        const nextBtn = screen.getAllByRole("button").find(btn => btn.textContent.includes("➔"));
        expect(nextBtn).toBeDisabled();
    });

    it("uploads file and displays it", async () => {
        render(
            <BrowserRouter>
                <UploadStf />
            </BrowserRouter>
        );
        // 模拟文件上传
        const file = new File(["test content"], "test.pdf", { type: "application/pdf" });

        // 直接操作input[type=file]
        const input = document.querySelectorAll('input[type="file"]')[1].parentElement.querySelector('input[type="file"]');
        // fireEvent.change不能直接用files数组，需要用Object.defineProperty
        Object.defineProperty(input, 'files', {
            value: [file]
        });
        fireEvent.change(input);

        // 右侧文件列表会出现
        expect(await screen.findByText("test.pdf")).toBeInTheDocument();
        expect(screen.getByText(/MB/)).toBeInTheDocument();
    });

    it("can remove uploaded file", async () => {
        render(
            <BrowserRouter>
                <UploadStf />
            </BrowserRouter>
        );
        const file = new File(["hello"], "delete_me.pdf", { type: "application/pdf" });
        const input = document.querySelectorAll('input[type="file"]')[1].parentElement.querySelector('input[type="file"]');
        Object.defineProperty(input, 'files', { value: [file] });
        fireEvent.change(input);

        expect(await screen.findByText("delete_me.pdf")).toBeInTheDocument();

        // 点击 Remove
        const removeBtn = screen.getByText(/Remove/i);
        fireEvent.click(removeBtn);
        await waitFor(() => {
            expect(screen.queryByText("delete_me.pdf")).not.toBeInTheDocument();
        });
    });

    it("goes to next step and renders project forms (simulate uploadProjects)", async () => {
        // mock fetch - POST 返回表单数据
        vi.stubGlobal("fetch", vi.fn((url, opt) => {
            if (opt.method === "POST") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        projects: [
                            {
                                projectTitle: "",
                                groupCapacity: "",
                                clientName: "",
                                projectNumber: "",
                                projectRequirements: "",
                                requiredSkills: ""
                            }
                        ]
                    })
                });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }));

        render(
            <BrowserRouter>
                <UploadStf />
            </BrowserRouter>
        );
        // 上传一个文件
        const file = new File(["xxx"], "step2.pdf", { type: "application/pdf" });
        const input = document.querySelectorAll('input[type="file"]')[1].parentElement.querySelector('input[type="file"]');
        Object.defineProperty(input, 'files', { value: [file] });
        fireEvent.change(input);

        // 等待文件出现在界面
        expect(await screen.findByText("step2.pdf")).toBeInTheDocument();

        // 点击下一步（➔）
        const nextBtn = screen.getAllByRole("button").find(btn => btn.textContent.includes("➔"));
        fireEvent.click(nextBtn);

        // ProgressBar进入第二步，渲染表单
        expect(await screen.findByPlaceholderText("Enter your project title")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your group capacity")).toBeInTheDocument();
    });

});
