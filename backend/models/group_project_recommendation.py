from models.user import db
from datetime import datetime, timezone, timedelta

def get_australia_time():
    """获取澳洲东部时间（AEST/AEDT）"""
    australia_tz = timezone(timedelta(hours=10))  # UTC+10
    return datetime.now(australia_tz)


class GroupProjectRecommendation(db.Model):
    __tablename__ = 'group_project_recommendation'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    final_score = db.Column(db.Float, nullable=False)
    rank = db.Column(db.Integer, nullable=False)
    match_score = db.Column(db.Float, nullable=True)  # 匹配分数
    complementarity_score = db.Column(db.Float, nullable=True)  # 互补分数
    created_at = db.Column(db.DateTime, default=get_australia_time)

    # 可选扩展字段
    # algo_version = db.Column(db.String(32), nullable=True)
    # extra_info = db.Column(db.Text, nullable=True) 