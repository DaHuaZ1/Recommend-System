import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomeStd from '../components/HomepageStd.jsx';

// mock TopBar
vi.mock('../components/Bar', () => ({
  __esModule: true,
  default: () => <div data-testid="topbar">TopBar</div>
}));
// mock ProjectSingle
vi.mock('../components/ProjectSingle', () => ({
  __esModule: true,
  default: ({ project }) => <div data-testid="project">{project.projectTitle}</div>
}));

const mockProjects = [
  {
    projectTitle: "AI Project",
    projectNumber: "1",
    updatetime: "2024-08-07"
  },
  {
    projectTitle: "Web Platform",
    projectNumber: "2",
    updatetime: "2024-08-06"
  }
];

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// mock fetch
beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects }),
    })
  );
  localStorage.clear();
  localStorage.setItem('token', 'testtoken');
});
afterEach(() => {
  vi.clearAllMocks();
});

describe('HomeStd', () => {
  it('renders TopBar and search input', async () => {
    render(
        <MemoryRouter>
            <HomeStd />
        </MemoryRouter>
    );
    // 顶栏存在
    expect(screen.getByTestId('topbar')).toBeInTheDocument();
    // 搜索框存在
    expect(screen.getByPlaceholderText('Search projects…')).toBeInTheDocument();

    // 等待加载项目和分割线文字变化
    await waitFor(() => {
        expect(screen.getByText('All Projects Here')).toBeInTheDocument();
        expect(screen.getByText('AI Project')).toBeInTheDocument();
        expect(screen.getByText('Web Platform')).toBeInTheDocument();
    });
    });

  it('filters projects by search keyword', async () => {
    render(
      <MemoryRouter>
        <HomeStd />
      </MemoryRouter>
    );
    // 等待加载
    await waitFor(() => screen.getByText('AI Project'));
    const input = screen.getByPlaceholderText('Search projects…');
    // 输入关键字
    fireEvent.change(input, { target: { value: 'web' } });
    expect(screen.queryByText('AI Project')).not.toBeInTheDocument();
    expect(screen.getByText('Web Platform')).toBeInTheDocument();
    // 搜索无结果
    fireEvent.change(input, { target: { value: 'zzzz' } });
    expect(screen.getByText('No matching projects found.')).toBeInTheDocument();
  });

  it('redirects to login if not logged in', () => {
    localStorage.clear();
    render(
      <MemoryRouter>
        <HomeStd />
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/student/login');
  });
});