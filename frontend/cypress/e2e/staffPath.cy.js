// staff端完整流程测试

window.describe('Staff完整流程', () => {
  window.it('注册登录后上传并编辑项目', () => {
    // 注册（假设和学生共用注册页）
    window.cy.visit('/signup');
    const email = `staff${Date.now()}@example.com`;
    window.cy.get('input[label="Email"], input[aria-label="Email"], input[name="email"]').type(email);
    window.cy.get('input[label="Password"], input[aria-label="Password"], input[name="password"]').first().type('Abcdef12!');
    window.cy.get('input[label="Confirm Password"], input[aria-label="Confirm Password"], input[name="confirmPassword"]').type('Abcdef12!');
    window.cy.get('div[role="button"][id*="country"],div[aria-label*="Country"],div[aria-labelledby*="country"]').click({force:true});
    window.cy.contains('China').click();
    window.cy.get('input[type="checkbox"]').check({force:true});
    window.cy.get('button[type="submit"]').click();
    window.cy.url().should('include', '/student/login');
    window.cy.contains('Log in to PoJFit');

    // 跳转到staff登录页
    window.cy.visit('/staff/login');
    // 登录
    window.cy.get('input[label="Email"], input[aria-label="Email"], input[name="email"], #email-login-input').type(email);
    window.cy.get('input[label="Password"], input[aria-label="Password"], input[name="password"], #password-login-input').type('Abcdef12!');
    window.cy.get('input[label="Secret Key"], input[aria-label="Secret Key"], input[name="secretKey"], #secretKey-login-input').type('123456');
    window.cy.get('input[label="Captcha"], input[aria-label="Captcha"], input[name="captcha"]').type('AAAA');
    window.cy.get('button[type="submit"], button:contains("Login")').click();
    window.cy.url().should('include', '/staff/index');

    // 进入project页面
    window.cy.contains('Projects').click();
    window.cy.url().should('include', '/staff/index');
    // 点击add按钮（假设有Add按钮或上传按钮）
    window.cy.contains('Add').click();
    window.cy.url().should('include', '/staff/upload');
    // 点击open files按钮，上传文件（假设有测试用的pdf文件在fixtures目录）
    window.cy.get('button').contains('Open Files').click();
    window.cy.get('input[type="file"]').selectFile(['cypress/fixtures/test_project1.pdf', 'cypress/fixtures/test_project2.pdf'], { action: 'select' });
    // 点击下一步
    window.cy.contains('➔').click();
    // 编辑页面，修改项目信息
    window.cy.get('input[name="projectTitle"]').first().clear().type('AI Project');
    window.cy.get('input[name="groupCapacity"]').first().clear().type('5');
    window.cy.get('input[name="clientName"]').first().clear().type('UNSW');
    window.cy.get('input[name="projectNumber"]').first().clear().type('P001');
    window.cy.get('textarea[name="projectRequirements"]').first().clear().type('AI related requirements');
    window.cy.get('textarea[name="requiredSkills"]').first().clear().type('Python, ML');
    // 点击confirm
    window.cy.contains('Confirm').click();
    // 跳转回project页面
    window.cy.url().should('include', '/staff/index');
    // 检查新上传的project是否在列表中
    window.cy.contains('AI Project');
  });
});
