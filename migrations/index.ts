import * as migration_20260903_140934_initial from './20260903_140934_initial';

export const migrations = [
  {
    up: migration_20260903_140934_initial.up,
    down: migration_20260903_140934_initial.down,
    name: '20260903_140934_initial'
  },
];
