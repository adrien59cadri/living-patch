/**
 * Rate limiter utility for respectful web scraping
 * 
 * Provides delay functionality to space out requests
 */

/**
 * Adds a delay between requests
 * @param ms Milliseconds to wait
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a rate limiter with configurable delays
 */
export class RateLimiter {
  private readonly delayMs: number;

  constructor(delayMs: number = 1000) {
    this.delayMs = delayMs;
  }

  /**
   * Wait before making the next request
   */
  async waitForNextRequest(): Promise<void> {
    await delay(this.delayMs);
  }

  /**
   * Execute a function with rate limiting
   * @param fn Function to execute
   * @returns Result of the function
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const result = await fn();
    await this.waitForNextRequest();
    return result;
  }
}
