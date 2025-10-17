import { NextResponse } from 'next/server';
import { getCircuitBreakerStats } from '@/utils/circuitBreaker';

export async function GET() {
  try {
    const stats = getCircuitBreakerStats();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      stats: stats,
      health: {
        circuitBreakerState: stats.circuitBreaker.state,
        failureRate: stats.circuitBreaker.failureCount / Math.max(stats.circuitBreaker.requestCount, 1),
        queueLength: stats.rateLimiter.queueLength,
        recentRequestsCount: stats.rateLimiter.recentRequests
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}