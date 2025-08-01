from flask import Blueprint, request, jsonify
from utils.jwt_utils import verify_token
from models.project import Project
from models.group import GroupMember
from models.group_project_recommendation import GroupProjectRecommendation
from models.user import db
from datetime import datetime, timezone, timedelta
import traceback

def get_australia_time():
    """获取澳洲东部时间（AEST/AEDT）"""
    australia_tz = timezone(timedelta(hours=10))  # UTC+10
    return datetime.now(australia_tz)

recommend_bp = Blueprint('recommend', __name__)

def get_token_from_header():
    """从请求头获取Bearer token"""
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

def get_user_group_id(user_id):
    """获取用户所属小组ID"""
    group_member = GroupMember.query.filter_by(user_id=user_id).first()
    return group_member.group_id if group_member else None

@recommend_bp.route('/student/recommend', methods=['GET'])
def get_recommendations():
    """
    获取项目推荐
    ---
    tags:
      - 推荐系统
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
    responses:
      200:
        description: 推荐成功
        schema:
          type: object
          properties:
            status:
              type: string
              example: "200"
            projects:
              type: array
              items:
                type: object
                properties:
                  projectNumber:
                    type: string
                    example: "p1"
                  final_score:
                    type: string
                    example: "0.7956"
                  match_score:
                    type: string
                    example: "0.5567"
                  complementarity_score:
                    type: string
                    example: "0.2389"
                  rank:
                    type: string
                    example: "1"
                  projectTitle:
                    type: string
                    example: "AI-Enhanced Learning Platform"
                  clientName:
                    type: string
                    example: "Education Department"
                  groupCapacity:
                    type: string
                    example: "3"
                  projectRequirements:
                    type: string
                    example: "Develop a modern web-based learning management system..."
                  requiredSkills:
                    type: string
                    example: "Python, React, MySQL, Machine Learning"
                  pdfFile:
                    type: string
                    example: "project_specification.pdf"
      400:
        description: 请求失败
        schema:
          type: object
          properties:
            status:
              type: string
            message:
              type: string
      401:
        description: 认证失败
      500:
        description: 服务器错误
    """
    try:
        # 1. 校验 token
        token = get_token_from_header()
        if not token:
            return jsonify({'status': '401', 'message': '未授权'}), 401
        payload = verify_token(token)
        if not payload:
            return jsonify({'status': '401', 'message': 'token无效'}), 401
        user_id = payload.get('user_id')
        # 2. 检查用户是否属于小组
        group_id = get_user_group_id(user_id)
        if not group_id:
            return jsonify({'status': '400', 'message': '用户不属于任何小组'}), 400
        # 3. 推荐算法 - 为所有组计算推荐
        from recommend.service import RecommendService
        RecommendService.load_data_from_db()
        all_recommendations = RecommendService.get_project_recommendations()  # 获取所有组的推荐

        # === 实时更新数据库推荐分数 ===
        RecommendService.update_recommendations_in_db(all_recommendations)
        # === 更新完成 ===

        # 获取当前用户组的推荐结果
        user_recommendations = all_recommendations.get(group_id, [])
        
        # 批量获取项目信息，减少数据库查询次数
        project_ids = [rec['project_id'] for rec in user_recommendations]
        projects_dict = {}
        if project_ids:
            projects_query = Project.query.filter(Project.id.in_(project_ids)).all()
            projects_dict = {p.id: p for p in projects_query}
        
        projects = []
        # 修改：只返回前6个推荐项目
        for rec in sorted(user_recommendations, key=lambda x: x['rank'])[:6]:
            project = projects_dict.get(rec['project_id'])
            if project:
                projects.append({
                    'projectNumber': project.project_number,
                    'final_score': str(rec['final_score']),
                    'match_score': str(rec['match_score']),
                    'complementarity_score': str(rec['complementarity_score']),
                    'rank': str(rec['rank']),
                    'projectTitle': project.project_title,
                    'clientName': project.client_name,
                    'groupCapacity': project.group_capacity,
                    'projectRequirements': project.project_requirements,
                    'requiredSkills': project.required_skills,
                    'pdfFile': project.pdf_file
                })
        
        print(f"返回给用户 {user_id} (组 {group_id}) 的推荐项目数量: {len(projects)}")
        return jsonify({'status': '200', 'projects': projects}), 200
    except Exception as e:
        print('推荐系统异常:', e, flush=True)
        print(traceback.format_exc(), flush=True)
        return jsonify({'status': '500', 'message': f'推荐系统出现错误: {str(e)}'}), 500
