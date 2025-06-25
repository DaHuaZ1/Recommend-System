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
        if len(password) < 8:
            return False, "密码长度至少6位"
        return True, "密码格式正确"
    
    @staticmethod
    def register_user(email, password):
        if not AuthService.validate_email(email):
            return False, "邮箱格式不正确"
        # is_valid, message = AuthService.validate_password(password)
        # if not is_valid:
        #     return False, message
        if User.query.filter_by(email=email).first():
            return False, "邮箱已被注册"
        try:
            user = User(email=email, username=None, password=password, role=None)
            db.session.add(user)
            db.session.commit()
            return True, "注册成功"
        except Exception as e:
            db.session.rollback()
            return False, f"注册失败: {str(e)}"
    
    @staticmethod
    def login_user(email, password, secret_key=None):
        """
        用户登录接口
        ---
        tags:
          - 用户认证
        parameters:
          - name: body
            in: body
            required: true
            schema:
              type: object
              properties:
                email:
                  type: string
                  example: b@b.com
                password:
                  type: string
                  example: qqqqqq
                secret_key:
                  type: string
                  example: 123456
                  description: "仅教师登录时需要"
        responses:
          200:
            description: 登录成功
            schema:
              type: object
              properties:
                token:
                  type: string
                user_type:
                  type: string
                user:
                  type: object
                  properties:
                    id:
                      type: integer
                    email:
                      type: string
                    username:
                      type: string
                    role:
                      type: string
          400:
            description: 参数错误
            schema:
              type: object
              properties:
                message:
                  type: string
                status:
                  type: string
          401:
            description: 登录失败
            schema:
              type: object
              properties:
                message:
                  type: string
                status:
                  type: string
        """
        print("email:", email, flush=True)
        print("password:", password, flush=True)
        print("secret_key:", secret_key, flush=True)
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return False, "账号或密码错误"
        if secret_key:
            # 老师登录
            if secret_key != Config.TEACHER_SECRET_KEY:
                return False, "密钥错误或不是老师账号"
                
            else:
                user_type = 'teacher'
                return True, (generate_token(user.id, user_type), user_type, user.to_dict())
        else:
            # 学生登录
            user_type = 'student'
            return True, (generate_token(user.id, user_type), user_type, user.to_dict())
    
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
