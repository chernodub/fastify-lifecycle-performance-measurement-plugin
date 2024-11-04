import Fastify from 'fastify';
import {
  getLifecyclePerformanceMeasurements,
  lifecyclePerformanceMeasurementPlugin,
} from 'fastify-lifecycle-performance-measurement-plugin';

const app = Fastify({
  logger: true,
});

// Register plugins
await app.register(lifecyclePerformanceMeasurementPlugin);

// Add a route
app.get('/', async () => {
  return { hello: 'world' };
});

app.addHook('onResponse', (request, _, done) => {
  const performance = getLifecyclePerformanceMeasurements(request);
  request.log.info(performance, 'Request performance');

  done();
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3000 });
    app.log.info('Try sending a `curl http://localhost:3000/`');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
