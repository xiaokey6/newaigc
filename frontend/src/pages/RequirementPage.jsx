import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postRequest } from '../utils/api'

// 需求输入页面组件
const RequirementPage = () => {
  const navigate = useNavigate()
  
  // 表单状态管理
  const [formData, setFormData] = useState({
    scene: '大学生独自游', // 默认场景
    days: 3, // 默认3天
    budget: 1500, // 默认1500元
    interests: { // 兴趣标签状态
      food: false,
      history: false,
      nature: false
    },
    demand: '' // 特殊需求
  })
  
  // 处理场景选择变化
  const handleSceneChange = (e) => {
    setFormData({ ...formData, scene: e.target.value })
  }
  
  // 处理基础维度输入变化
  const handleBasicInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }
  
  // 处理兴趣标签变化
  const handleInterestChange = (interest) => {
    setFormData({
      ...formData,
      interests: {
        ...formData.interests,
        [interest]: !formData.interests[interest]
      }
    })
  }
  
  // 处理特殊需求变化
  const handleDemandChange = (e) => {
    setFormData({ ...formData, demand: e.target.value })
  }
  
  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 准备发送给后端的数据（格式化）
    // 提取选中的兴趣标签
    const selectedInterests = Object.entries(formData.interests)
      .filter(([_, checked]) => checked)
      .map(([key]) => {
        // 将键名转换为对应的中文标签
        const labels = {
          food: '美食',
          history: '历史文化',
          nature: '自然风光'
        }
        return labels[key] || key
      })
    
    // 确保interest字段不为空，提供默认值
    const interestString = selectedInterests.length > 0 
      ? selectedInterests.join(',') 
      : '无特定兴趣' // 后端要求该字段不能为空
    
    // 确保days和budget是有效的数字
    const daysValue = parseInt(formData.days) || 1
    const budgetValue = parseFloat(formData.budget) || 100
    
    // 确保demand字段不为空
    const demandValue = formData.demand || '无特殊需求'
    
    const requestData = {
      scene: formData.scene || '大学生独自游', // 提供默认场景
      days: daysValue, // 确保是整数类型
      budget: budgetValue, // 确保是数字类型
      interest: interestString, // 确保不为空
      demand: demandValue // 确保不为空
    }
    
    console.log('提交给后端的数据:', requestData)
    
    // 调用后端API生成方案
    postRequest(
      '/plan/generate', // 后端方案生成接口路径
      requestData,
      // 成功回调
      (data) => {
        // 将后端返回的数据存储到localStorage，供PlanPage使用
        localStorage.setItem('travelPlanData', JSON.stringify(formData))
        localStorage.setItem('itineraryData', JSON.stringify(data))
        // 跳转到方案展示页
        navigate('/plan')
      },
      // 失败回调
      (error) => {
        console.error('提交需求失败:', error)
        // 错误已经在api.js中处理和显示
      }
    )
  }
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">旅游需求输入</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 场景选择 */}
        <div className="space-y-2">
          <label htmlFor="scenario" className="block text-sm font-medium text-gray-700">
            场景选择
          </label>
          <select
            id="scene"
            value={formData.scene}
            onChange={handleSceneChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
            <option value="大学生独自游">大学生独自游</option>
            <option value="家庭游">家庭游</option>
          </select>
        </div>
        
        {/* 基础维度输入 */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700">基础维度</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 时间输入 */}
            <div className="space-y-2">
              <label htmlFor="days" className="block text-sm font-medium text-gray-700">
                旅行天数 (天)
              </label>
              <input
                type="number"
                id="days"
                min="1"
                max="30"
                value={formData.days}
                onChange={(e) => handleBasicInputChange('days', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              />
            </div>
            
            {/* 预算输入 */}
            <div className="space-y-2">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                预算金额 (元)
              </label>
              <input
                type="number"
                id="budget"
                min="100"
                max="50000"
                value={formData.budget}
                onChange={(e) => handleBasicInputChange('budget', parseInt(e.target.value) || 100)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              />
            </div>
          </div>
          
          {/* 兴趣标签 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              兴趣标签
            </label>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.interests.food}
                  onChange={() => handleInterestChange('food')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">美食</span>
              </label>
              
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.interests.history}
                  onChange={() => handleInterestChange('history')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">历史文化</span>
              </label>
              
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.interests.nature}
                  onChange={() => handleInterestChange('nature')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">自然风光</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* 特殊需求 */}
        <div className="space-y-2">
          <label htmlFor="specialNeeds" className="block text-sm font-medium text-gray-700">
            特殊需求
          </label>
          <textarea
            id="demand"
            value={formData.demand}
            onChange={handleDemandChange}
            placeholder="如学生证优惠、儿童设施等"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />
        </div>
        
        {/* 提交按钮 */}
        <button
          type="submit"
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-md hover:brightness-110 transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        >
          生成旅游方案
        </button>
      </form>
    </div>
  )
}

export default RequirementPage