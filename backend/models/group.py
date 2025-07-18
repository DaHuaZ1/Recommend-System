from models.user import db

class Group(db.Model):
    __tablename__ = 'groups'
    id = db.Column(db.Integer, primary_key=True)
    group_name = db.Column(db.String(128), nullable=False, unique=True)
    leader_id = db.Column(db.Integer, nullable=True)  # 预留组长字段
    
    members = db.relationship('GroupMember', backref='group', lazy=True)

class GroupMember(db.Model):
    __tablename__ = 'group_members'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    user_id = db.Column(db.Integer, nullable=False, unique=True)  # 一个成员只能加入一个组
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(128), nullable=False) 