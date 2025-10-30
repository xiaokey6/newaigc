import dashscope
import requests
import json
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class AIGCService:
    def __init__(self):
        # 设置DashScope API密钥
        dashscope.api_key = os.getenv('DASHSCOPE_API_KEY')
        # 高德地图API密钥
        self.amap_key = os.getenv('AMAP_API_KEY')
    
    def generate_travel_plan(self, scene, days, budget, interest, demand):
        """使用qwen3-max生成旅游方案"""
        try:
            # 构建提示词模板
            prompt = f"""作为{scene}规划师，基于{days}天/{budget}元/{interest}，生成含{demand}的行程。

请按照以下JSON格式输出旅游方案：
{{
    "title": "旅游方案标题",
    "total_days": {days},
    "total_budget": {budget},
    "daily_plans": [
        {{
            "day": 1,
            "date": "第一天",
            "schedule": [
                {{
                    "time": "09:00-11:00",
                    "attraction": "景点名称",
                    "transportation": "交通方式",
                    "dining": "餐饮安排",
                    "budget": 200
                }}
            ],
            "daily_total": 500
        }}
    ],
    "tips": ["旅游小贴士1", "旅游小贴士2"],
    "special_notes": "{demand}相关注意事项"
}}

请确保：
1. 每日行程包含时间、景点、交通、餐饮、预算
2. 总预算控制在{budget}元以内
3. 充分考虑{interest}兴趣偏好
4. 满足{demand}特殊需求
5. 返回标准JSON格式"""

            # 调用qwen3-max API
            response = dashscope.Generation.call(
                model='qwen-max',
                messages=[
                    {"role": "system", "content": "你是一个专业的旅游规划师，擅长制定详细的旅游计划。"},
                    {"role": "user", "content": prompt}
                ],
                result_format='message',
                max_tokens=2000,
                temperature=0.7
            )
            
            # 检查响应状态
            if response.status_code == 200:
                # 提取生成的内容
                plan_content = response.output.choices[0].message.content
                
                # 尝试解析JSON
                try:
                    plan_json = json.loads(plan_content)
                    return {"success": True, "data": plan_json}
                except json.JSONDecodeError:
                    # 如果不是标准JSON，返回原始文本
                    return {"success": True, "data": {"raw_content": plan_content}}
            else:
                return {"success": False, "error": f"API调用失败: {response.message}"}
                
        except Exception as e:
            return {"success": False, "error": f"生成旅游方案失败: {str(e)}"}
    
    def get_weather_info(self, city):
        """获取城市天气信息"""
        try:
            # 高德地图天气API
            url = f"https://restapi.amap.com/v3/weather/weatherInfo"
            params = {
                'key': self.amap_key,
                'city': city,
                'extensions': 'all'  # 获取预报天气
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            if data.get('status') == '1':
                return {"success": True, "data": data}
            else:
                return {"success": False, "error": "获取天气信息失败"}
                
        except Exception as e:
            return {"success": False, "error": f"天气API调用失败: {str(e)}"}
    
    def adjust_plan_by_weather(self, original_plan, city, adjust_type):
        """根据天气调整旅游方案"""
        try:
            # 获取天气信息
            weather_result = self.get_weather_info(city)
            
            if not weather_result["success"]:
                return weather_result
            
            weather_data = weather_result["data"]
            
            # 构建调整提示词
            if adjust_type == "weather":
                prompt = f"""基于以下天气信息调整旅游方案：
天气数据：{json.dumps(weather_data, ensure_ascii=False)}

原始方案：{json.dumps(original_plan, ensure_ascii=False)}

请根据天气情况调整方案：
1. 如果有雨天，推荐室内景点
2. 如果天气晴好，推荐户外活动
3. 根据温度调整服装建议
4. 保持原有的预算和天数不变

请返回调整后的完整JSON方案。"""
            
            elif adjust_type == "crowd":
                prompt = f"""基于人流量情况调整旅游方案：
原始方案：{json.dumps(original_plan, ensure_ascii=False)}

请根据人流量调整方案：
1. 避开热门景点的高峰时段
2. 推荐相对冷门但有特色的景点
3. 调整游览时间安排
4. 保持原有的预算和天数不变

请返回调整后的完整JSON方案。"""
            
            # 调用qwen3-max API进行调整
            response = dashscope.Generation.call(
                model='qwen-max',
                messages=[
                    {"role": "system", "content": "你是一个专业的旅游规划师，擅长根据实时信息调整旅游计划。"},
                    {"role": "user", "content": prompt}
                ],
                result_format='message',
                max_tokens=2000,
                temperature=0.7
            )
            
            # 检查响应状态
            if response.status_code == 200:
                adjusted_content = response.output.choices[0].message.content
                
                # 尝试解析JSON
                try:
                    adjusted_plan = json.loads(adjusted_content)
                    return {"success": True, "data": adjusted_plan}
                except json.JSONDecodeError:
                    return {"success": True, "data": {"raw_content": adjusted_content}}
            else:
                return {"success": False, "error": f"API调用失败: {response.message}"}
                
        except Exception as e:
            return {"success": False, "error": f"方案调整失败: {str(e)}"}