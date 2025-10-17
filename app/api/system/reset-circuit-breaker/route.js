import { NextResponse } from 'next/server';
import { osuApiCircuitBreaker } from '@/utils/circuitBreaker';

export async function POST() {
  try {
    // Reset circuit breaker
    osuApiCircuitBreaker.reset();
    
    return NextResponse.json({
      status: 'success',
      message: 'Circuit breaker has been reset',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}