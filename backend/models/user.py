# 导入Flask-SQLAlchemy，用于数据库ORM操作
from flask_sqlalchemy import SQLAlchemy
# 导入Werkzeug的密码哈希工具，用于安全地处理密码
from werkzeug.security import generate_password_hash, check_password_hash

# 创建SQLAlchemy实例，用于数据库操作
db = SQLAlchemy()

class User(db.Model):
    """
    用户模型类
    对应数据库中的users表
    定义了用户的基本信息和相关方法
    """
    
    # 指定数据库表名
    __tablename__ = 'users'
    
    # ==================== 数据库字段定义 ====================
    
    # 用户ID，主键，自动递增
    id = db.Column(db.Integer, primary_key=True)
    
    # 邮箱地址，唯一，不能为空
    # 用于登录和身份识别
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    # 用户名，允许为空
    username = db.Column(db.String(80), nullable=True)
    
    # 密码哈希值，不能为空
    # 存储的是加密后的密码，不是明文密码
    password_hash = db.Column(db.String(255), nullable=False)
    
    # 用户角色，允许为空
    role = db.Column(db.String(20), nullable=True)
    
    def __init__(self, email, username, password, role='student'):
        """
        用户模型构造函数
        创建用户时自动对密码进行哈希处理
        
        参数:
            email: 邮箱地址
            username: 用户名
            password: 明文密码（会被自动哈希）
            role: 用户角色，默认为学生
        """
        self.email = email
        self.username = username
        # 使用Werkzeug对密码进行安全哈希
        # 这样即使数据库被泄露，密码也是安全的
        self.password_hash = generate_password_hash(password)
        self.role = role
    
    def check_password(self, password):
        """
        验证用户密码
        
        参数:
            password: 要验证的明文密码
            
        返回:
            bool: 密码是否正确
        """
        # 使用Werkzeug验证密码哈希
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """
        将用户对象转换为字典格式
        用于JSON响应，不包含敏感信息（如密码哈希）
        
        返回:
            dict: 用户信息的字典表示
        """
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'role': self.role
        }
    
    def __repr__(self):
        """
        用户对象的字符串表示
        用于调试和日志记录
        """
        return f'<User {self.email}>'
