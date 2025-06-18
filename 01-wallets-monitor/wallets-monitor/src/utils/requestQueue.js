class RequestQueue {
  constructor() {
    this.queue = new Map(); // 请求队列
    this.batchSize = 5; // 批量请求大小
    this.processingInterval = 1000; // 处理间隔（毫秒）
    this.cache = new Map(); // 请求缓存
    this.cacheTimeout = 30000; // 缓存过期时间（毫秒）

    // 启动队列处理器
    setInterval(() => this.processQueue(), this.processingInterval);
  }

  // 添加请求到队列
  async addRequest(key, requestFn) {
    // 检查缓存
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(key);
    }

    // 如果相同的请求已经在队列中，返回现有的 Promise
    if (this.queue.has(key)) {
      return this.queue.get(key).promise;
    }

    // 创建新的 Promise 并添加到队列
    const requestPromise = new Promise((resolve, reject) => {
      this.queue.set(key, {
        requestFn,
        resolve,
        reject,
        timestamp: Date.now(),
        promise: null,
      });
    });

    // 保存 Promise 引用
    this.queue.get(key).promise = requestPromise;
    return requestPromise;
  }

  // 处理队列中的请求
  async processQueue() {
    if (this.queue.size === 0) return;

    // 获取队列中的请求（最多 batchSize 个）
    const batch = Array.from(this.queue.entries()).slice(0, this.batchSize);

    // 执行批量请求
    for (const [key, request] of batch) {
      try {
        const result = await request.requestFn();

        // 更新缓存
        this.cache.set(key, {
          data: result,
          timestamp: Date.now(),
        });

        request.resolve(result);
      } catch (error) {
        request.reject(error);
      } finally {
        this.queue.delete(key);
      }
    }
  }

  // 清理过期缓存
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }
}

// 创建单例实例
export const requestQueue = new RequestQueue();
