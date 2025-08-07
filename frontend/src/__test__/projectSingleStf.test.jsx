import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import ProjectSingle from '../components/projectSingleStf';

// mock useNavigate
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

const mockProject = {
    projectNumber: '101',
    projectTitle: 'AI Project',
    clientName: 'Test Client',
    groupCapacity: 2,
    requiredSkills: 'Python, React',
    projectRequirements: 'Do something cool',
    updatetime: '2025-01-01T12:34:56Z',
    topGroups: [
        { groupName: 'Group A', score: 95 },
        { groupName: 'Group B', score: 90 }
    ],
    pdfFile: '/pdf/101.pdf'
};

describe('ProjectSingle Component', () => {
    let mockNavigate;
    beforeEach(() => {
        localStorage.setItem('token', 'testtoken');
        mockNavigate = vi.fn();
        useNavigate.mockReturnValue(mockNavigate);

        window.open = vi.fn();

        // mock window.location.reload
        delete window.location;
        window.location = {
            ...window.location,
            reload: vi.fn(),
        };
    });




    afterEach(() => {
        localStorage.clear();
        vi.resetAllMocks();
    });

    test('renders project number and title', () => {
        render(
            <BrowserRouter>
                <ProjectSingle project={mockProject} />
            </BrowserRouter>
        );
        expect(screen.getByText(/Project 101/i)).toBeInTheDocument();
        expect(screen.getByText(/AI Project/i)).toBeInTheDocument();
    });

    test('renders Top Groups info', () => {
        render(
            <BrowserRouter>
                <ProjectSingle project={mockProject} />
            </BrowserRouter>
        );
        expect(screen.getByText(/Top Groups:/i)).toBeInTheDocument();
        expect(screen.getByText(/Group A - 95/)).toBeInTheDocument();
        expect(screen.getByText(/Group B - 90/)).toBeInTheDocument();
    });

    test('renders "None" if topGroups is empty', () => {
        const p = { ...mockProject, topGroups: [] };
        render(
            <BrowserRouter>
                <ProjectSingle project={p} />
            </BrowserRouter>
        );
        expect(screen.getByText('None')).toBeInTheDocument();
    });

    test('opens detail dialog on card click', () => {
        render(
            <BrowserRouter>
                <ProjectSingle project={mockProject} />
            </BrowserRouter>
        );
        fireEvent.click(screen.getByText(/Project 101/i));
        // dialog title出现
        expect(screen.getByRole('heading', { name: /AI Project/i })).toBeInTheDocument();
        expect(screen.getByText(/Update Time/i)).toBeInTheDocument();
    });

    test('click Reupload PDF triggers navigation', () => {
        render(
            <BrowserRouter>
                <ProjectSingle project={mockProject} />
            </BrowserRouter>
        );
        // 先打开弹窗
        fireEvent.click(screen.getByText(/Project 101/i));
        fireEvent.click(screen.getByText(/Reupload PDF/i));
        expect(mockNavigate).toHaveBeenCalledWith('/staff/upload');
    });

    test('click Download PDF triggers window.open', () => {
        render(
            <BrowserRouter>
                <ProjectSingle project={mockProject} />
            </BrowserRouter>
        );
        fireEvent.click(screen.getByText(/Project 101/i));
        fireEvent.click(screen.getByText(/Download PDF/i));
        expect(window.open).toHaveBeenCalledWith(expect.stringContaining('pdf/101.pdf'), '_blank');
    });
});
