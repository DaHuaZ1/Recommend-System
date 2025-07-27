import re
from collections import defaultdict
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import minmax_scale
from models.project import Project
from models.group import GroupMember

# #设置远程 MySQL 数据库连接参数
# import os
# os.environ['MYSQL_HOST'] = '182.92.72.100'
# os.environ['MYSQL_PORT'] = '3306'
# os.environ['MYSQL_USER'] = 'cakeuser'
# os.environ['MYSQL_PASSWORD'] = '123456'
# os.environ['MYSQL_DB'] = 'capstone_project'  # 数据库名
# #创建 Flask 应用实例
# app = Flask(__name__)
# #读取数据库连接信息
# mysql_host = os.environ.get('MYSQL_HOST', 'localhost')
# mysql_port = os.environ.get('MYSQL_PORT', '3306')
# mysql_user = os.environ.get('MYSQL_USER', 'root')
# mysql_password = os.environ.get('MYSQL_PASSWORD', '')
# mysql_db = os.environ.get('MYSQL_DB', 'test')
# #配置 SQLAlchemy
# app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}:{mysql_port}/{mysql_db}'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# #初始化数据库
# db = SQLAlchemy(app)
# #========== 模型定义 ==========
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
        print("\n" + "="*80)
        print("开始加载数据库数据...")
        
        # 技能词表用于构建统一维度的向量
        all_skills = skill_keywords
        print(f"技能词表维度: {len(all_skills)}")

        # 查询所有组成员，按group_id分组
        group_members = GroupMember.query.all()
        print(f"查询到 {len(group_members)} 个组成员")
        
        group_data = {}
        for member in group_members:
            if member.group_id not in group_data:
                group_data[member.group_id] = []
            
            # 分析组员技能
            skill_dict = analyze_skill_strength(member.skill or "")
            vector = [skill_dict.get(skill, 0) for skill in all_skills]
            
            # 调试输出：显示组员技能分析结果
            print(f"  组员 {member.name} (组{member.group_id}):")
            print(f"    原始技能文本: {member.skill[:100] if member.skill else '无'}...")
            print(f"    识别到的技能数量: {len(skill_dict)}")
            if skill_dict:
                print(f"    技能详情:")
                for skill, level in sorted(skill_dict.items(), key=lambda x: x[1], reverse=True)[:5]:  # 只显示前5个最高级别技能
                    print(f"      - {skill}: 级别{level}")
                if len(skill_dict) > 5:
                    print(f"      ... 还有 {len(skill_dict) - 5} 个技能")
            else:
                print(f"    警告: 未识别到任何技能")
            print(f"    技能向量维度: {len(vector)}, 非零元素: {sum(1 for x in vector if x > 0)}")
            print()
            
            group_data[member.group_id].append(vector)
        
        print(f"按组ID分组后，共有 {len(group_data)} 个不同的组")
        
        # 为每个组计算平均技能向量
        cls._group_skills = {}
        for group_id, vectors in group_data.items():
            if vectors:  # 确保组内有成员
                group_skills_array = np.array(vectors)
                cls._group_skills[group_id] = group_skills_array
                
                # 计算组平均技能向量
                avg_vector = np.mean(group_skills_array, axis=0)
                non_zero_skills = [(skill, avg_vector[i]) for i, skill in enumerate(all_skills) if avg_vector[i] > 0]
                non_zero_skills.sort(key=lambda x: x[1], reverse=True)
                
                print(f"   组 {group_id}: {len(vectors)} 个成员")
                print(f"    组平均技能向量维度: {len(avg_vector)}")
                print(f"    组平均技能向量非零元素: {len(non_zero_skills)}")
                if non_zero_skills:
                    print(f"    组平均技能 (前5个最高级别):")
                    for skill, level in non_zero_skills[:5]:
                        print(f"      - {skill}: 级别{level:.2f}")
                    if len(non_zero_skills) > 5:
                        print(f"      ... 还有 {len(non_zero_skills) - 5} 个技能")
                print()
        
        print(f"成功加载 {len(cls._group_skills)} 个组的技能数据")

        # 查询项目
        projects = Project.query.all()
        print(f"查询到 {len(projects)} 个项目")
        
        project_vectors = []
        project_names = []
        project_ids = []
        skipped_count = 0
        for project in projects:
            skill_dict = analyze_skill_strength(project.required_skills or "")
            
            # 调试输出：显示项目技能分析结果
            print(f"  项目 {project.project_number} - {project.project_title[:50]}...:")
            print(f"    原始技能要求: {project.required_skills[:100] if project.required_skills else '无'}...")
            print(f"    识别到的技能数量: {len(skill_dict)}")
            
            if len(skill_dict) < 3:
                skipped_count += 1
                print(f"    跳过: 技能数量不足 (需要>=3, 实际={len(skill_dict)})")
                print()
                continue  # 忽略技能太少的项目
            
            if skill_dict:
                print(f"    技能详情:")
                for skill, level in sorted(skill_dict.items(), key=lambda x: x[1], reverse=True)[:5]:  # 只显示前5个最高级别技能
                    print(f"      - {skill}: 级别{level}")
                if len(skill_dict) > 5:
                    print(f"      ... 还有 {len(skill_dict) - 5} 个技能")
            else:
                print(f"    警告: 未识别到任何技能")
            
            vector = [skill_dict.get(skill, 0) for skill in all_skills]
            print(f"    技能向量维度: {len(vector)}, 非零元素: {sum(1 for x in vector if x > 0)}")
            print()
            
            project_vectors.append(vector)
            project_names.append(project.project_title)
            project_ids.append(project.id)
        
        print(f"有效项目: {len(project_vectors)} 个，跳过技能不足项目: {skipped_count} 个")
        
        if len(project_vectors) == 0:
            print("警告: 没有有效的项目数据！")
            cls._project_skills = np.array([])
            cls._project_names = []
            cls._project_ids = []
        else:
            cls._project_skills = np.array(project_vectors)
            cls._project_names = project_names
            cls._project_ids = project_ids
            print(f"项目数据加载完成，维度: {cls._project_skills.shape}")
        
        print("="*80)

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
    def get_project_recommendations(cls, group_id=None, alpha=None, beta=None):
        """
        获取项目推荐
        Args:
            group_id: 指定组ID，如果为None则返回所有组的推荐
            alpha: 匹配度权重
            beta: 互补度权重
        """
        print("\n" + "="*20)
        print("开始项目推荐计算...")
        print(f"权重设置: α={alpha or cls._ALPHA}, β={beta or cls._BETA}")
        
        from sklearn.preprocessing import minmax_scale
        if alpha is None:
            alpha = cls._ALPHA
        if beta is None:
            beta = cls._BETA

        if group_id is not None:
            # 为指定组计算推荐
            print(f"为指定组 {group_id} 计算推荐")
            result = cls._get_recommendations_for_group(group_id, alpha, beta)
            print(f"组 {group_id} 推荐完成，共 {len(result)} 个项目")
            return result
        else:
            # 为所有组计算推荐
            print(f"为所有 {len(cls._group_skills)} 个组计算推荐")
            all_recommendations = {}
            for gid in cls._group_skills.keys():
                print(f"\n正在处理组 {gid}...")
                all_recommendations[gid] = cls._get_recommendations_for_group(gid, alpha, beta)
                print(f"组 {gid} 完成，推荐 {len(all_recommendations[gid])} 个项目")
            print(f"\n所有组推荐计算完成！")
            return all_recommendations

    @classmethod
    def _get_recommendations_for_group(cls, group_id, alpha, beta):
        """为指定组计算项目推荐"""
        from sklearn.preprocessing import minmax_scale
        
        print(f"  开始为组 {group_id} 计算推荐...")
        
        if group_id not in cls._group_skills:
            print(f"  组 {group_id} 不在技能数据中，跳过")
            return []
        
        group_skills = cls._group_skills[group_id]
        print(f"  组 {group_id} 有 {group_skills.shape[0]} 个成员，技能向量维度: {group_skills.shape[1]}")
        
        group_vector = cls.compute_group_vector(group_skills)
        print(f"  组平均技能向量计算完成")

        if len(cls._project_skills) == 0:
            print(f"  没有项目数据，组 {group_id} 无法计算推荐")
            return []

        match_scores = cls.compute_match_scores(group_vector, cls._project_skills)
        print(f"  匹配度分数计算完成，范围: [{match_scores.min():.4f}, {match_scores.max():.4f}]")
        
        project_comp_scores = []
        for i, p in enumerate(cls._project_skills):
            comp_score = cls.compute_project_aware_complementarity(group_skills, p)
            project_comp_scores.append(comp_score)
        print(f"  互补度分数计算完成，范围: [{min(project_comp_scores):.4f}, {max(project_comp_scores):.4f}]")

        # 归一化
        match_scores_norm = minmax_scale(match_scores)
        comp_scores_norm = minmax_scale(project_comp_scores)
        print(f"  分数归一化完成")

        # 加权求和
        weighted_match_scores = alpha * match_scores_norm
        weighted_comp_scores = beta * comp_scores_norm
        total_scores = weighted_match_scores + weighted_comp_scores
        # 分数大于0.9的项减去0.1
        total_scores = np.where(total_scores > 0.9, total_scores - 0.1, total_scores)
        print(f"  加权总分计算完成，范围: [{total_scores.min():.4f}, {total_scores.max():.4f}]")

        # 排名
        ranked_indices = np.argsort(-total_scores)
        recommendations = []
        print(f"  开始生成推荐排名...")
        for rank, idx in enumerate(ranked_indices[:6], 1):
            project_name = cls._project_names[idx]
            final_score = round(float(total_scores[idx]), 4)
            match_score = round(float(weighted_match_scores[idx]), 4)
            comp_score = round(float(weighted_comp_scores[idx]), 4)
            
            print(f"    {rank}. {project_name[:30]}... | 总分:{final_score} | 匹配:{match_score} | 互补:{comp_score}")
            
            recommendations.append({
                'rank': rank,
                'project_id': cls._project_ids[idx],
                'project_name': project_name,
                'final_score': final_score,
                'match_score': match_score,
                'complementarity_score': comp_score,
            })
        
        print(f"  组 {group_id} 推荐计算完成，共 {len(recommendations)} 个项目")
        return recommendations
    
# 不要有 if __name__ == '__main__' 入口和 app/app_context 相关代码