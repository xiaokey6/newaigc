import React from 'react';

// 简单的错误通知类实现
class ErrorNotificationManager {
  constructor() {
    this.notificationElement = null;
    this._init();
  }

  _init() {
    // 延迟初始化，确保DOM已加载
    if (typeof window !== 'undefined') {
      this.notificationElement = document.createElement('div');
      this.notificationElement.className = 'fixed top-4 right-4 z-50';
      document.body.appendChild(this.notificationElement);
    }
  }

  show(message, type = 'error') {
    if (!this.notificationElement) {
      this._init();
      if (!this.notificationElement) return;
    }

    const notification = document.createElement('div');
    notification.className = `px-6 py-3 mb-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform translate-x-full`;
    
    // 设置样式基于通知类型
    if (type === 'error') {
      notification.classList.add('bg-red-500', 'text-white');
    } else if (type === 'success') {
      notification.classList.add('bg-green-500', 'text-white');
    } else if (type === 'warning') {
      notification.classList.add('bg-yellow-500', 'text-white');
    }
    
    notification.textContent = message;
    this.notificationElement.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 10);
    
    // 3秒后隐藏通知
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      // 完全移除元素
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  error(message) {
    this.show(message, 'error');
  }

  success(message) {
    this.show(message, 'success');
  }

  warning(message) {
    this.show(message, 'warning');
  }
}

// 直接导出单例实例
export default new ErrorNotificationManager();