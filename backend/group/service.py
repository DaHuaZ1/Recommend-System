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
        skill = resume.skill if resume and resume.skill else ''
        members.append({'user_id': user.id, 'name': name, 'email': email, 'skill': skill})
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

def get_all_groups_with_members_and_recommendations():
    """
    优化版：批量查询所有小组、组员、简历、推荐项目和项目详情，避免N+1查询，极大提升性能。
    返回结构与原来完全一致。
    """
    from . import dao as group_dao
    from models.project import Project
    from models.group import Group, GroupMember
    from models.student_resume import StudentResume
    from models.group_project_recommendation import GroupProjectRecommendation

    # 1. 批量查所有小组
    groups = Group.query.all()
    group_ids = [g.id for g in groups]

    # 2. 批量查所有组员
    all_members = GroupMember.query.filter(GroupMember.group_id.in_(group_ids)).all() if group_ids else []
    members_by_group = {}
    user_ids = set()
    for m in all_members:
        members_by_group.setdefault(m.group_id, []).append(m)
        user_ids.add(m.user_id)

    # 3. 批量查所有简历
    resumes = StudentResume.query.filter(StudentResume.user_id.in_(user_ids)).all() if user_ids else []
    resume_map = {r.user_id: r for r in resumes}

    # 4. 批量查所有推荐项目
    all_recs = GroupProjectRecommendation.query.filter(GroupProjectRecommendation.group_id.in_(group_ids)).order_by(GroupProjectRecommendation.rank).all() if group_ids else []
    recs_by_group = {}
    project_ids = set()
    for rec in all_recs:
        recs_by_group.setdefault(rec.group_id, []).append(rec)
        project_ids.add(rec.project_id)

    # 5. 批量查所有项目详情
    projects = Project.query.filter(Project.id.in_(project_ids)).all() if project_ids else []
    project_map = {p.id: p for p in projects}

    # 6. 组装返回数据
    result = []
    for group in groups:
        member_list = []
        for m in members_by_group.get(group.id, []):
            resume = resume_map.get(m.user_id)
            member_list.append({
                'name': m.name,
                'skill': m.skill or (resume.skill if resume else ''),
                'email': m.email,
                'major': resume.major if resume else '',
                'resume': resume.id if resume else ''
            })
        rec_projects = []
        for rec in recs_by_group.get(group.id, []):
            project = project_map.get(rec.project_id)
            if not project:
                continue
            rec_projects.append({
                'projectNumber': project.project_number,
                'projectTitle': project.project_title,
                'final_score': f"{rec.final_score:.4f}",
                'rank': rec.rank
            })
        result.append({
            'groupName': group.group_name,
            'groupMembers': member_list,
            'recommendProjects': rec_projects
        })
    return result 