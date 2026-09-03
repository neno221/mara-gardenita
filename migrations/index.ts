import * as migration_20260903_140934_initial from './20260903_140934_initial';
import * as migration_20260903_224515_collections from './20260903_224515_collections';

export const migrations = [
  {
    up: migration_20260903_140934_initial.up,
    down: migration_20260903_140934_initial.down,
    name: '20260903_140934_initial',
  },
  {
    up: migration_20260903_224515_collections.up,
    down: migration_20260903_224515_collections.down,
    name: '20260903_224515_collections'
  },
];
