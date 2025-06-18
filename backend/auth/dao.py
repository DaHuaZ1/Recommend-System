from models.user import User, db

class UserDAO:
    """
    用户数据访问对象（Data Access Object）
    封装所有与用户相关的数据库操作
    提供统一的数据库访问接口
    """
    
    @staticmethod
    def create_user(user):
        """
        创建新用户
        
        参数:
            user: User对象，包含用户信息
            
        返回:
            bool: 创建是否成功
            
        异常:
            抛出数据库操作异常
        """
        try:
            # 将用户对象添加到数据库会话
            db.session.add(user)
            # 提交事务，将数据写入数据库
            db.session.commit()
            return True
        except Exception as e:
            # 如果出现异常，回滚事务
            db.session.rollback()
            # 重新抛出异常，让上层处理
            raise e
    
    @staticmethod
    def find_user_by_email(email):
        """
        根据邮箱查找用户
        
        参数:
            email: 邮箱地址
            
        返回:
            User: 用户对象，如果不存在返回None
        """
        # 使用SQLAlchemy查询用户
        # filter_by(email=email) 相当于 SQL: WHERE email = ?
        # first() 返回第一个匹配的结果，如果没有则返回None
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def find_user_by_id(user_id):
        """
        根据用户ID查找用户
        
        参数:
            user_id: 用户ID
            
        返回:
            User: 用户对象，如果不存在返回None
        """
        # 使用SQLAlchemy根据主键查找用户
        # get(user_id) 相当于 SQL: WHERE id = ?
        return User.query.get(user_id)
    
    @staticmethod
    def find_users_by_role(role):
        """
        根据角色查找所有用户
        
        参数:
            role: 用户角色（'student' 或 'teacher'）
            
        返回:
            list: 用户对象列表
        """
        # 使用SQLAlchemy查询指定角色的所有用户
        # filter_by(role=role) 相当于 SQL: WHERE role = ?
        # all() 返回所有匹配的结果
        return User.query.filter_by(role=role).all()
    
    @staticmethod
    def update_user(user):
        """
        更新用户信息
        
        参数:
            user: 已修改的User对象
            
        返回:
            bool: 更新是否成功
            
        异常:
            抛出数据库操作异常
        """
        try:
            # 提交事务，将修改写入数据库
            # 由于user对象已经在会话中，直接提交即可
            db.session.commit()
            return True
        except Exception as e:
            # 如果出现异常，回滚事务
            db.session.rollback()
            # 重新抛出异常，让上层处理
            raise e
    
    @staticmethod
    def delete_user(user_id):
        """
        删除用户
        
        参数:
            user_id: 要删除的用户ID
            
        返回:
            bool: 删除是否成功
            
        异常:
            抛出数据库操作异常
        """
        try:
            # 根据ID查找用户
            user = User.query.get(user_id)
            if user:
                # 如果用户存在，从会话中删除
                db.session.delete(user)
                # 提交事务
                db.session.commit()
                return True
            # 如果用户不存在，返回False
            return False
        except Exception as e:
            # 如果出现异常，回滚事务
            db.session.rollback()
            # 重新抛出异常，让上层处理
            raise e
