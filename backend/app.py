from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from database import Database
from services import AIGCService

# 创建Flask应用
app = Flask(__name__)

# 配置CORS处理跨域
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 初始化数据库和服务
db = Database()
aigc_service = AIGCService()

def validate_required_fields(data, required_fields):
    """验证必需字段"""
    missing_fields = []
    for field in required_fields:
        if field not in data or not data[field]:
            missing_fields.append(field)
    return missing_fields

@app.route('/api/plan/input', methods=['POST'])
def receive_demand():
    """接口1：需求接收"""
    try:
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "请求数据不能为空"
            }), 400
        
        # 验证必需参数
        required_fields = ['scene', 'days', 'budget', 'interest', 'demand']
        missing_fields = validate_required_fields(data, required_fields)
        
        if missing_fields:
            return jsonify({
                "success": False,
                "error": f"缺少必需参数: {', '.join(missing_fields)}"
            }), 400
        
        # 参数类型验证
        try:
            days = int(data['days'])
            budget = float(data['budget'])
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "error": "days必须是整数，budget必须是数字"
            }), 400
        
        # 存储到数据库
        demand_id = db.insert_user_demand(
            scene=data['scene'],
            days=days,
            budget=budget,
            interest=data['interest'],
            demand=data['demand']
        )
        
        return jsonify({
            "success": True,
            "message": "需求接收成功",
            "data": {
                "demand_id": demand_id,
                "scene": data['scene'],
                "days": days,
                "budget": budget,
                "interest": data['interest'],
                "demand": data['demand']
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"服务器内部错误: {str(e)}"
        }), 500

@app.route('/api/plan/generate', methods=['POST'])
def generate_plan():
    """接口2：方案生成"""
    try:
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "请求数据不能为空"
            }), 400
        
        # 验证必需参数
        required_fields = ['scene', 'days', 'budget', 'interest', 'demand']
        missing_fields = validate_required_fields(data, required_fields)
        
        if missing_fields:
            return jsonify({
                "success": False,
                "error": f"缺少必需参数: {', '.join(missing_fields)}"
            }), 400
        
        # 参数类型验证
        try:
            days = int(data['days'])
            budget = float(data['budget'])
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "error": "days必须是整数，budget必须是数字"
            }), 400
        
        # 先存储需求（如果还没有存储的话）
        demand_id = db.insert_user_demand(
            scene=data['scene'],
            days=days,
            budget=budget,
            interest=data['interest'],
            demand=data['demand']
        )
        
        # 调用AIGC服务生成方案
        plan_result = aigc_service.generate_travel_plan(
            scene=data['scene'],
            days=days,
            budget=budget,
            interest=data['interest'],
            demand=data['demand']
        )
        
        if not plan_result["success"]:
            return jsonify({
                "success": False,
                "error": plan_result["error"]
            }), 500
        
        # 存储生成的方案
        plan_content = json.dumps(plan_result["data"], ensure_ascii=False)
        plan_id = db.insert_travel_plan(demand_id, plan_content)
        
        return jsonify({
            "success": True,
            "message": "旅游方案生成成功",
            "data": {
                "plan_id": plan_id,
                "demand_id": demand_id,
                "plan": plan_result["data"]
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"服务器内部错误: {str(e)}"
        }), 500

@app.route('/api/plan/adjust', methods=['POST'])
def adjust_plan():
    """接口3：动态调整"""
    try:
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "请求数据不能为空"
            }), 400
        
        # 验证必需参数
        required_fields = ['plan_id', 'adjust_type']
        missing_fields = validate_required_fields(data, required_fields)
        
        if missing_fields:
            return jsonify({
                "success": False,
                "error": f"缺少必需参数: {', '.join(missing_fields)}"
            }), 400
        
        # 验证调整类型
        if data['adjust_type'] not in ['weather', 'crowd']:
            return jsonify({
                "success": False,
                "error": "adjust_type必须是'weather'或'crowd'"
            }), 400
        
        # 获取原始方案
        plan_data = db.get_travel_plan(data['plan_id'])
        
        if not plan_data:
            return jsonify({
                "success": False,
                "error": "找不到指定的旅游方案"
            }), 404
        
        # 解析原始方案
        try:
            original_plan = json.loads(plan_data[2])  # plan_content字段
        except json.JSONDecodeError:
            return jsonify({
                "success": False,
                "error": "原始方案数据格式错误"
            }), 500
        
        # 获取城市信息（从需求中提取或使用默认值）
        city = data.get('city', '北京')  # 可以从原始需求中提取城市信息
        
        # 调用调整服务
        adjust_result = aigc_service.adjust_plan_by_weather(
            original_plan=original_plan,
            city=city,
            adjust_type=data['adjust_type']
        )
        
        if not adjust_result["success"]:
            return jsonify({
                "success": False,
                "error": adjust_result["error"]
            }), 500
        
        # 存储调整后的方案
        adjusted_content = json.dumps(adjust_result["data"], ensure_ascii=False)
        new_plan_id = db.insert_travel_plan(plan_data[1], adjusted_content)  # demand_id
        
        return jsonify({
            "success": True,
            "message": f"方案{data['adjust_type']}调整成功",
            "data": {
                "original_plan_id": data['plan_id'],
                "new_plan_id": new_plan_id,
                "adjust_type": data['adjust_type'],
                "adjusted_plan": adjust_result["data"]
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"服务器内部错误: {str(e)}"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        "success": True,
        "message": "AIGC旅游规划系统运行正常",
        "version": "1.0.0"
    }), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "接口不存在"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "服务器内部错误"
    }), 500

if __name__ == '__main__':
    print("AIGC旅游规划系统启动中...")
    print("服务地址: http://localhost:5000")
    print("API文档: 请查看README.md")
    print("=" * 50)
    
    # 启动Flask应用
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )