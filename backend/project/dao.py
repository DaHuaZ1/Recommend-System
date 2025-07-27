from models.project import Project
from models.user import db

# 项目相关数据库操作（目前为模拟数据，后续可接数据库）
def get_all_projects():
    # 从数据库查询所有项目
    projects = Project.query.all()
    result = []
    from models.group_project_recommendation import GroupProjectRecommendation
    from models.group import Group
    for p in projects:
        # 根据项目容量确定要返回的推荐组数量
        try:
            group_capacity = int(p.group_capacity)
        except (ValueError, TypeError):
            group_capacity = 3  # 默认值
        
        # 查询该项目推荐分数最高的前N个组（N = group_capacity）
        recs = GroupProjectRecommendation.query.filter_by(project_id=p.id).order_by(GroupProjectRecommendation.final_score.desc()).limit(group_capacity).all()
        top_groups = []
        for rec in recs:
            group = Group.query.get(rec.group_id)
            top_groups.append({
                'groupName': group.group_name if group else None,
                'score': rec.final_score
            })
        result.append({
            "projectNumber": p.project_number,
            "projectTitle": p.project_title,
            "clientName": p.client_name,
            "groupCapacity": p.group_capacity,
            "projectRequirements": p.project_requirements,
            "requiredSkills": p.required_skills,
            "pdfFile": p.pdf_file,
            "updatetime": p.updated_at.isoformat() if p.updated_at else None,
            "topGroups": top_groups
        })
    return result

def save_project_to_db(project_info, pdf_file):
    """
    保存单个项目到数据库。如果 project_number 已存在则更新，否则插入新项目。
    Args:
        project_info: dict, 包含项目信息
        pdf_file: str, PDF 文件名
    Returns:
        Project 实例
    """
    project = Project.query.filter_by(project_number=project_info['projectNumber']).first()
    if project:
        # 已存在，执行更新
        project.project_title = project_info['projectTitle']
        project.client_name = project_info['clientName']
        project.group_capacity = project_info['groupCapacity']
        project.project_requirements = project_info['projectRequirements']
        project.required_skills = project_info['requiredSkills']
        project.pdf_file = pdf_file
    else:
        # 不存在，插入新项目
        project = Project(
            project_number=project_info['projectNumber'],
            project_title=project_info['projectTitle'],
            client_name=project_info['clientName'],
            group_capacity=project_info['groupCapacity'],
            project_requirements=project_info['projectRequirements'],
            required_skills=project_info['requiredSkills'],
            pdf_file=pdf_file
        )
        db.session.add(project)
        db.session.commit()
    return project 

def upsert_project_by_number(info):
    """
    根据 projectNumber 更新项目信息（不更新 pdf_file），若不存在则新建。
    Args:
        info: dict, 包含项目信息
    Returns:
        Project 实例
    """
    project = Project.query.filter_by(project_number=info['projectNumber']).first()
    if project:
        project.project_title = info['projectTitle']
        project.client_name = info['clientName']
        project.group_capacity = info['groupCapacity']
        project.project_requirements = info['projectRequirements']
        project.required_skills = info['requiredSkills']
        project.pdf_file = info.get('pdfFile', project.pdf_file)
    else:
        project = Project(
            project_number=info['projectNumber'],
            project_title=info['projectTitle'],
            client_name=info['clientName'],
            group_capacity=info['groupCapacity'],
            project_requirements=info['projectRequirements'],
            required_skills=info['requiredSkills'],
            pdf_file=info.get('pdfFile', None)
        )
        db.session.add(project)
    db.session.commit()
    return project

def delete_project_by_number(project_number):
    """
    根据 projectNumber 删除项目。
    Args:
        project_number: str/int
    Returns:
        bool: 删除成功返回 True，否则 False
    """
    project = Project.query.filter_by(project_number=project_number).first()
    if project:
        from models.user import db
        # 先删除依赖表中的相关数据
        from models.group_project_recommendation import GroupProjectRecommendation
        GroupProjectRecommendation.query.filter_by(project_id=project.id).delete()
        db.session.delete(project)
        db.session.commit()
        return True
    return False

def get_project_by_number(project_number):
    """
    根据 project_number 查询单个项目
    Returns: Project 实例或 None
    """
    return Project.query.filter_by(project_number=project_number).first() 