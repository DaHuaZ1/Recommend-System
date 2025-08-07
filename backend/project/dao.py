from models.project import Project
from models.user import db
from datetime import datetime, timezone, timedelta
import os
import base64

def convert_to_local_time(time_obj):
    """将时间对象转换为澳洲东部时间字符串"""
    if not time_obj:
        return None
    
    # 如果时间对象没有时区信息，假设它是澳洲时间
    if time_obj.tzinfo is None:
        australia_tz = timezone(timedelta(hours=10))
        time_obj = time_obj.replace(tzinfo=australia_tz)
    
    # 转换为澳洲东部时间
    australia_tz = timezone(timedelta(hours=10))
    local_time = time_obj.astimezone(australia_tz)
    return local_time.isoformat()

def get_pdf_base64(pdf_file_path):
    """
    读取PDF文件并转换为base64编码
    Args:
        pdf_file_path: str, PDF文件路径
    Returns:
        str: base64编码的PDF数据，如果文件不存在则返回None
    """
    if not pdf_file_path:
        return None
    
    try:
        # 从API路径中提取文件名
        if pdf_file_path.startswith('/api/files/project/'):
            filename = pdf_file_path.replace('/api/files/project/', '')
        else:
            filename = pdf_file_path
        
        # 构建完整的文件路径
        staff_project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../staff_project'))
        full_path = os.path.join(staff_project_dir, filename)
        
        # 检查文件是否存在
        if not os.path.exists(full_path):
            print(f"PDF文件不存在: {full_path}")
            return None
        
        # 读取文件并转换为base64
        with open(full_path, 'rb') as pdf_file:
            pdf_data = pdf_file.read()
            pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
            return pdf_base64
            
    except Exception as e:
        print(f"读取PDF文件失败: {e}")
        return None

# 项目相关数据库操作（目前为模拟数据，后续可接数据库）
def get_all_projects():
    # 1. 一次性查出所有项目
    projects = Project.query.all()
    if not projects:
        return []
    
    project_ids = [p.id for p in projects]
    
    # 2. 批量查出所有推荐分数
    from models.group_project_recommendation import GroupProjectRecommendation
    from models.group import Group
    
    all_recs = GroupProjectRecommendation.query.filter(
        GroupProjectRecommendation.project_id.in_(project_ids)
    ).all()
    
    # 3. 批量查出所有组
    group_ids = list(set([rec.group_id for rec in all_recs]))
    groups = {}
    if group_ids:
        groups = {g.id: g for g in Group.query.filter(Group.id.in_(group_ids)).all()}
    
    # 4. 按项目分组推荐数据
    recs_by_project = {}
    for rec in all_recs:
        if rec.project_id not in recs_by_project:
            recs_by_project[rec.project_id] = []
        recs_by_project[rec.project_id].append(rec)
    
    # 5. 组装结果
    result = []
    for p in projects:
        project_recs = recs_by_project.get(p.id, [])
        
        # 按分数排序取前N个
        try:
            group_capacity = int(p.group_capacity)
        except (ValueError, TypeError):
            group_capacity = 3
        
        top_recs = sorted(project_recs, key=lambda x: x.final_score, reverse=True)[:group_capacity]
        
        top_groups = []
        for rec in top_recs:
            group = groups.get(rec.group_id)
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
            "pdf": p.pdf_base64,  # 直接从数据库取
            "updatetime": convert_to_local_time(p.updated_at),
            "topGroups": top_groups,
            "final_score": str(top_recs[0].final_score) if top_recs else None,
            "match_score": None,
            "complementarity_score": None
        })
    return result

def save_project_to_db(project_info, pdf_file_path):
    """
    保存单个项目到数据库。如果 project_number 已存在则更新，否则插入新项目。
    Args:
        project_info: dict, 包含项目信息
        pdf_file: str, PDF 文件名
    Returns:
        Project 实例
    """
    pdf_base64 = None
    if pdf_file_path:
        try:
            # 兼容API路径和文件名
            if pdf_file_path.startswith('/api/files/project/'):
                filename = pdf_file_path.replace('/api/files/project/', '')
            else:
                filename = pdf_file_path
            staff_project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../staff_project'))
            full_path = os.path.join(staff_project_dir, filename)
            if os.path.exists(full_path):
                with open(full_path, 'rb') as f:
                    pdf_base64 = base64.b64encode(f.read()).decode('utf-8')
        except Exception as e:
            print(f"读取PDF转base64失败: {e}")

    project = Project.query.filter_by(project_number=project_info['projectNumber']).first()
    if project:
        # 已存在，执行更新
        project.project_title = project_info['projectTitle']
        project.client_name = project_info['clientName']
        project.group_capacity = project_info['groupCapacity']
        project.project_requirements = project_info['projectRequirements']
        project.required_skills = project_info['requiredSkills']
        project.pdf_file = pdf_file_path
        if pdf_base64:
            project.pdf_base64 = pdf_base64
    else:
        # 不存在，插入新项目
        project = Project(
            project_number=project_info['projectNumber'],
            project_title=project_info['projectTitle'],
            client_name=project_info['clientName'],
            group_capacity=project_info['groupCapacity'],
            project_requirements=project_info['projectRequirements'],
            required_skills=project_info['requiredSkills'],
            pdf_file=pdf_file_path,
            pdf_base64=pdf_base64
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