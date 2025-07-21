from flask import Blueprint, request, jsonify, send_from_directory
from utils.jwt_utils import verify_token
from . import service as project_service
import os

project_bp = Blueprint('project', __name__)

def get_token_from_header():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    try:
        auth_type, token = auth_header.split(' ')
        if auth_type.lower() != 'bearer':
            return None
        return token
    except ValueError:
        return None

@project_bp.route('/staff/projects', methods=['POST'])
def upload_staff_projects():
    """
    批量上传项目PDF，自动提取项目信息但不存库，只返回解析结果
    ---
    tags:
      - 项目
    consumes:
      - multipart/form-data
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
      - name: projectFiles
        in: formData
        type: file
        required: true
        description: 多个PDF文件
        collectionFormat: multi
    responses:
      200:
        description: 上传并解析成功
        schema:
          type: object
          properties:
            status:
              type: string
              example: "200"
            projects:
              type: array
              items:
                type: object
                properties:
                  projectNumber:
                    type: string
                  projectTitle:
                    type: string
                  clientName:
                    type: string
                  groupCapacity:
                    type: string
                  projectRequirements:
                    type: string
                  requiredSkills:
                    type: string
                  pdfFile:
                    type: string
      400:
        description: 参数错误
      401:
        description: 未授权或token无效
    """
    token = get_token_from_header()
    if not token:
        return jsonify({'error': '未授权'}), 401
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'token无效'}), 401
    if 'projectFiles' not in request.files:
        return jsonify({'error': '未上传文件'}), 400
    files = request.files.getlist('projectFiles')
    if not files:
        return jsonify({'error': '未选择文件'}), 400
    upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../staff_project'))
    projects = []
    for file in files:
        filename = file.filename
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        from utils.project_utils import parse_project_pdf
        info = parse_project_pdf(file_path, filename)
        # 增加pdfFile字段，返回API路径
        api_path = f"/api/files/project/{filename}"
        info['pdfFile'] = api_path
        projects.append(info)
    return jsonify({'status': '200', 'projects': projects})


@project_bp.route('/staff/projects', methods=['PUT'])
def update_staff_projects():
    """
    批量更新项目信息
    ---
    tags:
      - 项目
    consumes:
      - multipart/form-data
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
      - name: projects
        in: formData
        type: string
        required: true
        description: JSON字符串，内容为项目数组
        example: '[{"projectNumber":1,"projectTitle":"xxx","clientName":"xxx","groupCapacity":3,"projectRequirements":"xxx","requiredSkills":"xxx"}]'
    responses:
      200:
        description: 批量更新成功
        schema:
          type: object
          properties:
            status:
              type: string
              example: "200"
            projects:
              type: array
              items:
                type: object
                properties:
                  projectNumber:
                    type: string
                  projectTitle:
                    type: string
                  clientName:
                    type: string
                  groupCapacity:
                    type: string
                  projectRequirements:
                    type: string
                  requiredSkills:
                    type: string
                  pdfFile:
                    type: string
      400:
        description: 请求参数错误
      401:
        description: 未授权或token无效
    """
    token = get_token_from_header()
    if not token:
        return jsonify({'error': '未授权'}), 401
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'token无效'}), 401
    # 获取 projects 字段
    projects_json = request.form.get('projects')
    if not projects_json:
        return jsonify({'error': '缺少 projects 字段'}), 400
    import json
    try:
        projects_data = json.loads(projects_json)
    except Exception as e:
        return jsonify({'error': f'projects 字段不是合法 JSON: {e}'}), 400
    updated_projects = []
    for info in projects_data:
        # 支持pdfFile字段写入
        from . import service as project_service
        project = project_service.update_project_from_info(info)
        updated_projects.append({
            'projectNumber': project.project_number,
            'projectTitle': project.project_title,
            'clientName': project.client_name,
            'groupCapacity': project.group_capacity,
            'projectRequirements': project.project_requirements,
            'requiredSkills': project.required_skills,
            'pdfFile': project.pdf_file,
        })
    return jsonify({'status': '200', 'projects': updated_projects})


