from models.user import db
from datetime import datetime

class StudentResume(db.Model):
    __tablename__ = 'student_resume'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, unique=True)  # 假设一个用户一份简历
    name = db.Column(db.String(128))
    email = db.Column(db.String(128))
    major = db.Column(db.String(128))
    skill = db.Column(db.String(256))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 