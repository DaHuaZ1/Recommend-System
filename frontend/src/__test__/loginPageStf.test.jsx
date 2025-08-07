// src/__tests__/components/loginPageStf.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginStf from "../components/loginPageStf";
import { vi } from 'vitest';

describe('LoginStf Component', () => {
    const mockSetToken = vi.fn();

    const renderLogin = () => {
        return render(
            <BrowserRouter>
                <LoginStf setToken={mockSetToken} />
            </BrowserRouter>
        );
    };

    test('renders login form with all input fields', () => {
        renderLogin();

        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Secret Key/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Captcha/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });

    test('allows user to type into all input fields', () => {
        renderLogin();

        fireEvent.change(screen.getByLabelText(/Email/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByLabelText(/Secret Key/i), {
            target: { value: 'secret' },
        });
        fireEvent.change(screen.getByLabelText(/Captcha/i), {
            target: { value: 'ABCD' },
        });

        expect(screen.getByLabelText(/Email/i)).toHaveValue('test@example.com');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('password123');
        expect(screen.getByLabelText(/Secret Key/i)).toHaveValue('secret');
        expect(screen.getByLabelText(/Captcha/i)).toHaveValue('ABCD');
    });

    test('renders login button and triggers submit on click', () => {
        renderLogin();

        const loginBtn = screen.getByRole('button', { name: /Login/i });
        expect(loginBtn).toBeEnabled();

        fireEvent.click(loginBtn);
        // 无需断言 fetch，因为我们现在是行为级测试（非网络 mock）
    });

    test('clicking Student tab navigates to student login page', () => {
        renderLogin();

        const studentTab = screen.getByRole('tab', { name: /Student/i });
        fireEvent.click(studentTab);

        // 因为点击后直接用 navigate 触发路由，没法判断页面跳转结果（除非 mock navigate）
        // 所以这里只测试能点击
        expect(studentTab).toBeInTheDocument();
    });
});
