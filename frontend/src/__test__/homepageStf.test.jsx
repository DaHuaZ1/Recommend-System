import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import HomeStf from '../components/HomepageStf';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

// 避免ProjectSingle影响测试
vi.mock('../components/projectSingleStf', () => ({
    default: () => <div data-testid="project-card">Mocked Project</div>
}));

describe('HomeStf Component', () => {
    let mockNavigate;

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('token', 'testtoken');
        mockNavigate = vi.fn();
        useNavigate.mockReturnValue(mockNavigate);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('renders search bar, add button, and default message', async () => {
        // 返回有项目
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    projects: [
                        { projectNumber: '101', projectTitle: 'AI Project', updatetime: '2025-01-01' }
                    ]
                })
            })
        ));

        render(
            <BrowserRouter>
                <HomeStf />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText(/search projects/i)).toBeInTheDocument();
        expect(screen.getByText(/add/i)).toBeInTheDocument();
        expect(await screen.findByText(/all projects here/i)).toBeInTheDocument();
    });

    test('clicking Add button triggers navigation', async () => {
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    projects: [
                        { projectNumber: '101', projectTitle: 'AI Project', updatetime: '2025-01-01' }
                    ]
                })
            })
        ));

        render(
            <BrowserRouter>
                <HomeStf />
            </BrowserRouter>
        );

        const addButton = screen.getByText(/add/i);
        fireEvent.click(addButton);

        expect(mockNavigate).toHaveBeenCalledWith('/staff/upload');
    });

    test('renders "No projects found" when there are no projects', async () => {
        // 返回空项目
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    projects: []
                })
            })
        ));

        render(
            <BrowserRouter>
                <HomeStf />
            </BrowserRouter>
        );

        const result = await screen.findByText(/no projects found/i);
        expect(result).toBeInTheDocument();
    });
});
