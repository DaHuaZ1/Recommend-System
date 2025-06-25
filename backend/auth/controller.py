from flask import Blueprint, request, jsonify
from auth.service import AuthService
from utils.jwt_utils import generate_token, token_required, teacher_required, student_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    用户注册接口
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
            password:
              type: string
    responses:
      200:
        description: 注册成功
        schema:
          type: object
          properties:
            message:
              type: string
            status:
              type: string
      400:
        description: 参数错误
    """
    try:
        data = request.get_json()
        required_fields = ['email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'缺少必需字段: {field}', 'status': 'fail'}), 400
        email = data.get('email')
        password = data.get('password')
        success, message = AuthService.register_user(email, password)
        if success:
            return jsonify({'message': message, 'status': 'success'}), 200
        else:
            return jsonify({'message': message, 'status': 'fail'}), 400
    except Exception as e:
        return jsonify({'message': f'注册失败: {str(e)}', 'status': 'fail'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    # print("login接口被调用", flush=True)
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
              description: 仅教师登录时需要
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
      401:
        description: 登录失败
    """
    try:
        data = request.get_json()
        print(data, flush=True)
        required_fields = ['email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'缺少必需字段: {field}', 'status': 'fail'}), 400
        email = data.get('email')
        password = data.get('password')
        secret_key = data.get('secret_key')
        success, result = AuthService.login_user(email, password, secret_key)
        if success:
            token, user_type, user = result
            return jsonify({'token': token, 'user_type': user_type, 'user': user}), 200
        else:
            return jsonify({'message': result, 'status': 'fail'}), 401
    except Exception as e:
        return jsonify({'message': f'登录失败: {str(e)}', 'status': 'fail'}), 500

# @auth_bp.route('/profile', methods=['GET'])
# @token_required
# def get_profile():
#     """
#     获取用户信息API端点
    
#     请求方法: GET
#     请求路径: /auth/profile
#     请求头: Authorization: Bearer <token>
    
#     返回:
#         成功: {
#             "user": {
#                 "id": 1,
#                 "email": "user@example.com",
#                 "username": "user_name",
#                 "role": "student"
#             }
#         }, 状态码 200
#         失败: {"error": "错误信息"}, 状态码 401
#     """
#     try:
#         user = request.current_user
#         return jsonify({
#             'user': user.to_dict()
#         }), 200
#     except Exception as e:
#         return jsonify({'error': f'获取用户信息失败: {str(e)}'}), 500

# @auth_bp.route('/test/student', methods=['GET'])
# @token_required
# @student_required
# def test_student_access():
#     """
#     测试学生权限API端点
    
#     用于测试学生权限验证是否正常工作
#     只有携带有效token且角色为学生的用户才能访问
    
#     请求方法: GET
#     请求路径: /auth/test/student
#     请求头: Authorization: Bearer <token>
    
#     返回:
#         成功: {"message": "学生权限验证成功"}, 状态码 200
#         失败: {"error": "错误信息"}, 状态码 401/403
#     """
#     return jsonify({'message': '学生权限验证成功'}), 200

# @auth_bp.route('/test/teacher', methods=['GET'])
# @token_required
# @teacher_required
# def test_teacher_access():
#     """
#     测试教师权限API端点
    
#     用于测试教师权限验证是否正常工作
#     只有携带有效token且角色为教师的用户才能访问
    
#     请求方法: GET
#     请求路径: /auth/test/teacher
#     请求头: Authorization: Bearer <token>
    
#     返回:
#         成功: {"message": "教师权限验证成功"}, 状态码 200
#         失败: {"error": "错误信息"}, 状态码 401/403
#     """
#     return jsonify({'message': '教师权限验证成功'}), 200
