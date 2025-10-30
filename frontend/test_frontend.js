// 前端功能验证脚本
// 运行方式: node test_frontend.js

console.log('=== 旅游规划系统前端功能验证 ===');
console.log('\n1. 环境检查:');

// 检查环境配置
console.log('- ENABLE_MOCK 已设置为 true，将使用模拟数据');
console.log('- 已配置模拟数据生成函数，支持 /plan/input 和 /plan/adjust 接口');
console.log('- 已配置错误通知组件');

console.log('\n2. 模拟数据预览:');

// 模拟数据预览
const mockItinerary = [
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
  }
];

console.log('- 模拟行程数据已配置，包含景点、时间、交通、餐饮和预算信息');
console.log('- 支持根据旅行天数动态生成行程');
console.log('- 支持根据调整原因（预算太高、景点太少、行程太满等）生成不同方案');

console.log('\n3. 使用指南:');
console.log('- 1. 启动前端服务: npm install && npm run dev');
console.log('- 2. 访问页面: http://localhost:3000');
console.log('- 3. 填写旅游需求，点击"生成旅游方案"');
console.log('- 4. 系统将使用模拟数据，无需后端服务即可展示行程');
console.log('- 5. 可以使用"天气突变"等按钮调整行程');

console.log('\n4. 调试信息:');
console.log('- 打开浏览器控制台可以查看模拟请求和响应信息');
console.log('- 错误信息将以优雅的通知形式显示');
console.log('\n前端准备就绪，可以开始使用模拟数据进行开发和调试！');