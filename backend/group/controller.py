from flask import Blueprint, request, jsonify
from utils.jwt_utils import verify_token
from . import service as group_service
from models.group import Group, GroupMember
from models.group_project_recommendation import GroupProjectRecommendation
from models.user import db

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

# 删除小组接口（通过小组名称，测试用，无权限校验）
@group_bp.route('/group/<group_name>', methods=['DELETE'])
def delete_group_by_name(group_name):
    """
    通过小组名称删除小组（测试用，无权限校验）
    ---
    tags:
      - Group
    parameters:
      - name: group_name
        in: path
        type: string
        required: true
        description: 要删除的小组名称
    responses:
      200:
        description: 删除成功
        schema:
          type: object
          properties:
            status:
              type: string
              example: "200"
            message:
              type: string
              example: "小组及相关数据已删除"
            deleted_group:
              type: object
              properties:
                group_id:
                  type: integer
                  example: 1
                group_name:
                  type: string
                  example: "Team Alpha"
                deleted_recommendations:
                  type: integer
                  example: 15
                deleted_members:
                  type: integer
                  example: 3
      404:
        description: 小组不存在
        schema:
          type: object
          properties:
            status:
              type: string
              example: "404"
            message:
              type: string
              example: "小组不存在"
      500:
        description: 服务器错误
        schema:
          type: object
          properties:
            status:
              type: string
              example: "500"
            message:
              type: string
              example: "服务器错误"
    """
    try:
        # 1. 通过小组名称查找group
        group = Group.query.filter_by(group_name=group_name).first()
        if not group:
            return jsonify({
                'status': '404', 
                'message': f'小组 "{group_name}" 不存在'
            }), 404

        group_id = group.id
        
        # 2. 获取删除前的统计信息
        deleted_recommendations = GroupProjectRecommendation.query.filter_by(group_id=group_id).count()
        deleted_members = GroupMember.query.filter_by(group_id=group_id).count()

        # 3. 删除推荐记录
        GroupProjectRecommendation.query.filter_by(group_id=group_id).delete()
        
        # 4. 删除组员记录
        GroupMember.query.filter_by(group_id=group_id).delete()
        
        # 5. 删除小组
        db.session.delete(group)
        
        # 6. 提交所有更改
        db.session.commit()
        
        return jsonify({
            'status': '200',
            'message': '小组及相关数据已删除',
            'deleted_group': {
                'group_id': group_id,
                'group_name': group_name,
                'deleted_recommendations': deleted_recommendations,
                'deleted_members': deleted_members
            }
        }), 200
        
    except Exception as e:
        # 回滚事务
        db.session.rollback()
        return jsonify({
            'status': '500',
            'message': f'服务器错误: {str(e)}'
        }), 500

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

@group_bp.route('/staff/groups', methods=['GET'])
def get_all_groups_with_recommendations():
    """
    获取所有分组及其成员和推荐项目
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
            groups:
              type: array
              items:
                type: object
                properties:
                  groupName:
                    type: string
                  groupMembers:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                        skill:
                          type: string
                        email:
                          type: string
                        major:
                          type: string
                        resume:
                          type: string
                  recommendProjects:
                    type: array
                    items:
                      type: object
                      properties:
                        projectNumber:
                          type: string
                        projectTitle:
                          type: string
                        final_score:
                          type: string
                        rank:
                          type: integer
      401:
        description: 未授权或token无效
    """
    token = get_token_from_header()
    if not token:
        return jsonify({'error': '未授权'}), 401
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'token无效'}), 401

    from . import service as group_service
    groups = group_service.get_all_groups_with_members_and_recommendations()
    return jsonify({'status': '200', 'groups': groups}) 