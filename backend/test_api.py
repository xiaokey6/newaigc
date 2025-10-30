#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIGC旅游规划系统API测试脚本
"""

import requests
import json
import time

def test_api():
    """测试所有API接口"""
    base_url = "http://localhost:5000"
    
    print("🧪 开始测试AIGC旅游规划系统API...")
    print("=" * 60)
    
    # 测试数据
    test_data = {
        "scene": "大学生独自游",
        "days": 3,
        "budget": 1500,
        "interest": "美食",
        "demand": "学生证优惠"
    }
    
    try:
        # 1. 测试健康检查
        print("1️⃣ 测试健康检查接口...")
        response = requests.get(f"{base_url}/api/health", timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
        print()
        
        # 2. 测试需求接收
        print("2️⃣ 测试需求接收接口...")
        response = requests.post(f"{base_url}/api/plan/input", json=test_data, timeout=10)
        print(f"状态码: {response.status_code}")
        result = response.json()
        print(f"响应: {json.dumps(result, ensure_ascii=False, indent=2)}")
        print()
        
        if not result.get("success"):
            print("❌ 需求接收失败，停止后续测试")
            return
        
        # 3. 测试方案生成（需要API密钥）
        print("3️⃣ 测试方案生成接口...")
        print("⚠️  注意：此接口需要配置DashScope API密钥")
        response = requests.post(f"{base_url}/api/plan/generate", json=test_data, timeout=60)
        print(f"状态码: {response.status_code}")
        result = response.json()
        print(f"响应: {json.dumps(result, ensure_ascii=False, indent=2)}")
        print()
        
        if result.get("success"):
            plan_id = result["data"]["plan_id"]
            
            # 4. 测试方案调整（需要API密钥）
            print("4️⃣ 测试方案调整接口...")
            print("⚠️  注意：此接口需要配置高德地图API密钥")
            adjust_data = {
                "plan_id": plan_id,
                "adjust_type": "weather",
                "city": "北京"
            }
            response = requests.post(f"{base_url}/api/plan/adjust", json=adjust_data, timeout=60)
            print(f"状态码: {response.status_code}")
            result = response.json()
            print(f"响应: {json.dumps(result, ensure_ascii=False, indent=2)}")
            print()
        
        print("✅ API测试完成！")
        
    except requests.exceptions.ConnectionError:
        print("❌ 连接失败：请确保服务器已启动 (python app.py)")
    except requests.exceptions.Timeout:
        print("❌ 请求超时：API调用时间过长")
    except Exception as e:
        print(f"❌ 测试失败：{str(e)}")

def test_error_cases():
    """测试错误情况"""
    base_url = "http://localhost:5000"
    
    print("🧪 测试错误处理...")
    print("=" * 60)
    
    try:
        # 测试缺少参数
        print("1️⃣ 测试缺少必需参数...")
        incomplete_data = {
            "scene": "大学生独自游",
            "days": 3
            # 缺少 budget, interest, demand
        }
        response = requests.post(f"{base_url}/api/plan/input", json=incomplete_data, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
        print()
        
        # 测试错误的数据类型
        print("2️⃣ 测试错误的数据类型...")
        wrong_type_data = {
            "scene": "大学生独自游",
            "days": "三天",  # 应该是数字
            "budget": "一千五",  # 应该是数字
            "interest": "美食",
            "demand": "学生证优惠"
        }
        response = requests.post(f"{base_url}/api/plan/input", json=wrong_type_data, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
        print()
        
        # 测试不存在的接口
        print("3️⃣ 测试不存在的接口...")
        response = requests.get(f"{base_url}/api/nonexistent", timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
        print()
        
        print("✅ 错误处理测试完成！")
        
    except Exception as e:
        print(f"❌ 错误测试失败：{str(e)}")

if __name__ == "__main__":
    print("🚀 AIGC旅游规划系统API测试工具")
    print("请确保服务器已启动：python app.py")
    print()
    
    # 等待用户确认
    input("按回车键开始测试...")
    
    # 执行测试
    test_api()
    print()
    test_error_cases()
    
    print("\n📝 测试说明：")
    print("- 健康检查和需求接收接口应该正常工作")
    print("- 方案生成和调整接口需要配置相应的API密钥")
    print("- 请在.env文件中配置DASHSCOPE_API_KEY和AMAP_API_KEY")