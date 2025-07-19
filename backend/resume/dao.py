import os
from models.student_resume import StudentResume
from models.user import db

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../../resume_uploads')

def save_resume_file(file, filename):
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    return file_path

# 新增：保存或更新学生简历

def save_resume_to_db(user_id, name, email, major, skill):
    """
    保存或更新学生简历信息，并同步 group_members 表的 skill 字段
    Args:
        user_id: 用户ID
        name: 姓名
        email: 邮箱
        major: 专业
        skill: 技能
    """
    # 查找是否已存在记录
    resume = StudentResume.query.filter_by(user_id=user_id).first()
    
    if resume:
        # 更新现有记录
        resume.name = name
        resume.email = email
        resume.major = major
        resume.skill = skill
    else:
        # 创建新记录
        resume = StudentResume(
            user_id=user_id,
            name=name,
            email=email,
            major=major,
            skill=skill
        )
        db.session.add(resume)
    # 同步 group_members 表
    from models.group import GroupMember
    group_members = GroupMember.query.filter_by(user_id=user_id).all()
    for member in group_members:
        member.skill = skill
    db.session.commit()

# 新增：查询学生简历

def get_student_resume(user_id):
    return StudentResume.query.filter_by(user_id=user_id).first() 