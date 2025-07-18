from flask import Blueprint, request, jsonify
from utils.jwt_utils import verify_token
from . import service as group_service

# 创建分组相关的 Blueprint
# 所有 /student/group 路由都注册到 group_bp

group_bp = Blueprint('group', __name__)

# 从请求头获取 Bearer token
# 用于接口鉴权

def get_token_from_header():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    try:
        auth_type, token = auth_header.split(' ')
        if auth_type.lower() != 'bearer':
            return None
        return token
    except ValueError:
        return None

# 创建分组接口
# POST /api/student/group
# 参数：groupName（分组名）、groupMember（成员邮箱列表）
# 逻辑：校验参数、校验分组名唯一、校验成员未加入其他组，写入数据库
@group_bp.route('/student/group', methods=['POST'])
def create_group():
    """
    创建学生分组接口
    ---
    tags:
      - 分组
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            groupName:
              type: string
              example: "分组A"
            groupMember:
              type: array
              items:
                type: string
              example: ["xx@xx.com", "xx@xxx.com"]
    responses:
      200:
        description: 创建成功
        schema:
          type: object
          properties:
            status:
              type: string
              example: "200"
            groupName:
              type: string
              example: "分组A"
            groupMember:
              type: object
              additionalProperties:
                type: string
              example: {"John": "xx@xx.com", "Lily": "xx@xxx.com"}
      400:
        description: 请求参数错误
      401:
        description: 未授权或token无效
    """
    # 1. 校验 token
    token = get_token_from_header()
    if not token:
        return jsonify({'error': '未授权'}), 401
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'token无效'}), 401
    # 2. 校验参数
    data = request.get_json()
    if not data or 'groupName' not in data or 'groupMember' not in data:
        return jsonify({'error': '请求参数错误'}), 400
    group_name = data['groupName']
    group_member_emails = data['groupMember']
    if not isinstance(group_member_emails, list):
        return jsonify({'error': 'groupMember应为邮箱列表'}), 400
    # 3. 校验分组名唯一
    if not group_service.validate_group_name(group_name):
        return jsonify({'error': '分组名已存在'}), 400
    # 4. 校验成员未加入其他组
    if not group_service.validate_group_members(group_member_emails):
        return jsonify({'error': '有成员已加入其他组'}), 400
    # 5. 创建分组和成员，写入数据库
    result, err = group_service.create_group_with_members(group_name, group_member_emails)
    if err:
        return jsonify({'error': err}), 400
    return jsonify({'status': '200', **result})

# 查询当前用户分组信息接口
# GET /api/student/group
# 返回当前用户是否有组、组名、组成员
@group_bp.route('/student/group', methods=['GET'])
def get_my_group():
    """
    查询当前用户是否有分组及分组信息
    ---
    tags:
      - 分组
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
    responses:
      200:
        description: 查询成功
        schema:
          type: object
          properties:
            status:
              type: string
              example: "200"
            grouped:
              type: boolean
              example: true
            groupName:
              type: string
              example: "分组A"
            groupMembers:
              type: object
              additionalProperties:
                type: string
              example: {"John": "xx@xx.com", "Lily": "xx@xxx.com"}
      401:
        description: 未授权或token无效
    """
    # 1. 校验 token
    token = get_token_from_header()
    if not token:
        return jsonify({'error': '未授权'}), 401
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'token无效'}), 401
    # 2. 查询分组信息
    user_id = payload.get('user_id')
    result = group_service.get_user_group_info(user_id)
    return jsonify(result) 