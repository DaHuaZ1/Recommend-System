window.describe('首页展示', () => {
  window.it('能访问首页并看到导航栏', () => {
    window.cy.visit('http://localhost:3000'); // 换成你的端口
    window.cy.contains('TopBar'); // 检查有 TopBar 文本
    // cy.get('nav') 等等
  });
});
