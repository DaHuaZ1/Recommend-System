from models.user import db
from datetime import datetime, timezone, timedelta

def get_australia_time():
    """获取澳洲东部时间（AEST/AEDT）"""
    australia_tz = timezone(timedelta(hours=10))  # UTC+10
    return datetime.now(australia_tz)

class StudentResume(db.Model):
    __tablename__ = 'student_resume'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, unique=True)  # 假设一个用户一份简历
    name = db.Column(db.String(128))
    email = db.Column(db.String(128))
    major = db.Column(db.String(128))
    skill = db.Column(db.String(256))
    # resume_file = db.Column(db.String(256))  # 新增字段，存储简历文件名或URL
    updated_at = db.Column(db.DateTime, default=get_australia_time, onupdate=get_australia_time) 