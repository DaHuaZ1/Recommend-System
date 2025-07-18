import os
import re
import pdfplumber
from docx import Document
import fitz  # PyMuPDF

def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def extract_text_from_pdf_pymupdf(file_path):
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        print(f"[PyMuPDF] 解析失败: {e}", flush=True)
    return text

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    text = "\n".join([p.text for p in doc.paragraphs])
    return text

def extract_project_id(text):
    match = re.search(r'Project ID[:：]?\s*\n*\s*(\d+)', text, re.IGNORECASE)
    if not match:
        print("[DEBUG] Project ID 匹配失败，原始文本片段：", flush=True)
        idx = text.lower().find("project id")
        print(text[idx:idx+50] if idx != -1 else text[:100], flush=True)
    return match.group(1) if match else ""

def extract_section(text, label):
    # 所有可能的标题
    all_labels = [
        "Project ID", "Project Title", "Client Name", "Group Capacity",
        "Project Background", "Project Scope", "Project Requirements",
        "Required Skills", "Expected Outcomes", "Disciplines", "Other Resources"
    ]
    # 除当前label外的所有标题，拼成正则
    next_labels = [l for l in all_labels if l != label]
    next_labels_pattern = "|".join([re.escape(l) for l in next_labels])
    # 构造正则
    pattern = re.compile(
        rf'(?i){re.escape(label)}\s*\n+(.+?)(?=\n(?:{next_labels_pattern})\s*\n|$)',
        re.DOTALL
    )
    match = pattern.search(text)
    return match.group(1).strip() if match else ""

def parse_project_pdf(file_path, filename):
    """
    解析 PDF/Word 项目文件，提取关键信息
    """
    # 1. 读取文本内容
    text = ''
    if file_path.lower().endswith('.pdf'):
        text = extract_text_from_pdf_pymupdf(file_path)
        if not text.strip():
            text = extract_text_from_pdf(file_path)  # 兜底用pdfplumber
    elif file_path.lower().endswith('.docx'):
        text = extract_text_from_docx(file_path)
    else:
        text = ''
    print(f"[DEBUG] 原始PDF文本内容:\n{text}", flush=True)

    # 先提取 Project ID
    project_number = extract_project_id(text) or os.path.splitext(filename)[0]

    # 2. 定义要提取的字段和标题
    fields = {
        'projectTitle': r'Project Title[:：]?\s*(.+?)(?:\n|$)',
        'clientName': r'Client Name[:：]?\s*(.+?)(?:\n|$)',
        'groupCapacity': r'Group Capacity[:：]?\s*(.+?)(?:\n|$)',
        'projectRequirements': r'Project (Requirements|Background|Description)[:：]?\s*((?:.|\n)+?)(?=\n(?:Required Skills|Expected Outcomes|Disciplines|$))',
        'requiredSkills': r'Required Skills?[:：]?\s*((?:.|\n)+?)(?=\n(?:Expected Outcomes|Disciplines|$))'
    }

    # 3. 提取逻辑
    result = {}
    result['projectTitle'] = extract_section(text, "Project Title")
    result['clientName'] = extract_section(text, "Client Name")
    result['groupCapacity'] = extract_section(text, "Group Capacity")
    if result['groupCapacity']:
        num_match = re.search(r'(\d+)', result['groupCapacity'])
        result['groupCapacity'] = num_match.group(1) if num_match else "1"
    else:
        result['groupCapacity'] = "1"
    result['projectRequirements'] = extract_section(text, "Project Requirements")
    result['requiredSkills'] = extract_section(text, "Required Skills")

    return {
        'projectNumber': project_number,
        'projectTitle': result['projectTitle'] or '未填写',
        'clientName': result['clientName'] or '未填写',
        'groupCapacity': str(result['groupCapacity']) if result['groupCapacity'] else "1",
        'projectRequirements': result['projectRequirements'] or '未填写',
        'requiredSkills': result['requiredSkills'] or '未填写',
    } 