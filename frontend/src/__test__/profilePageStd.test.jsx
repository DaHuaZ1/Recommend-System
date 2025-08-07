import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePageStd from '../components/profilePageStd.jsx';

// mock TopBar
vi.mock('../components/Bar', () => ({
  __esModule: true,
  default: () => <div data-testid="topbar">TopBar</div>
}));

// mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// mock window.confirm/alert
global.alert = vi.fn();
global.confirm = vi.fn();

const MOCK_USER = {
  name: 'Alice',
  email: 'alice@test.com',
  major: 'CS',
  skill: 'React',
};

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn((url, opts) => {
    // GET: 拉数据
    if (opts === undefined || opts.method === "GET") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(MOCK_USER)
      });
    }
    // POST: 保存
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
  localStorage.clear();
});

describe('ProfilePageStd', () => {
  it('renders all fields after loading', async () => {
    render(<ProfilePageStd />);
    expect(screen.getByTestId('topbar')).toBeInTheDocument();
    // 等待数据加载并渲染
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue(MOCK_USER.name);
      expect(screen.getByLabelText('Email')).toHaveValue(MOCK_USER.email);
      expect(screen.getByLabelText('Major')).toHaveValue(MOCK_USER.major);
      expect(screen.getByLabelText('Skill')).toHaveValue(MOCK_USER.skill);
    });
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reupload Resume/i })).toBeInTheDocument();
  });

  it('can edit fields and save', async () => {
    render(<ProfilePageStd />);
    await waitFor(() => screen.getByLabelText('Name'));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText('Major'), { target: { value: 'IT' } });
    fireEvent.change(screen.getByLabelText('Skill'), { target: { value: 'Node.js' } });

    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    // 会alert成功
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Profile updated successfully');
    });
    // 保存后 originalData 更新，继续点击 Save 会提示 no change
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    expect(global.alert).toHaveBeenCalledWith('No changes made');
  });

  it('save with empty fields will alert error', async () => {
    render(<ProfilePageStd />);
    await waitFor(() => screen.getByLabelText('Name'));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    expect(global.alert).toHaveBeenCalledWith('Please fill in all fields');
  });

  it('clicking Back without changes calls navigate(-1)', async () => {
    render(<ProfilePageStd />);
    await waitFor(() => screen.getByLabelText('Name'));
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('clicking Back with changes will confirm before leaving', async () => {
    render(<ProfilePageStd />);
    await waitFor(() => screen.getByLabelText('Name'));
    // 改一个字段
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Changed' } });
    global.confirm.mockReturnValueOnce(false); // 不离开
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockNavigate).not.toHaveBeenCalled();
    global.confirm.mockReturnValueOnce(true); // 这次点确认
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('clicking Reupload Resume navigates to upload page', async () => {
    render(<ProfilePageStd />);
    await waitFor(() => screen.getByLabelText('Name'));
    fireEvent.click(screen.getByRole('button', { name: /Reupload Resume/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/student/upload');
  });
});