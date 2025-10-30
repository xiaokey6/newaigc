import pymysql
import sqlite3
import os
from datetime import datetime
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Database:
    def __init__(self):
        self.host = os.getenv('MYSQL_HOST', 'localhost')
        self.port = int(os.getenv('MYSQL_PORT', 3306))
        self.user = os.getenv('MYSQL_USER', 'admin')
        self.password = os.getenv('MYSQL_PASSWORD', 'password')
        self.database = os.getenv('MYSQL_DATABASE', 'example_db')
        self.charset = 'utf8mb4'
        self.use_sqlite = False
        
        try:
            self.init_database()
        except pymysql.Error as e:
            print(f"MySQL数据库初始化失败: {e}，将切换到SQLite数据库")
            self.use_sqlite = True
            self.init_sqlite_database()
    
    def get_connection(self):
        """获取数据库连接"""
        if self.use_sqlite:
            conn = sqlite3.connect('travel_planning.db')
            conn.row_factory = sqlite3.Row  # 使查询结果可以通过列名访问
            return conn
        else:
            try:
                connection = pymysql.connect(
                    host=self.host,
                    port=self.port,
                    user=self.user,
                    password=self.password,
                    database=self.database,
                    charset=self.charset,
                    cursorclass=pymysql.cursors.DictCursor
                )
                return connection
            except pymysql.Error as e:
                print(f"数据库连接失败: {e}")
                raise
    
    def init_database(self):
        """初始化MySQL数据库和表"""
        try:
            # 首先连接到MySQL服务器（不指定数据库）
            connection = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                charset=self.charset,
                cursorclass=pymysql.cursors.DictCursor
            )
            
            with connection.cursor() as cursor:
                # 创建数据库（如果不存在）
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            
            connection.close()
            
            # 连接到指定数据库并创建表
            conn = self.get_connection()
            with conn.cursor() as cursor:
                # 创建用户需求表
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS user_demand (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        scene VARCHAR(255) NOT NULL,
                        days INT NOT NULL,
                        budget DECIMAL(10,2) NOT NULL,
                        interest VARCHAR(255) NOT NULL,
                        demand TEXT NOT NULL,
                        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                ''')
                
                # 创建旅游方案表
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS travel_plan (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        demand_id INT,
                        plan_content TEXT NOT NULL,
                        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (demand_id) REFERENCES user_demand (id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                ''')
            
            conn.commit()
            conn.close()
            
        except pymysql.Error as e:
            print(f"数据库初始化失败: {e}")
            raise
    
    def init_sqlite_database(self):
        """初始化SQLite数据库和表"""
        try:
            conn = sqlite3.connect('travel_planning.db')
            cursor = conn.cursor()
            
            # 创建用户需求表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_demand (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    scene TEXT NOT NULL,
                    days INTEGER NOT NULL,
                    budget REAL NOT NULL,
                    interest TEXT NOT NULL,
                    demand TEXT NOT NULL,
                    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 创建旅游方案表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS travel_plan (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    demand_id INTEGER,
                    plan_content TEXT NOT NULL,
                    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (demand_id) REFERENCES user_demand (id) ON DELETE CASCADE
                )
            ''')
            
            conn.commit()
            conn.close()
            print("SQLite数据库初始化成功")
        except sqlite3.Error as e:
            print(f"SQLite数据库初始化失败: {e}")
            raise
    
    def insert_user_demand(self, scene, days, budget, interest, demand):
        """插入用户需求数据"""
        conn = self.get_connection()
        try:
            if self.use_sqlite:
                # SQLite游标不支持上下文管理器协议
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO user_demand (scene, days, budget, interest, demand, create_time)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (scene, days, budget, interest, demand, datetime.now()))
                demand_id = cursor.lastrowid
            else:
                # MySQL支持上下文管理器
                with conn.cursor() as cursor:
                    cursor.execute('''
                        INSERT INTO user_demand (scene, days, budget, interest, demand, create_time)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    ''', (scene, days, budget, interest, demand, datetime.now()))
                    demand_id = cursor.lastrowid
            
            conn.commit()
            return demand_id
        except Exception as e:
            if hasattr(conn, 'rollback'):
                conn.rollback()
            print(f"插入用户需求失败: {e}")
            raise
        finally:
            conn.close()
    
    def insert_travel_plan(self, demand_id, plan_content):
        """插入旅游方案数据"""
        conn = self.get_connection()
        try:
            if self.use_sqlite:
                # SQLite游标不支持上下文管理器协议
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO travel_plan (demand_id, plan_content, create_time)
                    VALUES (?, ?, ?)
                ''', (demand_id, plan_content, datetime.now()))
                plan_id = cursor.lastrowid
            else:
                # MySQL支持上下文管理器
                with conn.cursor() as cursor:
                    cursor.execute('''
                        INSERT INTO travel_plan (demand_id, plan_content, create_time)
                        VALUES (%s, %s, %s)
                    ''', (demand_id, plan_content, datetime.now()))
                    plan_id = cursor.lastrowid
            
            conn.commit()
            return plan_id
        except Exception as e:
            if hasattr(conn, 'rollback'):
                conn.rollback()
            print(f"插入旅游方案失败: {e}")
            raise
        finally:
            conn.close()
    
    def get_travel_plan(self, plan_id):
        """获取旅游方案"""
        conn = self.get_connection()
        try:
            if self.use_sqlite:
                # SQLite游标不支持上下文管理器协议
                cursor = conn.cursor()
                query = '''
                    SELECT tp.*, ud.scene, ud.days, ud.budget, ud.interest, ud.demand
                    FROM travel_plan tp
                    JOIN user_demand ud ON tp.demand_id = ud.id
                    WHERE tp.id = ?
                '''
                cursor.execute(query, (plan_id,))
                result = cursor.fetchone()
                # SQLite返回的是sqlite3.Row对象，转换为字典
                if result:
                    return dict(result)
                else:
                    return None
            else:
                # MySQL支持上下文管理器
                with conn.cursor() as cursor:
                    query = '''
                        SELECT tp.*, ud.scene, ud.days, ud.budget, ud.interest, ud.demand
                        FROM travel_plan tp
                        JOIN user_demand ud ON tp.demand_id = ud.id
                        WHERE tp.id = %s
                    '''
                    cursor.execute(query, (plan_id,))
                    result = cursor.fetchone()
                    # MySQL已经使用DictCursor，直接返回
                    return result
        except Exception as e:
            print(f"获取旅游方案失败: {e}")
            raise
        finally:
            conn.close()