from models.user import User
from models.student_resume import StudentResume
from sqlalchemy.exc import IntegrityError
from . import dao as group_dao

def validate_group_name(group_name):
    return not group_dao.group_name_exists(group_name)

def validate_group_members(emails):
    return not group_dao.group_members_exist_by_emails(emails)

def build_group_members(emails):
    members = []
    for email in emails:
        user = User.query.filter_by(email=email).first()
        resume = StudentResume.query.filter_by(user_id=user.id).first() if user else None
        name = resume.name if resume and resume.name else (user.username if user and user.username else email.split('@')[0])
        members.append({'user_id': user.id, 'name': name, 'email': email})
    return members

def create_group_with_members(group_name, emails):
    members = build_group_members(emails)
    group, group_member_objs = group_dao.create_group_and_members(group_name, members)
    if not group_dao.commit_or_rollback():
        return None, '有成员已加入其他组'
    group_member_dict = {m['name']: m['email'] for m in members}
    return {'groupName': group_name, 'groupMember': group_member_dict}, None

def get_user_group_info(user_id):
    member = group_dao.get_group_member_by_user_id(user_id)
    if not member:
        return {'status': '200', 'grouped': False}
    group = group_dao.get_group_by_id(member.group_id)
    members = group_dao.get_group_members_by_group_id(group.id)
    group_member_dict = {m.email: m.name for m in members}
    return {
        'status': '200',
        'grouped': True,
        'groupName': group.group_name,
        'groupMembers': group_member_dict 
    } 