@project_bp.route('/staff/projects', methods=['DELETE'])
def delete_staff_project():
    """
    删除单个项目
    ---
    tags:
      - 项目
    consumes:
      - application/json
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
            projectNumber:
              type: string
              example: "1"
    responses:
      200:
        description: 删除成功
        schema:
          type: object
          properties:
            status:
              type: string
              example: "200"
      400:
        description: 请求参数错误或项目不存在
      401:
        description: 未授权或token无效
    """
    token = get_token_from_header()
    if not token:
        return jsonify({'error': '未授权'}), 401
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'token无效'}), 401
    data = request.get_json()
    if not data or 'projectNumber' not in data:
        return jsonify({'error': '缺少 projectNumber 字段'}), 400
    from . import service as project_service
    success = project_service.delete_project_by_number(data['projectNumber'])
    if success:
        return jsonify({'status': '200'})
    else:
        return jsonify({'error': '项目不存在或删除失败'}), 400


@project_bp.route('/student/projects', methods=['GET'])
def get_projects():
    """
    获取所有项目列表接口
    ---
    tags:
      - 项目
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
              type: array
              items:
                type: object
                properties:
                  projectNumber:
                    type: string
                    example: "1"
                  projectTitle:
                    type: string
                    example: "AI Intelligent Recommendation System"
                  clientName:
                    type: string
                    example: "Tencent"
                  groupCapacity:
                    type: integer
                    example: 3
                  projectRequirements:
                    type: string
                    example: "Develop an intelligent recommendation system supporting multiple algorithms."
                  requiredSkills:
                    type: string
                    example: "Python, Machine Learning"
                  pdfFile:
                    type: string
                    example: "/api/files/1751360465_-.pdf"
        examples:
          application/json:
            status: "200"
            projects:
              - projectNumber: "1"
                projectTitle: "AI Intelligent Recommendation System"
                clientName: "Tencent"
                groupCapacity: 3
                projectRequirements: "Develop an intelligent recommendation system supporting multiple algorithms."
                requiredSkills: "Python, Machine Learning"
                pdfFile: "/api/files/1751360465_-.pdf"
              - projectNumber: "2"
                projectTitle: "Big Data Analytics Platform"
                clientName: "Alibaba"
                groupCapacity: 4
                projectRequirements: "Build a big data analytics platform with real-time data processing capabilities."
                requiredSkills: "Java, Hadoop, Spark"
                pdfFile: "/api/files/1751360465_-.pdf"
      401:
        description: 未授权或token无效
    """
    token = get_token_from_header()
    if not token:
        return jsonify({'error': '未授权'}), 401
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'token无效'}), 401
    projects = project_service.get_projects_service()
    return jsonify({
        'status': '200',
        'projects': projects
    })


@project_bp.route('/project/<int:projectNumber>', methods=['GET'])
def get_project_by_number(projectNumber):
    """
    获取单个项目详情
    ---
    tags:
      - 项目
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Bearer token
      - name: projectNumber
        in: path
        type: integer
        required: true
        description: 项目编号
    responses:
      200:
        description: 获取成功
        schema:
          type: object
          properties:
            status:
              type: string
              example: "200"
            projectNumber:
              type: integer
              example: 1
            projectTitle:
              type: string
              example: "xxxxx"
            clientName:
              type: string
              example: "xxxx"
            groupCapacity:
              type: integer
              example: 3
            projectRequirements:
              type: string
              example: "xxxx"
            requiredSkills:
              type: string
              example: "xxx"
            pdfFile:
              type: string
              example: "/api/files/project/xxx.pdf"
      401:
        description: 未授权或token无效
      404:
        description: 项目不存在
    """
    token = get_token_from_header()
    if not token:
        return jsonify({'error': '未授权'}), 401
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'token无效'}), 401
    from . import service as project_service
    project = project_service.get_project_by_number(projectNumber)
    if not project:
        return jsonify({'error': '项目不存在'}), 404
    return jsonify({
        'status': '200',
        'projectNumber': project.project_number,
        'projectTitle': project.project_title,
        'clientName': project.client_name,
        'groupCapacity': project.group_capacity,
        'projectRequirements': project.project_requirements,
        'requiredSkills': project.required_skills,
        'pdfFile': project.pdf_file
    })


@project_bp.route('/files/project/<filename>', methods=['GET'])
def get_project_pdf(filename):
    uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../staff_project'))
    print('查找路径:', uploads_dir, '文件名:', repr(filename), flush=True)
    print('目录下文件:', [repr(f) for f in os.listdir(uploads_dir)], flush=True)
    return send_from_directory(uploads_dir, filename) 

