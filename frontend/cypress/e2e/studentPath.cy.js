// 学生注册流程测试

window.describe('学生注册流程', () => {
  window.it('可以成功注册新用户并跳转到登录页', () => {
    // 访问注册页
    window.cy.visit('/signup');

    // 填写邮箱
    window.cy.get('input[label="Email"], input[aria-label="Email"], input[name="email"]').type(`test${Date.now()}@example.com`);
    // 填写密码
    window.cy.get('input[label="Password"], input[aria-label="Password"], input[name="password"]').first().type('Abcdef12!');
    // 填写确认密码
    window.cy.get('input[label="Confirm Password"], input[aria-label="Confirm Password"], input[name="confirmPassword"]').type('Abcdef12!');
    // 选择国家
    window.cy.get('div[role="button"][id*="country"],div[aria-label*="Country"],div[aria-labelledby*="country"]').click({force:true});
    window.cy.contains('China').click();
    // 勾选同意checkbox
    window.cy.get('input[type="checkbox"]').check({force:true});
    // 提交表单
    window.cy.get('button[type="submit"]').click();

    // 跳转到登录页
    window.cy.url().should('include', '/student/login');
    window.cy.contains('Log in to PoJFit');
  });
});

// 学生登录流程测试
window.describe('学生登录流程', () => {
  window.it('可以成功登录并跳转到首页或上传简历页', () => {
    // 访问登录页
    window.cy.visit('/student/login');

    // 填写邮箱
    window.cy.get('input[label="Email"], input[aria-label="Email"], input[name="email"], #email-login-input').type('testuser@example.com');
    // 填写密码
    window.cy.get('input[label="Password"], input[aria-label="Password"], input[name="password"], #password-login-input').type('Abcdef12!');
    // 填写验证码（开发环境可用AAAA跳过）
    window.cy.get('input[label="Captcha"], input[aria-label="Captcha"], input[name="captcha"]').type('AAAA');
    // 提交表单
    window.cy.get('button[type="submit"], button:contains("Login")').click();

    // 跳转到首页或上传简历页
    window.cy.url().should('satisfy', (url) => url.includes('/student/index') || url.includes('/student/upload'));
  });
});

// 学生完整流程测试
window.describe('学生完整流程', () => {
  window.it('注册登录后创建组并推荐项目', () => {
    // 注册
    window.cy.visit('/signup');
    const email = `test${Date.now()}@example.com`;
    window.cy.get('input[label="Email"], input[aria-label="Email"], input[name="email"]').type(email);
    window.cy.get('input[label="Password"], input[aria-label="Password"], input[name="password"]').first().type('Abcdef12!');
    window.cy.get('input[label="Confirm Password"], input[aria-label="Confirm Password"], input[name="confirmPassword"]').type('Abcdef12!');
    window.cy.get('div[role="button"][id*="country"],div[aria-label*="Country"],div[aria-labelledby*="country"]').click({force:true});
    window.cy.contains('China').click();
    window.cy.get('input[type="checkbox"]').check({force:true});
    window.cy.get('button[type="submit"]').click();
    window.cy.url().should('include', '/student/login');
    window.cy.contains('Log in to PoJFit');

    // 登录
    window.cy.get('input[label="Email"], input[aria-label="Email"], input[name="email"], #email-login-input').type(email);
    window.cy.get('input[label="Password"], input[aria-label="Password"], input[name="password"], #password-login-input').type('Abcdef12!');
    window.cy.get('input[label="Captcha"], input[aria-label="Captcha"], input[name="captcha"]').type('AAAA');
    window.cy.get('button[type="submit"], button:contains("Login")').click();
    window.cy.url().should('satisfy', (url) => url.includes('/student/index') || url.includes('/student/upload'));

    // 跳转 group 页面
    window.cy.contains('Group').click();
    window.cy.url().should('include', '/student/group');
    // 点击创建组按钮
    window.cy.contains('Create Group').click();
    // 输入组名
    window.cy.get('input[label="Group Name"], input[aria-label="Group Name"], input[name="groupName"]').type('unsw');
    // 依次添加组员
    const members = ['14@14.com', 'w@w.com', 'x@x.com', 'y@y.com', 'z@z.com'];
    members.forEach((m) => {
      window.cy.get('input[label*="email"], input[aria-label*="email"], input[type="email"]').type(m);
      window.cy.contains('Add').click();
    });
    // 点击确认按钮
    window.cy.contains('Confirm').click();
    // 在弹窗中点击 Create
    window.cy.contains('Create').click();
    // 检查提示
    window.cy.contains('Group created successfully!');
    // 检查组名显示
    window.cy.contains('unsw');

    // 跳转 recommend 页面
    window.cy.contains('Recommend').click();
    window.cy.url().should('include', '/student/group/recommend');
    // 点击正中间推荐按钮（aria-label）
    window.cy.get('button[aria-label="Get project recommendations"], [aria-label="Get project recommendations"]').click();
    // 检查 loading 或推荐结果
    window.cy.contains('Finding the best projects for you...').should('exist');
    // 推荐结果出现后，检查推荐标题
    window.cy.contains('Recommended Projects', { timeout: 10000 });
  });
});
