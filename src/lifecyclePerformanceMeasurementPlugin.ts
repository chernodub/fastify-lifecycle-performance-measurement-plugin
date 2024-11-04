import type { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import { fastifyPlugin } from 'fastify-plugin';
import { LifecyclePerformanceMeasurements } from './types/LifecyclePerformanceMeasurements';
import { Mutable } from './types/Mutable';

// Fastify lifecycle hooks in order of execution
// https://fastify.dev/docs/v5.0.x/Reference/Lifecycle/#lifecycle
const MARKS = [
  'onRequest',
  'preParsing',
  'preValidation',
  'preHandler',
  'preSerialization',
  'onSend',
  'onResponse',
] satisfies Parameters<FastifyInstance['addHook']>[0][];

type FastifyEventMark = (typeof MARKS)[number];
type FastifyTimingMarks = Partial<Record<FastifyEventMark, number>>;

const FASTIFY_REQUEST_TIMING_MARKS_KEY = Symbol('timingMarks');
export const FASTIFY_REQUEST_PERFORMANCE_KEY = Symbol('performance');

declare module 'fastify' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- To leverage merge declaration
  interface FastifyRequest {
    [FASTIFY_REQUEST_TIMING_MARKS_KEY]?: FastifyTimingMarks;
    [FASTIFY_REQUEST_PERFORMANCE_KEY]?: LifecyclePerformanceMeasurements;
  }
}

function addTimingMark(request: FastifyRequest, mark: FastifyEventMark) {
  if (request[FASTIFY_REQUEST_TIMING_MARKS_KEY] == null) {
    request[FASTIFY_REQUEST_TIMING_MARKS_KEY] = {};
  }
  request[FASTIFY_REQUEST_TIMING_MARKS_KEY][mark] = performance.now();
}

function calculateTimeDifference(
  timingMarks: FastifyTimingMarks,
  startMark: FastifyEventMark,
  endMark: FastifyEventMark,
): number | undefined {
  if (timingMarks[startMark] && timingMarks[endMark]) {
    return timingMarks[endMark] - timingMarks[startMark];
  }
  return undefined;
}

function calculateTiming<
  TRequest extends FastifyRequest<any, any, any, any, any, any>,
  TReply extends FastifyReply<any, any, any, any, any>,
>(request: TRequest, reply: TReply): LifecyclePerformanceMeasurements {
  if (reply.elapsedTime === 0) {
    throw new Error('Timing should only be calculated when response is sent');
  }

  const timingMarks = request[FASTIFY_REQUEST_TIMING_MARKS_KEY] ?? {};
  const requestPerformance: Mutable<LifecyclePerformanceMeasurements> = {
    parsingTimeMs: calculateTimeDifference(timingMarks, 'preParsing', 'preValidation'),
    validationTimeMs: calculateTimeDifference(timingMarks, 'preValidation', 'preHandler'),
    handlerTimeMs: calculateTimeDifference(timingMarks, 'preHandler', 'preSerialization'),
    serializationTimeMs: calculateTimeDifference(timingMarks, 'preSerialization', 'onSend'),
    totalTimeMs: reply.elapsedTime,
  };

  return requestPerformance;
}

const lifecyclePerformanceMeasurementPluginImpl: FastifyPluginCallback = (app, _opts, done) => {
  app.decorateRequest(FASTIFY_REQUEST_TIMING_MARKS_KEY);
  app.decorateRequest(FASTIFY_REQUEST_PERFORMANCE_KEY);

  // Add timing hooks for each lifecycle mark
  MARKS.forEach((mark) => {
    app.addHook(mark, (request: FastifyRequest) => {
      addTimingMark(request, mark);

      // Using async hook because it's not trivial to receive a done callback
      return Promise.resolve();
    });
  });

  // Calculate final timing metrics on response
  app.addHook('onResponse', async (request, reply) => {
    request[FASTIFY_REQUEST_PERFORMANCE_KEY] = calculateTiming(request, reply);
  });

  done();
};

/**
 * A Fastify plugin that measures and exposes detailed request lifecycle performance metrics.
 */
export const lifecyclePerformanceMeasurementPlugin = fastifyPlugin(lifecyclePerformanceMeasurementPluginImpl);
