/**
 * A set of performance measurements for the request lifecycle.
 */
export type LifecyclePerformanceMeasurements = {
  readonly parsingTimeMs?: number;
  readonly validationTimeMs?: number;
  readonly handlerTimeMs?: number;
  readonly serializationTimeMs?: number;
  readonly totalTimeMs?: number;
};
