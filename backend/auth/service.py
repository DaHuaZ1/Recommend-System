from models.user import User, db
from config import Config
import re

class AuthService:
    """
    认证服务类
    处理用户注册、登录等认证相关的业务逻辑
    包含数据验证、用户创建、身份验证等功能
    """
    
    
    @staticmethod
    def validate_email(email):
        """
        验证邮箱格式是否正确
        
        参数:
            email: 要验证的邮箱地址
            
        返回:
            bool: 邮箱格式是否正确
        """
        # 使用正则表达式验证邮箱格式
        # 匹配常见的邮箱格式：用户名@域名.顶级域名
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_password(password):
        """
        验证密码强度
        
        参数:
            password: 要验证的密码
            
        返回:
            tuple: (是否有效, 错误信息)
        """
        # 检查密码长度，至少6位
        if len(password) < 6:
            return False, "密码长度至少6位"
        return True, "密码格式正确"
    
    @staticmethod
    def register_student(email, username, password):
        """
        学生注册
        
        参数:
            email: 邮箱地址
            username: 用户名
            password: 密码
            
        返回:
            tuple: (是否成功, 消息)
        """
        # 第一步：验证邮箱格式
        if not AuthService.validate_email(email):
            return False, "邮箱格式不正确"
        
        # 第二步：验证密码强度
        is_valid, message = AuthService.validate_password(password)
        if not is_valid:
            return False, message
        
        # 第三步：检查邮箱是否已被注册
        if User.query.filter_by(email=email).first():
            return False, "邮箱已被注册"
        
        # 第四步：创建新用户
        try:
            # 创建学生用户对象
            user = User(email=email, username=username, password=password, role='student')
            # 添加到数据库会话
            db.session.add(user)
            # 提交事务
            db.session.commit()
            return True, "注册成功"
        except Exception as e:
            # 如果出现异常，回滚事务
            db.session.rollback()
            return False, f"注册失败: {str(e)}"
    
    @staticmethod
    def register_teacher(email, username, password, teacher_secret_key):
        """
        教师注册
        
        参数:
            email: 邮箱地址
            username: 用户名
            password: 密码
            teacher_secret_key: 教师注册秘钥
            
        返回:
            tuple: (是否成功, 消息)
        """
        # 第一步：验证教师秘钥
        if teacher_secret_key != Config.TEACHER_SECRET_KEY:
            return False, "教师注册秘钥不正确"
        
        # 第二步：验证邮箱格式
        if not AuthService.validate_email(email):
            return False, "邮箱格式不正确"
        
        # 第三步：验证密码强度
        is_valid, message = AuthService.validate_password(password)
        if not is_valid:
            return False, message
        
        # 第四步：检查邮箱是否已被注册
        if User.query.filter_by(email=email).first():
            return False, "邮箱已被注册"
        
        # 第五步：创建新教师用户
        try:
            # 创建教师用户对象
            user = User(email=email, username=username, password=password, role='teacher')
            # 添加到数据库会话
            db.session.add(user)
            # 提交事务
            db.session.commit()
            return True, "教师注册成功"
        except Exception as e:
            # 如果出现异常，回滚事务
            db.session.rollback()
            return False, f"注册失败: {str(e)}"
    
    @staticmethod
    def login_student(email, password):
        """
        学生登录
        
        参数:
            email: 邮箱地址
            password: 密码
            
        返回:
            tuple: (是否成功, 用户对象或错误信息)
        """
        # 根据邮箱和角色查找学生用户
        user = User.query.filter_by(email=email, role='student').first()
        
        # 检查用户是否存在
        if not user:
            return False, "用户不存在"
        
        # 验证密码是否正确
        if not user.check_password(password):
            return False, "密码错误"
        
        # 登录成功，返回用户对象
        return True, user
    
    @staticmethod
    def login_teacher(email, password, teacher_secret_key):
        """
        教师登录
        
        参数:
            email: 邮箱地址
            password: 密码
            teacher_secret_key: 教师登录秘钥
            
        返回:
            tuple: (是否成功, 用户对象或错误信息)
        """
        # 第一步：验证教师秘钥
        if teacher_secret_key != Config.TEACHER_SECRET_KEY:
            return False, "教师登录秘钥不正确"
        
        # 第二步：根据邮箱和角色查找教师用户
        user = User.query.filter_by(email=email, role='teacher').first()
        
        # 第三步：检查用户是否存在
        if not user:
            return False, "教师用户不存在"
        
        # 第四步：验证密码是否正确
        if not user.check_password(password):
            return False, "密码错误"
        
        # 登录成功，返回用户对象
        return True, user
    
    @staticmethod
    def get_user_by_id(user_id):
        """
        根据用户ID获取用户信息
        
        参数:
            user_id: 用户ID
            
        返回:
            User: 用户对象，如果不存在返回None
        """
        return User.query.get(user_id)
    
    @staticmethod
    def get_user_by_email(email):
        """
        根据邮箱获取用户信息
        
        参数:
            email: 邮箱地址
            
        返回:
            User: 用户对象，如果不存在返回None
        """
        return User.query.filter_by(email=email).first()
