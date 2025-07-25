# 推荐系统后端

## 项目结构

```
backend/
├── app.py                 # 主应用文件
├── config.py             # 配置文件
├── requirements.txt      # Python依赖
├── init_db.py           # 数据库初始化脚本
├── auth/                # 认证模块
│   ├── controller.py    # 控制器层
│   ├── service.py       # 服务层
│   └── dao.py          # 数据访问层
├── models/              # 数据模型
│   └── user.py         # 用户模型
└── utils/               # 工具函数
    └── jwt_utils.py     # JWT工具
```

## 功能特性

### 用户认证
- **学生注册**: 邮箱、用户名、密码
- **教师注册**: 邮箱、用户名、密码 + 教师秘钥
- **学生登录**: 邮箱、密码
- **教师登录**: 邮箱、密码 + 教师秘钥
- **JWT Token认证**: 支持权限验证

### 角色权限
- **学生角色**: 只能访问学生相关功能
- **教师角色**: 可以访问教师管理功能

## 安装和运行

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 配置环境变量
创建 `.env` 文件并修改配置：
```bash
# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=capstone_project

# JWT配置
SECRET_KEY=your-secret-key
JWT_EXPIRATION_HOURS=24

# 教师登录秘钥
TEACHER_SECRET_KEY=teacher-secret-key-2024
```

### 3. 初始化数据库
```bash
python init_db.py
```

### 4. 运行应用
```bash
python app.py
```

## API接口

### 学生注册
```
POST /auth/register/student
Content-Type: application/json

{
    "email": "student@example.com",
    "username": "student_name",
    "password": "password123"
}
```

### 教师注册
```
POST /auth/register/teacher
Content-Type: application/json

{
    "email": "teacher@example.com",
    "username": "teacher_name",
    "password": "password123",
    "teacher_secret_key": "teacher-secret-key-2024"
}
```

### 学生登录
```
POST /auth/login/student
Content-Type: application/json

{
    "email": "student@example.com",
    "password": "password123"
}
```

### 教师登录
```
POST /auth/login/teacher
Content-Type: application/json

{
    "email": "teacher@example.com",
    "password": "password123",
    "teacher_secret_key": "teacher-secret-key-2024"
}
```

### 获取用户信息
```
GET /auth/profile
Authorization: Bearer <token>
```

## 数据库设计

### users表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| email | VARCHAR(120) | 邮箱，唯一 |
| username | VARCHAR(80) | 用户名 |
| password_hash | VARCHAR(255) | 密码哈希 |
| role | VARCHAR(20) | 角色(student/teacher) |

## 注意事项

1. **教师秘钥**: 所有教师使用同一个秘钥进行注册和登录
2. **密码安全**: 密码使用Werkzeug进行哈希处理
3. **JWT Token**: Token包含用户ID和角色信息，用于权限验证
4. **CORS**: 已配置跨域支持，方便前后端分离开发 