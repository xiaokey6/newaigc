import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { postRequest } from '../utils/api'

// 方案展示页面组件
const PlanPage = () => {
  const navigate = useNavigate()
  
  // 从localStorage获取表单数据
  const [planData, setPlanData] = useState(() => {
    const savedData = localStorage.getItem('travelPlanData')
    return savedData ? JSON.parse(savedData) : null
  })
  
  // 行程数据状态
  const [itinerary, setItinerary] = useState(() => {
    // 优先从localStorage获取后端返回的数据
    const savedItinerary = localStorage.getItem('itineraryData')
    if (savedItinerary) {
      try {
        const data = JSON.parse(savedItinerary)
        // 处理后端返回的格式
        return data.plan || data || generateMockItinerary()
      } catch (error) {
        console.error('解析行程数据失败:', error)
      }
    }
    // 如果没有后端数据，使用模拟数据
    return generateMockItinerary()
  })
  
  // 初始化检查
  useEffect(() => {
    if (!planData) {
      // 如果没有数据，重定向回需求页面
      navigate('/')
    }
  }, [planData, navigate])
  
  // 计算总预算
  const totalBudget = itinerary.daily_plans ? 
    itinerary.daily_plans.reduce((sum, day) => {
      return sum + (day.daily_total || 0)
    }, 0) : 0;
  
  // 检查是否超支
  const isOverBudget = planData && totalBudget > planData.budget
  
  // 处理动态调整按钮点击
  const handleAdjustPlan = (adjustType) => {
    // 从localStorage获取plan_id
    const savedItineraryData = localStorage.getItem('itineraryData')
    let planId = null
    
    if (savedItineraryData) {
      try {
        const data = JSON.parse(savedItineraryData)
        planId = data.plan_id || null
      } catch (error) {
        console.error('解析行程数据失败:', error)
      }
    }
    
    if (!planId) {
      alert('无法找到方案ID，请重新生成方案')
      return
    }
    
    // 准备请求数据
    const requestData = {
      plan_id: planId,
      adjust_type: adjustType // 'weather' 或 'crowd'
    }
    
    // 调用后端API重新生成方案
    postRequest(
      '/plan/adjust', // 动态调整接口路径
      requestData,
      // 成功回调
      (data) => {
        // 更新行程数据
        setItinerary(data.plan)
        // 更新localStorage中的数据
        localStorage.setItem('itineraryData', JSON.stringify(data))
        // 显示提示信息
        alert(`已根据"${adjustType === 'weather' ? '天气' : '人流量'}"重新生成旅游方案`)
      },
      // 失败回调
      (error) => {
        console.error('调整方案失败:', error)
        // 错误已经在api.js中处理和显示
      }
    )
  }
  
  if (!planData) {
    return <div className="text-center py-10">加载中...</div>
  }
  
  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in">
      {/* 行程摘要信息 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{planData.scenario} - {planData.days}天行程</h2>
          <div className="mt-2 md:mt-0 flex items-center space-x-2">
            <span className="text-gray-600">预算: </span>
            <span className={`font-semibold ${isOverBudget ? 'text-red-500' : 'text-green-600'}`}>
              ¥{totalBudget.toFixed(2)}
            </span>
            <span className="text-gray-500 text-sm">/ ¥{planData.budget}</span>
          </div>
        </div>
        
        {/* 行程摘要标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {planData.interests.food && <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">美食</span>}
          {planData.interests.history && <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">历史文化</span>}
          {planData.interests.nature && <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">自然风光</span>}
          {planData.specialNeeds && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">特殊需求</span>
          )}
        </div>
        
        {/* 动态调整按钮 */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleAdjustPlan('weather')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow transition duration-200"
          >
            天气突变
          </button>
          <button
            onClick={() => handleAdjustPlan('crowd')}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition duration-200"
          >
            景区拥挤
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow transition duration-200 ml-auto"
          >
            修改需求
          </button>
        </div>
      </div>
      
      {/* 行程表格 */}
        <div className="relative overflow-x-auto">
          <div className="bg-white rounded-xl shadow-lg">
            {itinerary && itinerary.daily_plans && itinerary.daily_plans.map((day, dayIndex) => (
              <div key={dayIndex} className="border-b last:border-b-0">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">第 {day.day} 天 - {day.date}</h3>
                  <div className="text-sm text-gray-600 mt-1">当日总预算: ¥{day.daily_total.toFixed(2)}</div>
                </div>
                
                {/* 表头 - 固定在顶部 */}
                <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700 sticky top-0 z-10">
                  <div>时间</div>
                  <div>景点</div>
                  <div>交通</div>
                  <div>餐饮</div>
                  <div>预算 (元)</div>
                </div>
                
                {/* 行程项目列表 */}
                <div className="divide-y">
                  {day.schedule && day.schedule.map((item, itemIndex) => (
                    <div 
                      key={itemIndex} 
                      className="md:grid md:grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition duration-150"
                    >
                      {/* 移动端显示的标签 */}
                      <div className="md:hidden grid grid-cols-2 gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-500">时间:</span>
                        <span className="text-sm font-medium">{item.time || '未指定'}</span>
                      </div>
                      {/* 时间 */}
                      <div className="text-sm font-medium hidden md:block">{item.time || '未指定'}</div>
                      
                      {/* 移动端显示的标签 */}
                      <div className="md:hidden grid grid-cols-2 gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-500">景点:</span>
                        <span className="text-sm font-medium">{item.attraction || '未指定'}</span>
                      </div>
                      {/* 景点 */}
                      <div className="text-sm font-medium hidden md:block">{item.attraction || '未指定'}</div>
                      
                      {/* 移动端显示的标签 */}
                      <div className="md:hidden grid grid-cols-2 gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-500">交通:</span>
                        <span className="text-sm">{item.transportation || '未指定'}</span>
                      </div>
                      {/* 交通 */}
                      <div className="text-sm hidden md:block">{item.transportation || '未指定'}</div>
                      
                      {/* 移动端显示的标签 */}
                      <div className="md:hidden grid grid-cols-2 gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-500">餐饮:</span>
                        <span className="text-sm">{item.dining || '未指定'}</span>
                      </div>
                      {/* 餐饮 */}
                      <div className="text-sm hidden md:block">{item.dining || '未指定'}</div>
                      
                      {/* 移动端显示的标签 */}
                      <div className="md:hidden grid grid-cols-2 gap-2">
                        <span className="text-xs font-semibold text-gray-500">预算:</span>
                        <span className="text-sm font-medium text-blue-600">¥{(item.budget || 0).toFixed(2)}</span>
                      </div>
                      {/* 预算 */}
                      <div className="text-sm font-medium text-blue-600 hidden md:block">¥{(item.budget || 0).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 旅游小贴士 */}
        {itinerary && itinerary.tips && itinerary.tips.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">旅游小贴士</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {itinerary.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 特殊注意事项 */}
        {itinerary && itinerary.special_notes && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">特殊注意事项</h3>
            <p className="text-gray-700">{itinerary.special_notes}</p>
          </div>
        )}
      
      {/* 总预算信息 */}
      <div className="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center">
        <div>
          <p className="text-gray-600">总预算</p>
          <h3 className="text-2xl font-bold">¥{planData.budget}</h3>
        </div>
        
        <div className="text-right">
          <p className="text-gray-600">已使用</p>
          <h3 className={`text-2xl font-bold ${isOverBudget ? 'text-red-500' : 'text-green-600'}`}>
            ¥{totalBudget.toFixed(2)}
          </h3>
        </div>
        
        <div className="text-right">
          <p className="text-gray-600">剩余</p>
          <h3 className={`text-2xl font-bold ${planData.budget - totalBudget < 0 ? 'text-red-500' : 'text-green-600'}`}>
            ¥{(planData.budget - totalBudget).toFixed(2)}
          </h3>
        </div>
      </div>
    </div>
  )
}

// 生成模拟行程数据的函数
function generateMockItinerary() {
  // 确保返回的数据结构一致，带有适当的类型安全
  return [
    {
      day: 1,
      items: [
        {
          time: '08:00-12:00',
          attraction: '故宫博物院',
          transportation: '地铁+步行',
          meal: '景区附近小吃',
          budget: 180.50
        },
        {
          time: '13:30-17:30',
          attraction: '天安门广场',
          transportation: '公交',
          meal: '王府井美食街',
          budget: 260.00
        },
        {
          time: '18:30-21:00',
          attraction: '三里屯',
          transportation: '出租车',
          meal: '三里屯餐厅',
          budget: 150.00
        }
      ],
      dayTotal: 590.50
    },
    {
      day: 2,
      items: [
        {
          time: '08:00-12:00',
          attraction: '长城',
          transportation: '地铁+步行',
          meal: '农家院午餐',
          budget: 220.75
        },
        {
          time: '13:30-17:30',
          attraction: '奥林匹克公园',
          transportation: '公交',
          meal: '簋街',
          budget: 190.50
        },
        {
          time: '18:30-21:00',
          attraction: '国贸CBD',
          transportation: '出租车',
          meal: 'CBD餐厅',
          budget: 210.25
        }
      ],
      dayTotal: 621.50
    },
    {
      day: 3,
      items: [
        {
          time: '08:00-12:00',
          attraction: '颐和园',
          transportation: '地铁+步行',
          meal: '园内餐厅',
          budget: 240.00
        },
        {
          time: '13:30-17:30',
          attraction: '什刹海',
          transportation: '公交',
          meal: '南锣鼓巷',
          budget: 175.50
        },
        {
          time: '18:30-21:00',
          attraction: '前门大街',
          transportation: '出租车',
          meal: '前门老字号',
          budget: 185.00
        }
      ],
      dayTotal: 600.50
    }
  ]
}

export default PlanPage