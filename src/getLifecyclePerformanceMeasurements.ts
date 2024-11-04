import type { FastifyRequest } from 'fastify';
import { FASTIFY_REQUEST_PERFORMANCE_KEY } from './lifecyclePerformanceMeasurementPlugin';
import { LifecyclePerformanceMeasurements } from './types/LifecyclePerformanceMeasurements';

/**
 * Get the lifecycle performance measurements from a request.
 *
 * @param request The Fastify request object.
 * @returns The lifecycle performance measurements or undefined if they are not available.
 */
export function getLifecyclePerformanceMeasurements(
  request: FastifyRequest,
): LifecyclePerformanceMeasurements | undefined {
  return request[FASTIFY_REQUEST_PERFORMANCE_KEY];
}
