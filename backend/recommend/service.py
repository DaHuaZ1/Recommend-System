import re
from collections import defaultdict
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import minmax_scale
from models.project import Project
from models.group import GroupMember

# 设置远程 MySQL 数据库连接参数
# os.environ['MYSQL_HOST'] = '182.92.72.100'
# os.environ['MYSQL_PORT'] = '3306'
# os.environ['MYSQL_USER'] = 'cakeuser'
# os.environ['MYSQL_PASSWORD'] = '123456'
# os.environ['MYSQL_DB'] = 'capstone_project'  # 数据库名
# 创建 Flask 应用实例
# app = Flask(__name__)
# 读取数据库连接信息
# mysql_host = os.environ.get('MYSQL_HOST', 'localhost')
# mysql_port = os.environ.get('MYSQL_PORT', '3306')
# mysql_user = os.environ.get('MYSQL_USER', 'root')
# mysql_password = os.environ.get('MYSQL_PASSWORD', '')
# mysql_db = os.environ.get('MYSQL_DB', 'test')
# 配置 SQLAlchemy
# app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}:{mysql_port}/{mysql_db}'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化数据库
# db = SQLAlchemy(app)
# ========== 模型定义 ==========
# class GroupMember(db.Model):
#     __tablename__ = 'group_members'
#     id = db.Column(db.Integer, primary_key=True)
#     group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
#     user_id = db.Column(db.Integer, nullable=False, unique=True)
#     name = db.Column(db.String(128), nullable=False)
#     email = db.Column(db.String(128), nullable=False)
#     skill = db.Column(db.Text, nullable=True)

# class Project(db.Model):
#     __tablename__ = 'projects'
#     id = db.Column(db.Integer, primary_key=True)
#     project_number = db.Column(db.String(32), unique=True, nullable=False)
#     project_title = db.Column(db.String(1024), nullable=False)
#     client_name = db.Column(db.String(1024), nullable=False)
#     group_capacity = db.Column(db.String(32), nullable=False)
#     project_requirements = db.Column(db.Text, nullable=False)
#     required_skills = db.Column(db.Text, nullable=False)
#     pdf_file = db.Column(db.String(1024), nullable=True)

skill_keywords = [
    # 编程语言
    "Python", "Java", "C++", "C#", "Go", "Rust", "Kotlin", "Swift",
    "JavaScript", "TypeScript", "Ruby", "PHP", "R", "Shell", "Perl", "Golang",
    # 前端开发
    "Frontend", "HTML", "CSS", "React", "Vue.js", "Angular", "jQuery", "Bootstrap",
    "Tailwind CSS", "Next.js", "SASS", "Webpack", "React Native", "Flutter",
    # 后端开发 / 框架
    "Backend", "Node.js", "Express.js", "Django", "Flask", "Spring Boot", "ASP.NET", "FastAPI",
    "Koa", "NestJS", "Laravel", "Ruby on Rails", "Langchain", "LangGraph", "AutoGen",
    # 数据库与数据分析
    "Database", "SQL", "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Redis", "Oracle",
    "Pandas", "NumPy", "Matplotlib", "Seaborn", "Excel", "Power BI",
    "Tableau", "ETL", "Data Warehousing", "BigQuery", "Firebase", "Data Structure", "Algorithm"
    # 云计算与 DevOps
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform",
    "CI/CD", "Jenkins", "GitLab CI", "Ansible", "Prometheus", "Grafana",
    "Linux", "Bash", "Nginx", "Apache", "Vercel", "Render",
    # 安全与测试
    "Penetration Testing", "OWASP", "Burp Suite", "Wireshark", "Data Security", "Authentication",
    "Unit Testing", "Integration Testing", "Selenium", "Jest", "Cypress",
    "Postman", "Test Automation", "Heuristic Evaluation", "A/B Testing", "Cryptography", "Blockchain"
    # 工具与版本控制
    "Git", "GitHub", "GitLab", "Bitbucket", "JIRA", "VS Code",
    "IntelliJ IDEA", "Eclipse", "Figma", "Notion", "Slack", "Wireframe",
    # ERP / 商业系统
    "ERP", "SAP", "Oracle ERP", "Odoo", "Salesforce", "CRM", "PowerApps", "SharePoint", "Zoho"
    # 可视化与 UI/UX
    "D3.js", "Chart.js", "Figma", "UX", "UI", "Design Critique",
    "Information Hierarchy", "Declarative UI", "Human–Computer Interaction", 'Software Development'
    # 身份验证与 API
    "JWT", "Firebase Auth", "PayTo API",
    # 游戏/VR开发
    "Unity", "Unity3D", "OpenXR", "Oculus SDK", "SteamVR",
    "Graphics Programming", "Shader", "Rendering Pipeline",
    # LLM / AI / 智能代理
    "LLMs", "Agent Framework", "Feedback Loop Design", "Behavioral Nudges",
    "Natural Language Processing", "AI", "Machine Learning", "Temporal Modeling",
    # 教育与内容设计
    "Curriculum Design", "Storytelling", "Narrative Structure", "Learning Design", "AQF", "TEQSA",
    # 协作与敏捷开发
    "Agile", "Sprint-based Environment", "Team Collaboration", "Peer Review", "Design Critique"
]

