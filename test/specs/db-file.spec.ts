import fs from 'fs';
import { DbFile } from '../../src/db-file';
import { AssetType } from '../../src/types';

describe('db file', () => {

  const DB_FILE = 'temp/test-db-file.json';

  beforeEach(async () => {
    if (fs.existsSync(DB_FILE)) {
      await fs.promises.rm(DB_FILE);
    }
  });

  it('load, upsert, save', async () => {
    const dbFile = new DbFile({ dbFile: DB_FILE, assetType: AssetType.images });
    await dbFile.load();
    const localAsset = { fileId: 'foo', file: 'foo.png', mtimeMs: 0 };
    const remoteAsset = { id: 'bar', payload: 'payload' };
    dbFile.upsertItem(localAsset, remoteAsset);
    await dbFile.save();
    assert.deepEqual(dbFile.data, {
      images: {
        foo: 'payload'
      },
      imagesMeta: {
        foo: {
          file: 'foo.png',
          fileId: 'foo',
          mtimeMs: 0,
          remoteId: 'bar'
        }
      },
      sounds: {},
      soundsMeta: {}
    });
  });

});
