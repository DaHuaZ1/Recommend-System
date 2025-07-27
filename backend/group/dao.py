from models.group import Group, GroupMember
from models.user import db

def group_name_exists(group_name):
    return Group.query.filter_by(group_name=group_name).first() is not None

def group_members_exist_by_emails(emails):
    return GroupMember.query.filter(GroupMember.email.in_(emails)).all()

def create_group_and_members(group_name, members):
    group = Group(group_name=group_name)
    db.session.add(group)
    db.session.flush()  # 获取group.id
    group_member_objs = []
    for m in members:
        group_member = GroupMember(
            group_id=group.id, 
            user_id=m['user_id'], 
            name=m['name'], 
            email=m['email'],
            skill=m.get('skill', '')  # 添加技能字段
        )
        db.session.add(group_member)
        group_member_objs.append(group_member)
    return group, group_member_objs

def commit_or_rollback():
    try:
        db.session.commit()
        return True
    except Exception:
        db.session.rollback()
        return False

def get_group_member_by_user_id(user_id):
    return GroupMember.query.filter_by(user_id=user_id).first()

def get_group_by_id(group_id):
    return Group.query.get(group_id)

def get_group_members_by_group_id(group_id):
    return GroupMember.query.filter_by(group_id=group_id).all()

def get_all_groups():
    return Group.query.all()

def get_group_members(group_id):
    return GroupMember.query.filter_by(group_id=group_id).all()

def get_group_recommendations(group_id):
    from models.group_project_recommendation import GroupProjectRecommendation
    return GroupProjectRecommendation.query.filter_by(group_id=group_id).order_by(GroupProjectRecommendation.rank).all()

def get_resume_by_user_id(user_id):
    from models.student_resume import StudentResume
    return StudentResume.query.filter_by(user_id=user_id).first() 