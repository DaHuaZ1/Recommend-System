# 导入Flask框架和相关扩展
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # 处理跨域请求
from config import Config  # 导入配置文件
from models.user import db  # 导入数据库实例
from auth.controller import auth_bp  # 导入认证模块的蓝图


def create_app():
    """
    应用工厂函数 - 创建并配置Flask应用
    使用工厂模式的好处：
    1. 便于测试 - 可以为测试创建不同的应用实例
    2. 便于扩展 - 可以创建多个应用实例
    3. 配置灵活 - 可以根据环境加载不同配置
    """
    # 创建Flask应用实例
    app = Flask(__name__)

    # 从Config类加载所有配置
    # 包括数据库连接、JWT密钥、教师秘钥等
    app.config.from_object(Config)

    # 初始化Flask扩展
    CORS(app)  # 启用跨域支持，允许前端访问后端API
    db.init_app(app)  # 初始化数据库连接

    # 注册蓝图 - 将认证模块的路由注册到主应用
    # url_prefix='/api' 表示所有认证相关路由都以 /api 开头
    app.register_blueprint(auth_bp, url_prefix='/api')

    # 在应用上下文中创建数据库表
    # 如果表不存在，会自动创建
    with app.app_context():
        db.create_all()

    return app


# 创建应用实例
app = create_app()

# 应用入口点
if __name__ == '__main__':
    # 启动开发服务器
    # debug=True: 启用调试模式，代码修改后自动重启
    # host='0.0.0.0': 允许外部访问（不仅仅是localhost）
    # port=5000: 设置端口号
    app.run(debug=True, host='0.0.0.0', port=5000)
