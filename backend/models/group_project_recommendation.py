from models.user import db
from datetime import datetime

class GroupProjectRecommendation(db.Model):
    __tablename__ = 'group_project_recommendation'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    final_score = db.Column(db.Float, nullable=False)
    rank = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # 可选扩展字段
    # algo_version = db.Column(db.String(32), nullable=True)
    # extra_info = db.Column(db.Text, nullable=True) 