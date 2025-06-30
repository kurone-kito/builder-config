import { vitestConfig } from '@kurone-kito/vite-lib-config';

export default vitestConfig(undefined, {
  entries: ['builder.mts', 'cache.mts'],
});
