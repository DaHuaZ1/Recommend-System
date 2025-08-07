import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GroupStd from '../components/groupPageStd.jsx';

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

// fake localStorage
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('token', 'token');
  localStorage.setItem('email', 'me@test.com');
});
afterEach(() => {
  vi.clearAllMocks();
});

// 默认后端返回未分组
const mockGroupGetNotGrouped = () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ grouped: false }),
    })
  );
};
// 后端返回已分组
const mockGroupGetGrouped = () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          grouped: true,
          groupName: 'Alpha',
          groupMembers: { 'me@test.com': 'Myself', 'a@b.com': 'Alice' },
        }),
    })
  );
};

describe('GroupStd', () => {
  it('renders hero/empty group UI and can open create group dialog', async () => {
    mockGroupGetNotGrouped();
    render(<GroupStd />);
    expect(screen.getByTestId('topbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Your Project Groups/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/No groups yet/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /create group/i }));
    expect(screen.getByText(/Create a New Group/i)).toBeInTheDocument();
    // 默认不能点 Confirm
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeDisabled();
  });

  it('adds/removes members, checks email, disables confirm unless valid', async () => {
    mockGroupGetNotGrouped();
    render(<GroupStd />);
    fireEvent.click(await screen.findByRole('button', { name: /create group/i }));

    // 输入无效邮箱，模拟回车（兼容你的实际组件行为）
    const addInput = screen.getByLabelText(/add member/i);
    fireEvent.change(addInput, { target: { value: 'invalid' } });
    fireEvent.keyDown(addInput, { key: 'Enter', code: 'Enter', charCode: 13 });

    // 用 findAllByText 匹配多个弹窗
    const invalidEmailAlerts = await screen.findAllByText(
      (content, node) =>
        node.textContent && node.textContent.toLowerCase().includes('invalid email format')
    );
    expect(invalidEmailAlerts.length).toBeGreaterThan(0);

    // 容错：如果你的组件支持Add按钮，也一并点一次（不影响结果）
    // fireEvent.click(screen.getByText('Add'));

    // 宽松查找
    const alerts = await screen.findAllByText(
        (content, node) => node.textContent && node.textContent.toLowerCase().includes('invalid email format')
    );
    expect(alerts.length).toBeGreaterThan(0);


    // 连续添加5个有效邮箱（用回车模拟输入）
    for (let i = 1; i <= 5; ++i) {
      fireEvent.change(addInput, { target: { value: `user${i}@test.com` } });
      fireEvent.keyDown(addInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    }
    // 显示出5个chip
    for (let i = 1; i <= 5; ++i) {
      expect(screen.getByText(`user${i}@test.com`)).toBeInTheDocument();
    }
    // 不能再加了
    fireEvent.change(addInput, { target: { value: `user6@test.com` } });
    fireEvent.keyDown(addInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(await screen.findByText(/only add up to 5/i)).toBeInTheDocument();

    // 移除一个
    const deleteButtons = document.querySelectorAll('.MuiChip-deleteIcon');
    fireEvent.click(deleteButtons[0]);
    expect(screen.queryByText('user1@test.com')).not.toBeInTheDocument();
  });

  it('enables confirm button only with valid group name & at least 5 members', async () => {
    mockGroupGetNotGrouped();
    render(<GroupStd />);
    fireEvent.click(await screen.findByRole('button', { name: /create group/i }));

    // 组名为空，不能点
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeDisabled();

    // 填组名但不够5人
    fireEvent.change(screen.getByLabelText(/Group Name/i), { target: { value: 'TeamX' } });
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeDisabled();

    // 补足成员数（用回车）
    const addInput = screen.getByLabelText(/add member/i);
    for (let i = 1; i <= 5; ++i) {
      fireEvent.change(addInput, { target: { value: `user${i}@test.com` } });
      fireEvent.keyDown(addInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    }
    // 现在能点 Confirm
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeEnabled();
  });

  it('can confirm and create group, shows success snackbar', async () => {
    mockGroupGetNotGrouped();
    // mock 创建组
    global.fetch = vi.fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ grouped: false }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              grouped: true,
              groupName: 'Alpha',
              groupMembers: { 'me@test.com': 'Me', 'a@b.com': 'Alice' },
            }),
        })
      );

    render(<GroupStd />);
    fireEvent.click(await screen.findByRole('button', { name: /create group/i }));
    fireEvent.change(screen.getByLabelText(/Group Name/i), { target: { value: 'Alpha' } });

    // 补足成员（用回车）
    const addInput = screen.getByLabelText(/add member/i);
    for (let i = 1; i <= 5; ++i) {
      fireEvent.change(addInput, { target: { value: `user${i}@test.com` } });
      fireEvent.keyDown(addInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    }
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    // 打开确认弹窗
    expect(screen.getByText(/Confirm Group Creation/i)).toBeInTheDocument();

    // 点击Create，模拟创建成功
    fireEvent.click(screen.getByRole('button', { name: /^Create$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Group created successfully/i)).toBeInTheDocument();
    });
  });

  it('shows joined group info after grouped', async () => {
    mockGroupGetGrouped();
    render(<GroupStd />);
    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText(/My Group|Alpha/i)).toBeInTheDocument();
    });
    // 展示成员
    expect(screen.getByText(/Myself \(me@test.com\)/)).toBeInTheDocument();
    expect(screen.getByText(/Alice \(a@b.com\)/)).toBeInTheDocument();
    // 有Delete按钮
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('can delete group and see snackbar', async () => {
    mockGroupGetGrouped();
    // mock删除组
    global.fetch = vi.fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              grouped: true,
              groupName: 'Alpha',
              groupMembers: { 'me@test.com': 'Me', 'a@b.com': 'Alice' },
            }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ grouped: false }),
        })
      );

    render(<GroupStd />);
    await waitFor(() => screen.getByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByText(/Group deleted successfully/i)).toBeInTheDocument();
    });
  });

  it('redirects to login if not logged in', async () => {
    localStorage.clear();
    render(<GroupStd />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/student/login');
    });
  });
});
