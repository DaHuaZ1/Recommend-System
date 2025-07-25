#!/usr/bin/env python3
"""
数据库初始化脚本
"""

import pymysql
from config import Config

def create_database():
    """创建数据库"""
    try:
        # 连接MySQL服务器（不指定数据库）
        connection = pymysql.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # 创建数据库
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.MYSQL_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        
        print(f"数据库 {Config.MYSQL_DB} 创建成功！")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"创建数据库失败: {str(e)}")
        return False
    
    return True

def create_tables():
    """创建表结构"""
    try:
        from app import app
        from models.user import db
        
        with app.app_context():
            db.create_all()
            print("数据库表创建成功！")
            
    except Exception as e:
        print(f"创建表失败: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    print("开始初始化数据库...")
    
    # 创建数据库
    if create_database():
        # 创建表
        create_tables()
    else:
        print("数据库初始化失败！") 