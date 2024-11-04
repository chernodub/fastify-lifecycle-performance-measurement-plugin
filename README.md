# `fastify-lifecycle-performance-measurement-plugin`

A Fastify plugin that measures and exposes detailed request lifecycle performance metrics.

## Installation

```bash
npm install fastify-lifecycle-performance-measurement-plugin
```

## Usage

```typescript
import {
  lifecyclePerformanceMeasurementPlugin,
  getLifecyclePerformanceMeasurements,
} from 'fastify-lifecycle-performance-measurement-plugin';
import Fastify from 'fastify';

const app = Fastify();

app.register(lifecyclePerformanceMeasurementPlugin);
```

## Example

See the [example app](./examples/simple-app/src/index.ts) for a complete example.

## API

### `lifecyclePerformanceMeasurementPlugin`

A Fastify plugin that adds performance measurement capabilities to your application.

### `getLifecyclePerformanceMeasurements(request)`

Returns an object containing the following performance measurements (in milliseconds):

- `parsingTimeMs` - Time spent parsing the request
- `validationTimeMs` - Time spent validating the request
- `handlerTimeMs` - Time spent in the route handler
- `serializationTimeMs` - Time spent serializing the response
- `totalTimeMs` - Total request processing time
