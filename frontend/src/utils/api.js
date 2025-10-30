import ErrorNotification from './ErrorNotification';

// API请求工具类

// 开发模式设置 - 连接实际后端
const ENABLE_MOCK = false; // 设置为false连接实际后端API

// API基础URL（从环境变量获取）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 默认请求超时时间（毫秒）
const DEFAULT_TIMEOUT = 10000;

/**
 * 构建完整的API请求URL
 * @param {string} path - API路径
 * @returns {string} - 完整的请求URL
 */
function buildUrl(path) {
  // 确保path以/开头
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // 如果API_BASE_URL已经包含了path的开头部分，避免重复
  if (API_BASE_URL.endsWith('/') && path.startsWith('/')) {
    path = path.substring(1);
  }
  
  return `${API_BASE_URL}${path}`;
}

/**
 * 模拟数据生成函数
 * @param {string} path - 请求路径
 * @param {object} requestData - 请求数据
 * @returns {object|array} - 模拟响应数据
 */
function getMockData(path, requestData) {
  // 根据不同的API路径返回不同的模拟数据
  if (path.includes('/plan/input')) {
    // 旅游方案输入接口的模拟数据
    const days = requestData.days || 3;
    const itinerary = [];
    
    for (let day = 1; day <= days; day++) {
      itinerary.push({
        day: day,
        items: [
          {
            time: '08:00-12:00',
            attraction: day === 1 ? '故宫博物院' : day === 2 ? '长城' : day === 3 ? '颐和园' : `景点${day}`,
            transportation: '地铁+步行',
            meal: day === 1 ? '景区附近小吃' : day === 2 ? '农家院午餐' : day === 3 ? '园内餐厅' : `餐厅${day}`,
            budget: 180 + day * 20
          },
          {
            time: '13:30-17:30',
            attraction: day === 1 ? '天安门广场' : day === 2 ? '奥林匹克公园' : day === 3 ? '什刹海' : `景点${day}-2`,
            transportation: '公交',
            meal: day === 1 ? '王府井美食街' : day === 2 ? '簋街' : day === 3 ? '南锣鼓巷' : `餐厅${day}-2`,
            budget: 220 + day * 15
          },
          {
            time: '18:30-21:00',
            attraction: day === 1 ? '三里屯' : day === 2 ? '国贸CBD' : day === 3 ? '前门大街' : `景点${day}-3`,
            transportation: '出租车',
            meal: day === 1 ? '三里屯餐厅' : day === 2 ? 'CBD餐厅' : day === 3 ? '前门老字号' : `餐厅${day}-3`,
            budget: 160 + day * 10
          }
        ],
        dayTotal: 560 + day * 45
      });
    }
    
    return itinerary;
  }
  
  if (path.includes('/plan/adjust')) {
    // 调整方案接口的模拟数据（基于原因）
    const adjustReason = requestData.adjustReason;
    const days = requestData.days || 3;
    const itinerary = [];
    
    // 根据调整原因生成不同的方案
    for (let day = 1; day <= days; day++) {
      let morningBudget = 180 + day * 20;
      let afternoonBudget = 220 + day * 15;
      let eveningBudget = 160 + day * 10;
      
      // 根据调整原因调整预算
      if (adjustReason === '预算太高') {
        morningBudget *= 0.8;
        afternoonBudget *= 0.8;
        eveningBudget *= 0.8;
      } else if (adjustReason === '景点太少') {
        // 增加一个额外的景点（这里简化为增加预算）
        morningBudget += 50;
        afternoonBudget += 50;
      } else if (adjustReason === '行程太满') {
        // 减少一些活动（这里简化为减少预算）
        morningBudget *= 0.9;
        afternoonBudget *= 0.9;
      }
      
      itinerary.push({
        day: day,
        items: [
          {
            time: '08:00-12:00',
            attraction: day === 1 ? '故宫博物院' : day === 2 ? '长城' : day === 3 ? '颐和园' : `景点${day}`,
            transportation: '地铁+步行',
            meal: day === 1 ? '景区附近小吃' : day === 2 ? '农家院午餐' : day === 3 ? '园内餐厅' : `餐厅${day}`,
            budget: morningBudget
          },
          {
            time: '13:30-17:30',
            attraction: day === 1 ? '天安门广场' : day === 2 ? '奥林匹克公园' : day === 3 ? '什刹海' : `景点${day}-2`,
            transportation: '公交',
            meal: day === 1 ? '王府井美食街' : day === 2 ? '簋街' : day === 3 ? '南锣鼓巷' : `餐厅${day}-2`,
            budget: afternoonBudget
          },
          {
            time: '18:30-21:00',
            attraction: day === 1 ? '三里屯' : day === 2 ? '国贸CBD' : day === 3 ? '前门大街' : `景点${day}-3`,
            transportation: '出租车',
            meal: day === 1 ? '三里屯餐厅' : day === 2 ? 'CBD餐厅' : day === 3 ? '前门老字号' : `餐厅${day}-3`,
            budget: eveningBudget
          }
        ],
        dayTotal: morningBudget + afternoonBudget + eveningBudget
      });
    }
    
    return itinerary;
  }
  
  // 默认返回空数据
  return [];
}

/**
 * 统一的POST请求方法
 * @param {string} url - 请求地址
 * @param {object} data - 请求参数
 * @param {function} successCallback - 成功回调函数
 * @param {function} errorCallback - 失败回调函数
 */
