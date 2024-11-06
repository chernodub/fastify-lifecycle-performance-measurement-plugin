import Fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';
import { getLifecyclePerformanceMeasurements } from './getLifecyclePerformanceMeasurements';
import { lifecyclePerformanceMeasurementPlugin } from './lifecyclePerformanceMeasurementPlugin';

describe('lifecyclePerformanceMeasurementPlugin', () => {
  let app: FastifyInstance;
  let capturedRequest: FastifyRequest;
  const TIMEOUT_MS = 50;

  beforeEach(async () => {
    app = Fastify();
    await app.register(lifecyclePerformanceMeasurementPlugin);

    app.get('/', async (request) => {
      capturedRequest = request;
      // Simulate some work
      await new Promise((resolve) => setTimeout(resolve, TIMEOUT_MS));
      return { hello: 'world' };
    });
  });

  it('should not break request handling', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('{"hello":"world"}');
  });

  it('should decorate request with performance data', async () => {
    await app.inject({
      method: 'GET',
      url: '/',
    });

    const performance = getLifecyclePerformanceMeasurements(capturedRequest);

    expect(performance).toBeDefined();
    expect(performance!.totalTimeMs).toBeTypeOf('number');
    expect(performance!.parsingTimeMs).toBeTypeOf('number');
    expect(performance!.validationTimeMs).toBeTypeOf('number');
    expect(performance!.handlerTimeMs).toBeTypeOf('number');
    expect(performance!.serializationTimeMs).toBeTypeOf('number');
  });

  it('should measure timing accurately', async () => {
    await app.inject({
      method: 'GET',
      url: '/',
    });

    const performance = getLifecyclePerformanceMeasurements(capturedRequest);

    if (performance == null) {
      throw new Error('Performance data not collected');
    }

    // https://github.com/chernodub/fastify-lifecycle-performance-measurement-plugin/actions/runs/11698564225/job/32579096696
    const errorPercent = 0.01;
    const expectedTimeMs = TIMEOUT_MS - TIMEOUT_MS * errorPercent;

    expect(performance.totalTimeMs).toBeGreaterThan(expectedTimeMs);
    expect(performance.handlerTimeMs).toBeGreaterThan(expectedTimeMs);

    // Verify timing segments add up approximately to total
    const segmentSum =
      (performance.parsingTimeMs ?? 0) +
      (performance.validationTimeMs ?? 0) +
      (performance.handlerTimeMs ?? 0) +
      (performance.serializationTimeMs ?? 0);

    // Allow for small timing variations
    expect(Math.abs(segmentSum - performance.totalTimeMs!)).toBeLessThan(5);
  });
});
