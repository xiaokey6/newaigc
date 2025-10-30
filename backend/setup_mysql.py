#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MySQL数据库配置向导
帮助用户配置MySQL数据库连接
"""

import os
import pymysql
import getpass
from dotenv import load_dotenv, set_key

def test_connection(host, port, user, password, database=None):
    """测试数据库连接"""
    try:
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            charset='utf8mb4'
        )
        conn.close()
        return True
    except Exception as e:
        print(f"连接失败: {e}")
        return False

def create_database(host, port, user, password, database_name):
    """创建数据库"""
    try:
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            charset='utf8mb4'
        )
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        conn.close()
        return True
    except Exception as e:
        print(f"创建数据库失败: {e}")
        return False

def update_env_file(host, port, user, password, database):
    """更新.env文件"""
    env_file = '.env'
    
    # 更新或添加MySQL配置
    set_key(env_file, 'MYSQL_HOST', host)
    set_key(env_file, 'MYSQL_PORT', str(port))
    set_key(env_file, 'MYSQL_USER', user)
    set_key(env_file, 'MYSQL_PASSWORD', password)
    set_key(env_file, 'MYSQL_DATABASE', database)
    
    print(f"配置已保存到 {env_file}")

def main():
    """主配置向导"""
    print("MySQL数据库配置向导")
    print("=" * 50)
    print("此向导将帮助您配置MySQL数据库连接")
    print()
    
    # 加载现有配置
    load_dotenv()
    
    # 获取配置信息
    print("请输入MySQL连接信息：")
    host = input(f"主机地址 (默认: localhost): ").strip() or 'localhost'
    port = input(f"端口 (默认: 3306): ").strip() or '3306'
    try:
        port = int(port)
    except ValueError:
        print("端口必须是数字")
        return
    
    user = input(f"用户名 (默认: root): ").strip() or 'root'
    password = getpass.getpass("密码: ")
    database = input(f"数据库名 (默认: travel_planning): ").strip() or 'travel_planning'
    
    print("\n测试连接...")
    
    # 测试基本连接
    if not test_connection(host, port, user, password):
        print("无法连接到MySQL服务器，请检查配置")
        return
    
    print("MySQL服务器连接成功")
    
    # 创建数据库
    print(f"\n创建数据库 '{database}'...")
    if create_database(host, port, user, password, database):
        print(f"数据库 '{database}' 创建成功")
    else:
        print(f"数据库 '{database}' 创建失败")
        return
    
    # 测试数据库连接
    print(f"\n测试数据库连接...")
    if test_connection(host, port, user, password, database):
        print("数据库连接测试成功")
    else:
        print("数据库连接测试失败")
        return
    
    # 保存配置
    print("\n保存配置...")
    update_env_file(host, port, user, password, database)
    
    print("\nMySQL配置完成！")
    print("\n配置摘要：")
    print(f"   主机: {host}")
    print(f"   端口: {port}")
    print(f"   用户: {user}")
    print(f"   数据库: {database}")
    print("\n现在可以运行 'python test_database.py' 来测试完整的数据库集成")

if __name__ == "__main__":
    main()