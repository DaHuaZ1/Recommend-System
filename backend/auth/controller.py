from flask import Blueprint, request, jsonify
from auth.service import AuthService
from utils.jwt_utils import generate_token, token_required, teacher_required, student_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register/student', methods=['POST'])
def register_student():
    """
    学生注册API端点
    
    请求方法: POST
    请求路径: /auth/register/student
    请求体: JSON格式
        {
            "email": "student@example.com",
            "username": "student_name", 
            "password": "password123"
        }
    
    返回:
        成功: {"message": "注册成功"}, 状态码 201
        失败: {"error": "错误信息"}, 状态码 400
    """
    try:
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['email', 'username', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        
        # 调用服务层处理注册逻辑
        success, message = AuthService.register_student(email, username, password)
        
        if success:
            return jsonify({'message': message}), 201
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        return jsonify({'error': f'注册失败: {str(e)}'}), 500

@auth_bp.route('/register/teacher', methods=['POST'])
def register_teacher():
    """
    教师注册API端点
    
    请求方法: POST
    请求路径: /auth/register/teacher
    请求体: JSON格式
        {
            "email": "teacher@example.com",
            "username": "teacher_name",
            "password": "password123",
            "teacher_secret_key": "teacher-secret-key-2024"
        }
    
    返回:
        成功: {"message": "教师注册成功"}, 状态码 201
        失败: {"error": "错误信息"}, 状态码 400
    """
    try:
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['email', 'username', 'password', 'teacher_secret_key']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        teacher_secret_key = data.get('teacher_secret_key')
        
        # 调用服务层处理注册逻辑
        success, message = AuthService.register_teacher(email, username, password, teacher_secret_key)
        
        if success:
            return jsonify({'message': message}), 201
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        return jsonify({'error': f'注册失败: {str(e)}'}), 500

@auth_bp.route('/login/student', methods=['POST'])
def login_student():
    """
    学生登录API端点
    
    请求方法: POST
    请求路径: /auth/login/student
    请求体: JSON格式
        {
            "email": "student@example.com",
            "password": "password123"
        }
    
    返回:
        成功: {
            "message": "登录成功",
            "token": "jwt_token_here",
            "user": {
                "id": 1,
                "email": "student@example.com",
                "username": "student_name",
                "role": "student"
            }
        }, 状态码 200
        失败: {"error": "错误信息"}, 状态码 401
    """
    try:
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        # 调用服务层处理登录逻辑
        success, result = AuthService.login_student(email, password)
        
        if success:
            user = result
            # 生成JWT token
            token = generate_token(user.id, user.role)
            
            return jsonify({
                'message': '登录成功',
                'token': token,
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': result}), 401
            
    except Exception as e:
        return jsonify({'error': f'登录失败: {str(e)}'}), 500

@auth_bp.route('/login/teacher', methods=['POST'])
def login_teacher():
    """
    教师登录API端点
    
    请求方法: POST
    请求路径: /auth/login/teacher
    请求体: JSON格式
        {
            "email": "teacher@example.com",
            "password": "password123",
            "teacher_secret_key": "teacher-secret-key-2024"
        }
    
    返回:
        成功: {
            "message": "登录成功",
            "token": "jwt_token_here",
            "user": {
                "id": 1,
                "email": "teacher@example.com",
                "username": "teacher_name",
                "role": "teacher"
            }
        }, 状态码 200
        失败: {"error": "错误信息"}, 状态码 401
    """
    try:
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['email', 'password', 'teacher_secret_key']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        email = data.get('email')
        password = data.get('password')
        teacher_secret_key = data.get('teacher_secret_key')
        
        # 调用服务层处理登录逻辑
        success, result = AuthService.login_teacher(email, password, teacher_secret_key)
        
        if success:
            user = result
            # 生成JWT token
            token = generate_token(user.id, user.role)
            
            return jsonify({
                'message': '登录成功',
                'token': token,
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': result}), 401
            
    except Exception as e:
        return jsonify({'error': f'登录失败: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """
    获取用户信息API端点
    
    请求方法: GET
    请求路径: /auth/profile
    请求头: Authorization: Bearer <token>
    
    返回:
        成功: {
            "user": {
                "id": 1,
                "email": "user@example.com",
                "username": "user_name",
                "role": "student"
            }
        }, 状态码 200
        失败: {"error": "错误信息"}, 状态码 401
    """
    try:
        user = request.current_user
        return jsonify({
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': f'获取用户信息失败: {str(e)}'}), 500

@auth_bp.route('/test/student', methods=['GET'])
@token_required
@student_required
def test_student_access():
    """
    测试学生权限API端点
    
    用于测试学生权限验证是否正常工作
    只有携带有效token且角色为学生的用户才能访问
    
    请求方法: GET
    请求路径: /auth/test/student
    请求头: Authorization: Bearer <token>
    
    返回:
        成功: {"message": "学生权限验证成功"}, 状态码 200
        失败: {"error": "错误信息"}, 状态码 401/403
    """
    return jsonify({'message': '学生权限验证成功'}), 200

@auth_bp.route('/test/teacher', methods=['GET'])
@token_required
@teacher_required
def test_teacher_access():
    """
    测试教师权限API端点
    
    用于测试教师权限验证是否正常工作
    只有携带有效token且角色为教师的用户才能访问
    
    请求方法: GET
    请求路径: /auth/test/teacher
    请求头: Authorization: Bearer <token>
    
    返回:
        成功: {"message": "教师权限验证成功"}, 状态码 200
        失败: {"error": "错误信息"}, 状态码 401/403
    """
    return jsonify({'message': '教师权限验证成功'}), 200
