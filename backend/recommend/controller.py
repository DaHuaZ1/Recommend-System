from flask import Blueprint, request, jsonify
from utils.jwt_utils import token_required, student_required
from models.project import Project
from models.group import GroupMember

recommend_bp = Blueprint('recommend', __name__)

def get_user_group_id(user_id):
    """获取用户所属小组ID"""
    group_member = GroupMember.query.filter_by(user_id=user_id).first()
    return group_member.group_id if group_member else None

@recommend_bp.route('/api/student/recommend', methods=['GET'])
@token_required
@student_required
def get_recommendations(current_user):
    """
    获取项目推荐
    ---
    tags:
      - 推荐系统
    security:
      - Bearer: []
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
                  rank:
                    type: string
                    example: "1"
      400:
        description: 请求失败
        schema:
          type: object
          properties:
            status:
              type: string
            message:
              type: string
      500:
        description: 服务器错误
    """
    try:
        # 检查用户是否属于小组
        group_id = get_user_group_id(current_user.id)
        if not group_id:
            return jsonify({
                'status': '400',
                'message': '用户不属于任何小组'
            }), 400
        
        # 导入并使用您的RecommendService
        from recommend.service import RecommendService
        
        # 加载数据并获取推荐
        RecommendService.load_data_from_db()
        recommendations = RecommendService.get_project_recommendations()
        
        # 格式化返回结果
        projects = []
        for rec in recommendations:
            # 获取项目编号
            project = Project.query.get(rec['project_id'])
            if project:
                projects.append({
                    'projectNumber': project.project_number,
                    'final_score': str(rec['final_score']),
                    'rank': str(rec['rank'])
                })
        
        return jsonify({
            'status': '200',
            'projects': projects
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': '500',
            'message': f'推荐系统出现错误: {str(e)}'
        }), 500
