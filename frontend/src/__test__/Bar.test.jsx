import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import TopBar from '../components/Bar.jsx';

// Mock useNavigate
vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('TopBar', () => {
  it('renders the title and nav links', () => {
    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>
    );
    expect(screen.getByText('PoJFit')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Recommend')).toBeInTheDocument();
    expect(screen.getByText('Group')).toBeInTheDocument();
  });

  it('shows menu when settings button clicked', () => {
    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>
    );
    const settingsBtn = screen.getByRole('button', { name: '' }); // 无label, 只有icon
    fireEvent.click(settingsBtn);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows logout confirm dialog when logout clicked', () => {
    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>
    );
    // 打开菜单
    const settingsBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(settingsBtn);

    // 点击Logout
    fireEvent.click(screen.getByText('Logout'));

    // 确认框应该弹出
    expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to log out?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Sure')).toBeInTheDocument();
  });
});