from flask import Blueprint, request, jsonify
from utils.resume_utils import parse_resume
from .service import handle_resume_upload, save_student_resume
from utils.jwt_utils import verify_token
from models.user import User

resume_bp = Blueprint('resume', __name__)

def get_token_from_header():
    """从 Authorization header 中获取 token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    try:
        # 格式应该是 "Bearer <token>"
        auth_type, token = auth_header.split(' ')
        if auth_type.lower() != 'bearer':
            return None
        return token
    except ValueError:
        return None

@resume_bp.route('/student/resume', methods=['POST'])
def upload_resume():
    """
    学生简历上传接口
    ---
    tags:
      - 学生
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
      - name: resume
        in: formData
        type: file
        required: true
        description: 上传的简历文件（pdf/docx）
    consumes:
      - multipart/form-data
    produces:
      - application/json
    responses:
      200:
        description: 解析成功
        schema:
          type: object
          properties:
            name:
              type: string
              example: "xxx"
            email:
              type: string
              example: "xxx"
            major:
              type: string
              example: "xxx"
            skill:
              type: string
              example: "xxx"
      400:
        description: 上传或解析失败
      401:
        description: 未授权或token无效
    """
    print('收到 /student/resume 请求:', flush=True)
    print('headers:', dict(request.headers), flush=True)
    print('form:', dict(request.form), flush=True)
    print('files:', request.files, flush=True)
    # 验证 token
    token = get_token_from_header()
    if not token:
        return jsonify({'error': '未授权'}), 401
        
    # 验证token并获取user_id
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'token无效'}), 401
    user_id = payload.get('user_id')

    # 查注册邮箱
    user = User.query.get(user_id)
    registered_email = user.email if user else ""

    # 检查文件
    if 'resume' not in request.files:
        return jsonify({'error': '未上传文件'}), 400
        
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400

    try:
        # 保存文件
        file_path = handle_resume_upload(file, file.filename)
        # 解析内容
        with open(file_path, 'rb') as f:
            info = parse_resume(f, file.filename)
        # 强制用注册邮箱
        info['email'] = registered_email
        # 自动保存到数据库
        save_student_resume(user_id, info['name'], info['email'], info['major'], info['skill'])
        
        # 返回解析结果
        return jsonify({
            'name': info['name'],
            'email': info['email'],
            'major': info['major'],
            'skill': info['skill']
        }), 200
    except Exception as e:
        print('简历上传异常:', e, flush=True)
        return jsonify({'error': f'解析失败: {str(e)}'}), 400

@resume_bp.route('/student/profile', methods=['POST'])
def update_profile():
    """
    学生简历信息手动修改接口
    ---
    tags:
      - 学生
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: "xxx"
            email:
              type: string
              example: "xxx"
            major:
              type: string
              example: "xxx"
            skill:
              type: string
              example: "xxx"
    consumes:
      - application/json
    produces:
      - application/json
    responses:
      200:
        description: 修改成功
        schema:
          type: object
          properties:
            status:
              type: string
              example: "200"
      400:
        description: 请求数据无效
      401:
        description: 未授权或token无效
    """
    print('收到 /student/profile 请求:')
    print('headers:', dict(request.headers), flush=True)
    print('json:', request.get_json(), flush=True)
    # 验证 token
    token = get_token_from_header()
    if not token:
        return jsonify({'error': '未授权'}), 401
    
    # 验证token并获取user_id
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'token无效'}), 401
    user_id = payload.get('user_id')

    # 查注册邮箱
    user = User.query.get(user_id)
    registered_email = user.email if user else ""
    
    # 获取请求数据
    data = request.get_json()
    if not data:
        return jsonify({'error': '无效的JSON数据'}), 400
    
    # 获取字段（email 强制用注册邮箱）
    name = data.get('name', '')
    major = data.get('major', '')
    skill = data.get('skill', '')
    
    # 保存到数据库
    try:
        save_student_resume(user_id, name, registered_email, major, skill)
        return jsonify({'status': '200'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400 

@resume_bp.route('/student/profile', methods=['GET'])
def get_profile():
    """
    获取学生个人信息接口
    ---
    tags:
      - 学生
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
    produces:
      - application/json
    responses:
      200:
        description: 获取成功
        schema:
          type: object
          properties:
            status:
              type: string
              example: "200"
            name:
              type: string
              example: "张三"
            email:
              type: string
              example: "zhangsan@example.com"
            major:
              type: string
              example: "计算机科学"
            skill:
              type: string
              example: "Python, 数据分析"
      401:
        description: 未授权或token无效
      404:
        description: 未找到简历信息
    """
    print('收到 /student/profile GET 请求', flush=True)
    token = get_token_from_header()
    print('提取到token:', token, flush=True)
    if not token:
        print('未授权，未获取到token', flush=True)
        return jsonify({'error': '未授权'}), 401
    payload = verify_token(token)
    print('token解码结果:', payload, flush=True)
    if not payload:
        print('token无效', flush=True)
        return jsonify({'error': 'token无效'}), 401
    user_id = payload.get('user_id')
    print('user_id:', user_id, flush=True)
    from models.student_resume import StudentResume
    resume = StudentResume.query.filter_by(user_id=user_id).first()
    print('数据库查到的resume:', resume, flush=True)
    if not resume:
        print('未找到简历信息', flush=True)
        return jsonify({'error': '未找到简历信息'}), 404
    print('返回简历信息:', {'status': '200', 'name': resume.name, 'email': resume.email, 'major': resume.major, 'skill': resume.skill}, flush=True)
    return jsonify({
        'status': '200',
        'name': resume.name,
        'email': resume.email,
        'major': resume.major,
        'skill': resume.skill
    }) 

@resume_bp.route('/student/group', methods=['POST'])
def create_group():
    """
    创建学生分组接口
    ---
    tags:
      - 学生
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            groupName:
              type: string
              example: "分组A"
            groupMember:
              type: array
              items:
                type: string
              example: ["xx@xx.com", "xx@xxx.com"]
    responses:
      200:
        description: 创建成功
        schema:
          type: object
          properties:
            status:
              type: string
              example: "200"
            groupName:
              type: string
              example: "分组A"
            groupMember:
              type: object
              additionalProperties:
                type: string
              example: {"John": "xx@xx.com", "Lily": "xx@xxx.com"}
      400:
        description: 请求参数错误
      401:
        description: 未授权或token无效
    """
    from utils.jwt_utils import verify_token
    from models.user import User
    print('收到 /student/group POST 请求', flush=True)
    token = get_token_from_header()
    print('提取到token:', token, flush=True)
    if not token:
        return jsonify({'error': '未授权'}), 401
    payload = verify_token(token)
    print('token解码结果:', payload, flush=True)
    if not payload:
        return jsonify({'error': 'token无效'}), 401
    data = request.get_json()
    print('收到请求体:', data, flush=True)
    if not data or 'groupName' not in data or 'groupMember' not in data:
        return jsonify({'error': '请求参数错误'}), 400
    group_name = data['groupName']
    group_member_emails = data['groupMember']
    if not isinstance(group_member_emails, list):
        return jsonify({'error': 'groupMember应为邮箱列表'}), 400
    # 查询所有成员的姓名
    group_member_dict = {}
    for email in group_member_emails:
        user = User.query.filter_by(email=email).first()
        name = user.username if user and user.username else email.split('@')[0]
        group_member_dict[name] = email
    print('组成员:', group_member_dict, flush=True)
    return jsonify({
        'status': '200',
        'groupName': group_name,
        'groupMember': group_member_dict
    }) 

@resume_bp.route('/student/projects', methods=['GET'])
def get_projects():
    """
    获取所有项目列表接口
    ---
    tags:
      - 学生
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
    responses:
      200:
        description: 获取成功
        schema:
          type: object
          properties:
            status:
              type: string
              example: "200"
            projects:
              type: object
              additionalProperties:
                type: object
                properties:
                  projectTitle:
                    type: string
                    example: "AI智能推荐系统"
                  clientName:
                    type: string
                    example: "腾讯"
                  groupCapacity:
                    type: integer
                    example: 3
                  projectRequirements:
                    type: string
                    example: "实现一个智能推荐系统，支持多种算法"
                  requiredSkills:
                    type: string
                    example: "Python, 机器学习"
                  pdfFile:
                    type: string
                    example: "project1.pdf"
      401:
        description: 未授权或token无效
    """
    from utils.jwt_utils import verify_token
    print('收到 /student/projects GET 请求', flush=True)
    token = get_token_from_header()
    print('提取到token:', token, flush=True)
    if not token:
        return jsonify({'error': '未授权'}), 401
    payload = verify_token(token)
    print('token解码结果:', payload, flush=True)
    if not payload:
        return jsonify({'error': 'token无效'}), 401
    # TODO: 这里用模拟数据，后续可接数据库
    projects = {
        "p1": {
            "projectTitle": "AI智能推荐系统",
            "clientName": "腾讯",
            "groupCapacity": 3,
            "projectRequirements": "实现一个智能推荐系统，支持多种算法",
            "requiredSkills": "Python, 机器学习",
            "pdfFile": "project1.pdf"
        },
        "p2": {
            "projectTitle": "大数据分析平台",
            "clientName": "阿里巴巴",
            "groupCapacity": 4,
            "projectRequirements": "搭建大数据分析平台，支持实时数据处理",
            "requiredSkills": "Java, Hadoop, Spark",
            "pdfFile": "project2.pdf"
        }
    }
    print('返回项目列表:', projects, flush=True)
    return jsonify({
        'status': '200',
        'projects': projects
    }) 