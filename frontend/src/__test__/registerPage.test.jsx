import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../components/registerPage.jsx';

// mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, ...props }) => <a href={to} {...props} />,
  };
});

// mock静态资源
vi.mock('../assets/hero.webp', () => ({ default: '' }));
vi.mock('../assets/logo.jpg', () => ({ default: '' }));
vi.mock('../assets/bg.webp', () => ({ default: '' }));

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
});
afterEach(() => {
  vi.clearAllMocks();
});

describe('Signup/RegisterPage', () => {
  it('renders all fields and default values', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    // 有logo
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
    // 有标题
    expect(screen.getByText('Sign up to PoJFit')).toBeInTheDocument();
    // 有邮箱
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    // 有密码和确认密码（共2个password label）
    const pwInputs = screen.getAllByLabelText(/password/i);
    expect(pwInputs[0]).toBeInTheDocument();
    expect(pwInputs[1]).toBeInTheDocument();
    // 有下拉
    expect(screen.getByLabelText(/your country/i)).toBeInTheDocument();
    // 有同意checkbox
    expect(screen.getByLabelText(/Receive occasional product updates/i)).toBeInTheDocument();
    // 有注册按钮
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    // 有登录引导
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('shows password strength when typing password', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    const [pwInput] = screen.getAllByLabelText(/password/i);
    fireEvent.change(pwInput, { target: { value: 'Abcdef12!' } });
    // 有进度条
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows password mismatch error', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    const [pwInput, confirmInput] = screen.getAllByLabelText(/password/i);
    fireEvent.change(pwInput, { target: { value: 'abcABC123$' } });
    fireEvent.change(confirmInput, { target: { value: 'wrongpass' } });
    // HelperText
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    // 点击提交也弹窗
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it('can select country from dropdown', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    const select = screen.getByLabelText(/your country/i);
    fireEvent.mouseDown(select);
    // 打开后可以选择 China
    expect(screen.getByText('China')).toBeInTheDocument();
    fireEvent.click(screen.getByText('China'));
    expect(select.value === 'China' || screen.getByDisplayValue('China')).toBeTruthy();
  });

  it('submits and redirects to login on success', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'foo@test.com' } });
    const [pwInput, confirmInput] = screen.getAllByLabelText(/password/i);
    fireEvent.change(pwInput, { target: { value: 'abcABC123$' } });
    fireEvent.change(confirmInput, { target: { value: 'abcABC123$' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/student/login', { replace: true });
    });
  });

  it('shows backend error if register fails', async () => {
    // 返回非ok
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'This email already exists' }),
      })
    );
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'foo@test.com' } });
    const [pwInput, confirmInput] = screen.getAllByLabelText(/password/i);
    fireEvent.change(pwInput, { target: { value: 'abcABC123$' } });
    fireEvent.change(confirmInput, { target: { value: 'abcABC123$' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('This email already exists')).toBeInTheDocument();
    });
  });
});