# 按强度分级的关键词
level_keywords = {
    5: ["expert", "mastered", "advanced"],
    4: ["skilled", "proficient", "strong", "well-versed"],
    3: ["experience", "hands-on", "practical", "used"],
    2: ["basic", "familiar", "learning", "knowledge of"],
    1: ["understanding", "know", "aware of"]
}

def analyze_skill_strength(text):
    text_lower = text.lower() if text else ''
    rating = defaultdict(int)

    # 以句号、换行断句
    sentences = re.split(r"[。.\n]", text_lower)

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        # 当前句子的技能强度状态
        current_level = 0

        # 按词语拆分，但尽量保留语义（避免中文拆分过碎）
        tokens = re.split(r"[;,]|\band\b", sentence)

        for token in tokens:
            token = token.strip()
            # 如果有强度关键词，更新当前强度
            for level, keywords in level_keywords.items():
                for kw in keywords:
                    if re.search(rf"\b{re.escape(kw)}\b", token):
                        current_level = level

            # 遍历技能关键词，赋值
            for skill in skill_keywords:
                pattern = rf"\b{re.escape(skill.lower())}\b"
                if re.search(pattern, token):
                    level_to_use = current_level if current_level > 0 else 2
                    rating[skill] = max(rating[skill], level_to_use)

    return dict(rating)

# ========== 主程序入口 ==========
# print("开始连接数据库...")
# try:
#     with app.app_context():
#         # 创建所有表
#         db.create_all()
#         # ------- 查询 GroupMember 表 -------
#         print("\n开始查询组成员记录...")
#         group_members = GroupMember.query.all()
#         print(f"查询完成，找到 {len(group_members)} 条组成员记录")
#         # if group_members:
#         #     print("=" * 80)
#         #     print("组成员表格所有字段信息:")
#         #     for i, member in enumerate(group_members, 1):
#         #         print(f"\n成员 {i}:")
#         #         print(f"  组ID: {member.group_id}")
#         #         print(f"  姓名: {member.name}")
#         #         print(f"  技能: {member.skill}")
#         #         rating = analyze_skill_strength(member.skill or "")
#         #         if rating:
#         #             for skill, score in rating.items():
#         #                 print(f"   - {skill}: {score}")
#         #         else:
#         #             print("无有效技能信息")
#         #         print("-" * 60)

#         # ------- 查询 Project 表 -------
#         print("\n开始查询项目记录...")
#         projects = Project.query.all()
#         print(f"查询完成，找到 {len(projects)} 条项目记录")
#         # if projects:
#         #     print("=" * 80)
#         #     print("项目表格所有字段信息:")
#         #     for i, project in enumerate(projects, 1):
#         #         print(f"\n项目 {i}:")
#         #         print(f"  项目标题: {project.project_title}")
#         #         print(f"  所需技能原文: {project.required_skills}")
#         #         rating = analyze_skill_strength(project.required_skills or "")
#         #         if rating:
#         #             print(f"  技能强度评分:")
#         #             for skill, score in rating.items():
#         #                 print(f"   - {skill}: {score}")
#         #         else:
#         #             print("  无有效技能信息")
#         #         print("-" * 60)

# except Exception as e:
#     print(f"执行过程中出现错误: {str(e)}")
#     import traceback
#     traceback.print_exc()

