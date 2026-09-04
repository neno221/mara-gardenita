import * as migration_20260903_140934_initial from './20260903_140934_initial';
import * as migration_20260903_224515_collections from './20260903_224515_collections';
import * as migration_20260904_002149_pages_blocks_globals from './20260904_002149_pages_blocks_globals';

export const migrations = [
  {
    up: migration_20260903_140934_initial.up,
    down: migration_20260903_140934_initial.down,
    name: '20260903_140934_initial',
  },
  {
    up: migration_20260903_224515_collections.up,
    down: migration_20260903_224515_collections.down,
    name: '20260903_224515_collections',
  },
  {
    up: migration_20260904_002149_pages_blocks_globals.up,
    down: migration_20260904_002149_pages_blocks_globals.down,
    name: '20260904_002149_pages_blocks_globals'
  },
];
