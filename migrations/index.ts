import * as migration_20260903_140934_initial from './20260903_140934_initial';
import * as migration_20260903_224515_collections from './20260903_224515_collections';
import * as migration_20260904_002149_pages_blocks_globals from './20260904_002149_pages_blocks_globals';
import * as migration_20260904_133352_seo_access_preview from './20260904_133352_seo_access_preview';
import * as migration_20261025_152204_remove_journal_header_button from './20261025_152204_remove_journal_header_button';
import * as migration_20261025_171827_localization from './20261025_171827_localization';

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
    name: '20260904_002149_pages_blocks_globals',
  },
  {
    up: migration_20260904_133352_seo_access_preview.up,
    down: migration_20260904_133352_seo_access_preview.down,
    name: '20260904_133352_seo_access_preview',
  },
  {
    up: migration_20261025_152204_remove_journal_header_button.up,
    down: migration_20261025_152204_remove_journal_header_button.down,
    name: '20261025_152204_remove_journal_header_button',
  },
  {
    up: migration_20261025_171827_localization.up,
    down: migration_20261025_171827_localization.down,
    name: '20261025_171827_localization'
  },
];
