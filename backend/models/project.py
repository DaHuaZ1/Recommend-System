from models.user import db
from datetime import datetime, timezone, timedelta

def get_australia_time():
    """获取澳洲东部时间（AEST/AEDT）"""
    australia_tz = timezone(timedelta(hours=10))  # UTC+10
    return datetime.now(australia_tz)

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    project_number = db.Column(db.String(32), unique=True, nullable=False)
    project_title = db.Column(db.String(1024), nullable=False)
    client_name = db.Column(db.String(1024), nullable=False)
    group_capacity = db.Column(db.String(32), nullable=False)
    project_requirements = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.Text, nullable=False)
    pdf_file = db.Column(db.String(1024), nullable=True)
    updated_at = db.Column(db.DateTime, default=get_australia_time, onupdate=get_australia_time)    