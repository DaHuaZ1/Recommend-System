# 导入操作系统模块，用于读取环境变量
import os
import traceback

class Config:
    """
    应用配置类
    使用环境变量来配置应用，支持不同环境（开发、测试、生产）
    如果环境变量不存在，使用默认值
    """
    
    # ==================== 数据库配置 ====================
    # MySQL服务器地址，用户需填写阿里云公网IP
    MYSQL_HOST = os.environ.get('MYSQL_HOST', '182.92.72.100')
    
    # MySQL端口号，默认3306
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))
    
    # MySQL用户名，已改为cakeuser
    MYSQL_USER = os.environ.get('MYSQL_USER', 'cakeuser')
    
    # MySQL密码，已改为123456
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '123456')
    
    # 数据库名称，已改为capstone_project
    MYSQL_DB = os.environ.get('MYSQL_DB', 'capstone_project')
    
    # ==================== SQLAlchemy配置 ====================
    # 数据库连接字符串
    # 格式：mysql+pymysql://用户名:密码@主机:端口/数据库名
    SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}'
    
    # 关闭SQLAlchemy的修改跟踪功能，提高性能
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # 数据库连接池配置
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,  # 连接池大小
        'pool_timeout': 20,  # 连接超时时间（秒）
        'pool_recycle': 3600,  # 连接回收时间（秒）
        'pool_pre_ping': True,  # 连接前ping测试
        'max_overflow': 20,  # 最大溢出连接数
    }
    
    # ==================== JWT配置 ====================
    # JWT签名密钥，用于生成和验证token
    # 在生产环境中必须设置一个强密钥
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key')
    
    # JWT token的过期时间（小时）
    JWT_EXPIRATION_HOURS = 24
    
    # ==================== 教师秘钥配置 ====================
    # 教师注册和登录的统一秘钥
    # 所有教师都使用这个秘钥进行身份验证
    TEACHER_SECRET_KEY = '123456'
