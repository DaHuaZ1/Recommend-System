import os
from docx import Document
import pdfplumber
import re
from typing import Dict

def extract_text_from_pdf(file) -> str:
    with pdfplumber.open(file) as pdf:
        text = ''
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + '\n'
    return text

def extract_text_from_docx(file) -> str:
    doc = Document(file)
    text = '\n'.join([para.text for para in doc.paragraphs])
    return text

def extract_resume_info(text: str) -> Dict[str, str]:
    # 简单正则提取，实际可根据简历模板优化
    name = re.search(r'Name[:：]?\s*([A-Za-z\u4e00-\u9fa5\s]+)', text)
    email = re.search(r'[\w\.-]+@[\w\.-]+', text)
    major = re.search(r'Major[:：]?\s*([A-Za-z\u4e00-\u9fa5\s]+)', text)
    skills = re.search(r'Skills?[:：]?\s*([A-Za-z,\u4e00-\u9fa5,\s]+)', text)
    return {
        'name': name.group(1).strip() if name else '',
        'email': email.group(0).strip() if email else '',
        'major': major.group(1).strip() if major else '',
        'skill': skills.group(1).strip() if skills else ''
    }

def parse_resume(file, filename):
    """
    解析简历文件，支持 PDF 和 DOCX 格式
    Args:
        file: FileStorage 对象或文件路径
        filename: 文件名，用于判断文件类型
    Returns:
        dict: 包含解析出的信息
        {
            'name': '姓名',
            'email': '邮箱',
            'major': '专业',
            'skill': '技能'
        }
    """
    # 获取文件扩展名
    ext = os.path.splitext(filename)[1].lower()
    
    # 根据文件类型选择不同的解析方法
    if ext == '.pdf':
        return parse_pdf(file)
    elif ext in ['.docx', '.doc']:
        return parse_docx(file)
    else:
        raise ValueError('不支持的文件格式，仅支持 PDF 和 DOCX 格式')

def parse_pdf(file):
    """解析 PDF 文件"""
    text = ""
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    
    return extract_info_from_text(text)

def parse_docx(file):
    """解析 DOCX 文件"""
    doc = Document(file)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    
    return extract_info_from_text(text)

def extract_info_from_text(text):
    """
    从文本中提取关键信息
    这里使用简单的规则，实际项目中可能需要更复杂的算法
    """
    lines = text.split('\n')
    info = {
        'name': '',
        'email': '',
        'major': '',
        'skill': ''
    }
    import re
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        # 查找邮箱
        email_match = re.search(email_pattern, line)
        if email_match and not info['email']:
            info['email'] = email_match.group()
        # 查找英文/中文姓名
        if not info['name']:
            # 1. Name: xxx
            if 'Name:' in line:
                value = line.split('Name:')[-1].strip()
                if not value and i+1 < len(lines):
                    value = lines[i+1].strip()
                if value:
                    info['name'] = value
            # 2. 中文名
            if not info['name']:
                name_match = re.search(r'[\u4e00-\u9fa5]{2,4}', line)
                if name_match:
                    info['name'] = name_match.group()
        # 查找专业
        if not info['major']:
            # 1. Major: xxx
            if 'Major:' in line:
                value = line.split('Major:')[-1].strip()
                if not value and i+1 < len(lines):
                    value = lines[i+1].strip()
                if value:
                    info['major'] = value
            # 2. 中文"专业"
            if not info['major'] and '专业' in line:
                info['major'] = line
        # 查找技能
        if not info['skill']:
            if any(keyword in line.lower() for keyword in ['技能', 'skill', '技术栈']):
                info['skill'] = line
        i += 1
    return info 