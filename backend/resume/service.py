import os
from werkzeug.utils import secure_filename
from .dao import save_resume_to_db

def handle_resume_upload(file, filename):
    """
    处理简历文件上传
    Args:
        file: FileStorage 对象
        filename: 原始文件名
    Returns:
        str: 保存后的文件路径
    """
    # 确保上传目录存在
    upload_dir = os.path.join(os.getcwd(), 'resume_uploads')
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # 安全处理文件名
    filename = secure_filename(filename)
    
    # 生成唯一文件名（使用时间戳）
    import time
    unique_filename = f"{int(time.time())}_{filename}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # 保存文件
    file.save(file_path)
    return file_path

# 新增：保存或更新学生简历

def save_student_resume(user_id, name, email, major, skill):
    """
    保存学生简历信息到数据库
    Args:
        user_id: 用户ID
        name: 姓名
        email: 邮箱
        major: 专业
        skill: 技能
    """
    return save_resume_to_db(user_id, name, email, major, skill) 