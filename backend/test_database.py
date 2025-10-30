#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库连接测试脚本
用于验证MySQL数据库配置是否正确
"""

import sys
import os
import subprocess
import pymysql
from database import Database

def check_mysql_service():
    """检查MySQL服务是否运行"""
    print(" 检查MySQL服务状态...")
    try:
        # 在Windows上检查MySQL服务
        result = subprocess.run(['sc', 'query', 'mysql'], 
                              capture_output=True, text=True, shell=True)
        if 'RUNNING' in result.stdout:
            print(" MySQL服务正在运行")
            return True
        else:
            print(" MySQL服务未运行")
            return False
    except Exception as e:
        print(f" 无法检查MySQL服务状态: {e}")
        return None

def test_mysql_connection():
    """测试基本MySQL连接"""
    print("\n 测试MySQL基本连接...")
    try:
        # 从环境变量读取配置
        from dotenv import load_dotenv
        load_dotenv()
        
        host = os.getenv('MYSQL_HOST', 'localhost')
        port = int(os.getenv('MYSQL_PORT', 3306))
        user = os.getenv('MYSQL_USER', 'root')
        password = os.getenv('MYSQL_PASSWORD', '')
        
        print(f"连接参数: {user}@{host}:{port}")
        
        # 尝试连接MySQL（不指定数据库）
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            charset='utf8mb4'
        )
        print(" MySQL基本连接成功")
        
        # 检查数据库是否存在
        database_name = os.getenv('MYSQL_DATABASE', 'travel_planning')
        with conn.cursor() as cursor:
            cursor.execute("SHOW DATABASES LIKE %s", (database_name,))
            if cursor.fetchone():
                print(f" 数据库 '{database_name}' 已存在")
            else:
                print(f" 数据库 '{database_name}' 不存在，将尝试创建...")
                cursor.execute(f"CREATE DATABASE {database_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                print(f" 数据库 '{database_name}' 创建成功")
        
        conn.close()
        return True
        
    except pymysql.Error as e:
        print(f" MySQL连接失败: {e}")
        return False

def test_database_connection():
    """测试数据库连接"""
    print(" 开始测试MySQL数据库连接...")
    print("=" * 50)
    
    try:
        # 初始化数据库
        print(" 初始化数据库连接...")
        db = Database()
        print(" 数据库连接成功！")
        
        # 测试数据库连接
        print("\n 测试数据库连接...")
        conn = db.get_connection()
        print(" 获取数据库连接成功！")
        
        # 测试表创建
        print("\n 验证数据表是否创建...")
        with conn.cursor() as cursor:
            # 检查user_demand表
            cursor.execute("SHOW TABLES LIKE 'user_demand'")
            if cursor.fetchone():
                print(" user_demand表已创建")
            else:
                print(" user_demand表未找到")
            
            # 检查travel_plan表
            cursor.execute("SHOW TABLES LIKE 'travel_plan'")
            if cursor.fetchone():
                print(" travel_plan表已创建")
            else:
                print(" travel_plan表未找到")
        
        conn.close()
        
        # 测试数据插入
        print("\n 测试数据插入...")
        demand_id = db.insert_user_demand(
            scene="测试场景",
            days=3,
            budget=1500.0,
            interest="测试兴趣",
            demand="测试需求"
        )
        print(f" 用户需求插入成功，ID: {demand_id}")
        
        # 测试方案插入
        plan_id = db.insert_travel_plan(
            demand_id=demand_id,
            plan_content='{"test": "测试方案内容"}'
        )
        print(f" 旅游方案插入成功，ID: {plan_id}")
        
        # 测试数据查询
        print("\n 测试数据查询...")
        plan_data = db.get_travel_plan(plan_id)
        if plan_data:
            print(" 数据查询成功")
            print(f"   方案ID: {plan_data['id']}")
            print(f"   需求ID: {plan_data['demand_id']}")
            print(f"   场景: {plan_data['scene']}")
            print(f"   天数: {plan_data['days']}")
            print(f"   预算: {plan_data['budget']}")
        else:
            print(" 数据查询失败")
        
        print("\n 所有测试通过！MySQL数据库集成正常工作")
        return True
        
    except Exception as e:
        print(f"\n 数据库测试失败: {e}")
        print("\n 请检查以下配置：")
        print("1. MySQL服务是否正在运行")
        print("2. .env文件中的数据库配置是否正确")
        print("3. 数据库用户是否有足够的权限")
        print("4. 数据库是否已创建")
        return False

def main():
    """主函数"""
    print(" MySQL数据库集成测试")
    print("=" * 50)
    
    # 检查环境变量文件
    if not os.path.exists('.env'):
        print(" 未找到.env文件，请先配置环境变量")
        return
    
    # 检查MySQL服务
    mysql_running = check_mysql_service()
    if mysql_running is False:
        print("\n 请先启动MySQL服务：")
        print("   - Windows: 在服务管理器中启动MySQL服务")
        print("   - 或运行: net start mysql")
        return
    elif mysql_running is None:
        print(" 无法检测MySQL服务状态，继续测试...")
    
    # 测试基本连接
    if not test_mysql_connection():
        print("\n MySQL连接失败，可能的解决方案：")
        print("1. 检查MySQL是否已安装并运行")
        print("2. 检查.env文件中的用户名和密码")
        print("3. 确保MySQL用户有足够权限")
        print("4. 如果是首次安装，可能需要设置root密码")
        return
    
    # 运行完整测试
    success = test_database_connection()
    
    if success:
        print("\n 数据库集成测试完成，系统可以正常使用MySQL数据库")
    else:
        print("\n 数据库集成测试失败，请检查配置后重试")

if __name__ == "__main__":
    main()