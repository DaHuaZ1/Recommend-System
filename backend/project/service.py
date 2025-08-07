from . import dao as project_dao
from utils.project_utils import parse_project_pdf
import os
import traceback
from datetime import datetime, timezone, timedelta

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

def get_projects_service():
    return project_dao.get_all_projects()

def save_projects_from_files(files, upload_dir):
    """
    批量保存项目PDF，提取信息并写入数据库
    Args:
        files: werkzeug FileStorage 列表
        upload_dir: 保存PDF的目录
    Returns:
        项目信息列表
    """
    projects = []
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    for file in files:
        filename = file.filename
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        try:
            info = parse_project_pdf(file_path, filename)
            # 存储API访问路径
            pdf_api_path = f"/api/files/project/{filename}"
            project = project_dao.save_project_to_db(info, pdf_api_path)
            projects.append({
                'projectNumber': project.project_number,
                'projectTitle': project.project_title,
                'clientName': project.client_name,
                'groupCapacity': project.group_capacity,
                'projectRequirements': project.project_requirements,
                'requiredSkills': project.required_skills,
                'pdfFile': pdf_api_path,
                'updatetime': convert_to_local_time(project.updated_at),
            })
        except Exception as e:
            print("[FATAL] 数据库写入异常:", e, flush=True)
            traceback.print_exc()
            raise
    return projects 

def update_project_from_info(info):
    """
    根据 projectNumber 更新项目信息，不存在则新建。
    """
    return project_dao.upsert_project_by_number(info)

def delete_project_by_number(project_number):
    """
    根据 projectNumber 删除项目。
    Args:
        project_number: str/int
    Returns:
        bool: 删除成功返回 True，否则 False
    """
    return project_dao.delete_project_by_number(project_number)

def get_project_by_number(project_number):
    """
    根据 project_number 查询单个项目
    """
    return project_dao.get_project_by_number(project_number) 

def save_project_to_db(info, pdf_file_path):
    """
    单个项目保存，供controller直接调用
    """
    return project_dao.save_project_to_db(info, pdf_file_path) 