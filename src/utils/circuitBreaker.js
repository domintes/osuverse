// Circuit Breaker pattern implementation to prevent API abuse
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000, monitor = 1000) {
    this.threshold = threshold; // Number of failures before opening circuit
    this.timeout = timeout; // Time before trying again when circuit is open
    this.monitor = monitor; // Time between monitoring checks
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.requestCount = 0;
    this.nextAttempt = Date.now();
    this.successCount = 0;
  }

  async call(fn) {
    this.requestCount++;
    
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker is OPEN. Too many failed requests (${this.failureCount}/${this.threshold}). Try again later.`);
      } else {
        this.state = 'HALF_OPEN';
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.successCount++;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      requestCount: this.requestCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.requestCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }
}

// Rate limiter with queue
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
    this.queue = [];
    this.processing = false;
  }

  async execute(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;

    while (this.queue.length > 0) {
      // Clean old requests
      const now = Date.now();
      this.requests = this.requests.filter(time => now - time < this.timeWindow);

      // Check if we can make a request
      if (this.requests.length >= this.maxRequests) {
        const oldestRequest = Math.min(...this.requests);
        const waitTime = this.timeWindow - (now - oldestRequest);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Execute next request
      const { fn, resolve, reject } = this.queue.shift();
      this.requests.push(now);

      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.processing = false;
  }
}

// Global instances
export const osuApiCircuitBreaker = new CircuitBreaker(10, 300000, 5000); // 10 failures, 5min timeout
export const osuApiRateLimiter = new RateLimiter(30, 60000); // 30 requests per minute

// Safe API call wrapper
export async function safeOsuApiCall(apiFunction, errorMessage = 'API call failed') {
  try {
    return await osuApiCircuitBreaker.call(async () => {
      return await osuApiRateLimiter.execute(apiFunction);
    });
  } catch (error) {
    console.error(`${errorMessage}:`, error.message);
    
    // Check if it's a rate limit error
    if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }
    
    // Check if circuit breaker is open
    if (error.message.includes('Circuit breaker is OPEN')) {
      throw new Error('Too many failed API requests. Service temporarily unavailable.');
    }
    
    throw error;
  }
}

// Get circuit breaker stats for monitoring
export function getCircuitBreakerStats() {
  return {
    circuitBreaker: osuApiCircuitBreaker.getStats(),
    rateLimiter: {
      queueLength: osuApiRateLimiter.queue.length,
      recentRequests: osuApiRateLimiter.requests.length,
      maxRequests: osuApiRateLimiter.maxRequests
    }
  };
}