export const postRequest = (url, data, successCallback, errorCallback) => {
  // 开发模式 - 使用模拟数据
  if (ENABLE_MOCK) {
    const fullUrl = buildUrl(url);
    console.log(`[MOCK模式] 模拟请求: ${fullUrl}`, data);
    
    // 模拟网络延迟
    setTimeout(() => {
      try {
        const mockData = getMockData(url, data);
        console.log(`[MOCK模式] 模拟响应: ${fullUrl}`, mockData);
        
        // 模拟后端返回的数据格式 {code: 200, msg: 'success', data: actualData}
        const responseData = {
          code: 200,
          msg: 'success',
          data: mockData
        };
        
        // 调用成功回调
        if (successCallback && typeof successCallback === 'function') {
          successCallback(responseData.data); // 只传递data部分
        }
      } catch (error) {
        console.error(`[MOCK模式] 模拟错误: ${fullUrl}`, error);
        
        // 显示错误通知
        ErrorNotification.show(error.message || '模拟请求失败');
        
        // 调用错误回调
        if (errorCallback && typeof errorCallback === 'function') {
          errorCallback(error);
        }
      }
    }, 300); // 模拟300ms的网络延迟
    
    return; // 跳过实际的网络请求
  }
  
  // 正常模式 - 发送实际的网络请求
  const fullUrl = buildUrl(url);
  
  // 打印详细的请求日志，包括路径构建过程和数据类型检查
  console.log(`[请求构建] 基础URL: ${API_BASE_URL}，原始路径: ${url}，构建后URL: ${fullUrl}`);
  console.log(`[请求接口] ${fullUrl}，参数：`, data);
  // 详细打印所有参数的类型和值，帮助调试400错误
  console.log('[参数类型和值详细检查]');
  if (data) {
    Object.keys(data).forEach(key => {
      console.log(`  ${key}: 类型=${typeof data[key]}, 值=`, data[key]);
    });
  } else {
    console.log('  警告: 请求数据为空');
  }
  
  try {
    fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => {
      // 打印响应状态
      console.log(`[响应接口] ${fullUrl}，状态码：${response.status}`);
      
      // 检查响应状态
      if (!response.ok) {
        // 尝试解析错误响应
        return response.json()
          .catch(() => ({
            msg: `请求失败: ${response.status} ${response.statusText}`,
            error: `请求失败: ${response.status} ${response.statusText}`
          }))
          .then(errorData => {
            // 打印完整的错误响应数据
            console.error(`[错误响应] 状态码: ${response.status}，错误数据:`, errorData);
            
            // 显示错误通知
            ErrorNotification.show(errorData.msg || errorData.error || `HTTP error! Status: ${response.status}`);
            
            // 抛出错误以便上层处理
            throw new Error(errorData.msg || errorData.error || `HTTP error! Status: ${response.status}`);
          });
      }
      
      // 解析响应数据
      return response.json();
    })
    .then(result => {
      // 打印响应数据
      console.log(`[响应接口] ${fullUrl}，结果：`, result);
      
      // 更灵活地处理不同格式的响应
      // 情况1: 有success字段且为true
      // 情况2: 有code字段且为200/0等成功码
      // 情况3: 直接返回数据（没有状态标识）
      if (result.success === true || result.code === 200 || result.code === 0 || !('success' in result) && !('code' in result)) {
        // 确定要传递的数据部分
        let dataToPass = result;
        // 如果有data字段，优先使用data字段
        if ('data' in result) {
          dataToPass = result.data;
        }
        
        // 成功回调
        if (successCallback && typeof successCallback === 'function') {
          successCallback(dataToPass);
        }
      } else {
        // 后端返回的错误
        const errorMsg = result.error || result.message || result.msg || '请求失败';
        console.error(`[接口错误] ${fullUrl}，错误信息：${errorMsg}`);
        
        // 显示错误通知
        ErrorNotification.show(errorMsg);
        
        // 失败回调
        if (errorCallback && typeof errorCallback === 'function') {
          errorCallback(new Error(errorMsg));
        }
      }
    })
    .catch(error => {
      // 网络或其他错误
      const errorMsg = error.message || '网络异常，请稍后重试';
      console.error(`[请求异常] ${fullUrl}，异常信息：${errorMsg}`);
      
      // 显示错误通知
      ErrorNotification.show(errorMsg);
      
      // 失败回调
      if (errorCallback && typeof errorCallback === 'function') {
        errorCallback(error);
      }
    });
  } catch (error) {
    // 捕获其他潜在错误
    const errorMsg = error.message || '请求处理异常';
    console.error(`[请求异常] ${fullUrl}，异常信息：${errorMsg}`);
    
    // 显示错误通知
    ErrorNotification.show(errorMsg);
    
    // 失败回调
    if (errorCallback && typeof errorCallback === 'function') {
      errorCallback(error);
    }
  }
};



/**
 * GET请求方法（可选，如需扩展）
 */
export const getRequest = async (url, successCallback, errorCallback) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  const fullUrl = `${baseUrl}${url}`;
  
  console.log(`[GET请求] ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.code === 200) {
      if (successCallback) {
        successCallback(result.data);
      }
    } else {
      const errorMsg = result.msg || '请求失败';
      ErrorNotification.show(errorMsg);
      if (errorCallback) {
        errorCallback(new Error(errorMsg));
      }
    }
  } catch (error) {
    const errorMsg = error.message || '网络异常，请稍后重试';
    ErrorNotification.show(errorMsg);
    if (errorCallback) {
      errorCallback(error);
    }
  }
};

export default {
  postRequest,
  getRequest
};

// 使用说明：
// 1. 在组件中导入：import { postRequest } from '../utils/api';
// 2. 调用示例：
//    postRequest(
//      '/plan/input',
//      { scenario: '大学生独自游', days: 3 },
//      (data) => {
//        console.log('成功数据：', data);
//        // 处理成功逻辑
//      },
//      (error) => {
//        console.error('失败：', error);
//        // 处理失败逻辑
//      }
//    );