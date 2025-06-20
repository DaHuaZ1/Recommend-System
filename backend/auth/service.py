from models.user import User, db
from config import Config
import re
from utils.jwt_utils import generate_token

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
    def register_user(email, username, password, user_type, secret_key=None):
        # 校验邮箱
        if not AuthService.validate_email(email):
            return False, "邮箱格式不正确"
        # 校验密码
        is_valid, message = AuthService.validate_password(password)
        if not is_valid:
            return False, message
        # 检查邮箱是否已注册
        if User.query.filter_by(email=email).first():
            return False, "邮箱已被注册"
        # 判断用户类型
        if user_type == 'teacher':
            if not secret_key or secret_key != Config.TEACHER_SECRET_KEY:
                return False, "教师注册需要正确的 secret_key"
            role = 'teacher'
        elif user_type == 'student':
            role = 'student'
        else:
            return False, "user_type 只能为 student 或 teacher"
        try:
            user = User(email=email, username=username, password=password, role=role)
            db.session.add(user)
            db.session.commit()
            return True, "注册成功"
        except Exception as e:
            db.session.rollback()
            return False, f"注册失败: {str(e)}"
    
    @staticmethod
    def login_user(email, password, user_type, secret_key=None):
        if user_type == 'teacher':
            if not secret_key or secret_key != Config.TEACHER_SECRET_KEY:
                return False, "教师登录需要正确的 secret_key"
            user = User.query.filter_by(email=email, role='teacher').first()
            if not user:
                return False, "教师用户不存在"
            if not user.check_password(password):
                return False, "密码错误"
            token = generate_token(user.id, user.role)
            return True, (token, 'teacher')
        elif user_type == 'student':
            user = User.query.filter_by(email=email, role='student').first()
            if not user:
                return False, "用户不存在"
            if not user.check_password(password):
                return False, "密码错误"
            token = generate_token(user.id, user.role)
            return True, (token, 'student')
        else:
            return False, "user_type 只能为 student 或 teacher"
    
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
