from flask import Blueprint, request, jsonify
from auth.service import AuthService
from utils.jwt_utils import generate_token, token_required, teacher_required, student_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    统一注册API端点
    请求体: JSON格式
        {
            "email": "user@example.com",
            "username": "user_name",
            "password": "password123",
            "user_type": "student" 或 "teacher",
            "secret_key": "teacher-secret-key-2024"  # 仅教师需要
        }
    """
    try:
        data = request.get_json()
        required_fields = ['email', 'username', 'password', 'user_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'缺少必需字段: {field}', 'status': 'fail'}), 400
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        user_type = data.get('user_type')
        secret_key = data.get('secret_key')
        success, message = AuthService.register_user(email, username, password, user_type, secret_key)
        if success:
            return jsonify({'message': message, 'status': 'success'}), 200
        else:
            return jsonify({'message': message, 'status': 'fail'}), 400
    except Exception as e:
        return jsonify({'message': f'注册失败: {str(e)}', 'status': 'fail'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    统一登录API端点
    请求体: JSON格式
        {
            "email": "user@example.com",
            "password": "password123",
            "user_type": "student" 或 "teacher",
            "secret_key": "teacher-secret-key-2024"  # 仅教师需要
        }
    """
    try:
        data = request.get_json()
        required_fields = ['email', 'password', 'user_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'缺少必需字段: {field}', 'status': 'fail'}), 400
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('user_type')
        secret_key = data.get('secret_key')
        success, result = AuthService.login_user(email, password, user_type, secret_key)
        if success:
            token, user_type = result
            return jsonify({'token': token, 'user_type': user_type}), 200
        else:
            return jsonify({'message': result, 'status': 'fail'}), 401
    except Exception as e:
        return jsonify({'message': f'登录失败: {str(e)}', 'status': 'fail'}), 500

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