class RecommendService:
    """推荐系统服务类"""
    _group_skills = None
    _project_skills = None
    _project_names = None
    _project_ids = None
    _ALPHA = 0.7  # 匹配度权重
    _BETA = 0.3   # 项目相关互补度权重

    @classmethod
    def load_data_from_db(cls):
        """
        从数据库加载成员技能和项目技能数据，构造向量
        """
        # 技能词表用于构建统一维度的向量
        all_skills = skill_keywords

        # 查询组成员
        group_members = GroupMember.query.all()
        group_vectors = []
        for member in group_members:
            skill_dict = analyze_skill_strength(member.skill or "")
            vector = [skill_dict.get(skill, 0) for skill in all_skills]
            group_vectors.append(vector)
        cls._group_skills = np.array(group_vectors)

        # 查询项目
        projects = Project.query.all()
        project_vectors = []
        project_names = []
        project_ids = []
        for project in projects:
            skill_dict = analyze_skill_strength(project.required_skills or "")
            if len(skill_dict) < 3:
                continue  # 忽略技能太少的项目
            vector = [skill_dict.get(skill, 0) for skill in all_skills]
            project_vectors.append(vector)
            project_names.append(project.project_title)
            project_ids.append(project.id)
        cls._project_skills = np.array(project_vectors)
        cls._project_names = project_names
        cls._project_ids = project_ids

    @classmethod
    def compute_group_vector(cls, group_skills):
        """计算小组技能向量平均值"""
        return np.mean(group_skills, axis=0)

    @classmethod
    def compute_match_scores(cls, group_vector, project_skills):
        """计算匹配度分数（不归一化）"""
        from sklearn.metrics.pairwise import cosine_similarity
        return cosine_similarity([group_vector], project_skills).flatten()

    @classmethod
    def compute_project_aware_complementarity(cls, group_skills, project_vector):
        """
        计算某个项目需求下，小组成员技能维度的分工程度（标准差越大表示越互补）
        """
        relevant_dims = np.where(project_vector > 0)[0]
        if len(relevant_dims) == 0:
            return 0.0
        scores = []
        for dim in relevant_dims:
            values = group_skills[:, dim]
            std_dev = np.std(values)
            scores.append(std_dev)
        return np.mean(scores)

    @classmethod
    def get_project_recommendations(cls, alpha=None, beta=None):
        from sklearn.preprocessing import minmax_scale
        if alpha is None:
            alpha = cls._ALPHA
        if beta is None:
            beta = cls._BETA

        group_vector = cls.compute_group_vector(cls._group_skills)

        # print("\n>>> 小组平均技能向量（所有维展示）:")
        # print(group_vector[:])

        match_scores = cls.compute_match_scores(group_vector, cls._project_skills)
        # print("\n>>> 原始匹配度分数 (cosine similarity):")
        # for i, score in enumerate(match_scores):
        #     print(f"  {cls._project_names[i]} => {score:.4f}")

        project_comp_scores = []
        for i, p in enumerate(cls._project_skills):
            comp_score = cls.compute_project_aware_complementarity(cls._group_skills, p)
            project_comp_scores.append(comp_score)
            # print(f"  {cls._project_names[i]} 互补度: {comp_score:.4f}")

        # 只归一化互补度
        comp_scores_norm = minmax_scale(project_comp_scores)

        # print("\n>>> 归一化后的互补度：")
        # for i, s in enumerate(comp_scores_norm):
        #     print(f"  {cls._project_names[i]} => {s:.4f}")

        # 加权求和：匹配度不归一化，互补度归一化
        weighted_match_scores = alpha * match_scores
        weighted_comp_scores = beta * comp_scores_norm
        total_scores = weighted_match_scores + weighted_comp_scores

        # print("\n>>> 最终加权总分：")
        # for i, s in enumerate(total_scores):
        #     print(f"  {cls._project_names[i]} => {s:.4f}")

        # 排名
        ranked_indices = np.argsort(-total_scores)
        recommendations = []
        for rank, idx in enumerate(ranked_indices[:6], 1):
            recommendations.append({
                'rank': rank,
                'project_id': cls._project_ids[idx],
                'project_name': cls._project_names[idx],
                'final_score': round(float(total_scores[idx]), 4),
            })
        return recommendations
    
# 不要有 if __name__ == '__main__' 入口和 app/app_context 相关代码