# 导入JWT库，用于生成和验证JSON Web Token
import jwt
# 导入日期时间模块，用于设置token过期时间
from datetime import datetime, timedelta
# 导入装饰器工具，用于创建权限验证装饰器
from functools import wraps
# 导入Flask相关模块
from flask import request, jsonify, current_app
# 导入用户模型
from models.user import User

def generate_token(user_id, role):
    """
    生成JWT token
    
    参数:
        user_id: 用户ID
        role: 用户角色（student/teacher）
        
    返回:
        str: 编码后的JWT token
    """
    # 构建JWT payload（载荷）
    payload = {
        'user_id': user_id,  # 用户ID
        'role': role,        # 用户角色
        'exp': datetime.utcnow() + timedelta(hours=current_app.config['JWT_EXPIRATION_HOURS']),  # 过期时间
        'iat': datetime.utcnow()  # 签发时间
    }
    
    # 使用应用配置的密钥对payload进行编码
    # algorithm='HS256' 指定使用HMAC SHA256算法
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    """
    验证JWT token
    
    参数:
        token: 要验证的JWT token
        
    返回:
        dict/None: 验证成功返回payload，失败返回None
    """
    try:
        # 使用应用配置的密钥解码token
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        # token已过期
        return None
    except jwt.InvalidTokenError:
        # token无效（签名错误、格式错误等）
        return None

def token_required(f):
    """
    JWT token验证装饰器
    用于保护需要登录才能访问的API
    
    使用方式:
    @app.route('/protected')
    @token_required
    def protected_route():
        # 只有携带有效token的请求才能访问
        pass
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # 从请求头中获取token
        # 格式：Authorization: Bearer <token>
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # 分割Authorization头，获取token部分
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        # 如果没有提供token
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # 验证token
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # 根据token中的user_id获取用户信息
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 401
        
        # 将用户信息添加到请求上下文
        # 这样在路由函数中可以通过 request.current_user 访问用户信息
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated

def teacher_required(f):
    """
    教师权限验证装饰器
    确保只有教师角色才能访问的API
    
    使用方式:
    @app.route('/teacher-only')
    @token_required
    @teacher_required
    def teacher_route():
        # 只有教师才能访问
        pass
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # 首先检查是否有用户信息（需要先通过token_required装饰器）
        if not hasattr(request, 'current_user'):
            return jsonify({'error': 'Authentication required'}), 401
        
        # 检查用户角色是否为教师
        if request.current_user.role != 'teacher':
            return jsonify({'error': 'Teacher access required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated

def student_required(f):
    """
    学生权限验证装饰器
    确保只有学生角色才能访问的API
    
    使用方式:
    @app.route('/student-only')
    @token_required
    @student_required
    def student_route():
        # 只有学生才能访问
        pass
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # 首先检查是否有用户信息（需要先通过token_required装饰器）
        if not hasattr(request, 'current_user'):
            return jsonify({'error': 'Authentication required'}), 401
        
        # 检查用户角色是否为学生
        if request.current_user.role != 'student':
            return jsonify({'error': 'Student access required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated
