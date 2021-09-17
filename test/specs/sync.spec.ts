import { AssetType, Platform } from '../../src/types';
import { Sync } from '../../src/commands/sync';
import { DbFile } from '../../src/db-file';
import { LocalAssets } from '../../src/local-assets';
import { RemoteAssets } from '../../src/remote-assets';
import { Target } from '../../src/config';

describe('sync', () => {

  const target: Target = {
    platform: Platform.marusya,
    name: 'test',
    dbFile: 'file',
    token: 'token',
    soundsOwnerId: 1
  };

  async function createObjects() {
    const dbFile = new DbFile({ dbFile: '', assetType: AssetType.images });
    const localAssets = new LocalAssets(target, { pattern: '' });
    const remoteAssets = new RemoteAssets(target, AssetType.images);
    const command = new Sync(dbFile, localAssets, remoteAssets);
    sinon.stub(dbFile, 'load');
    const dbFileSave = sinon.stub(dbFile, 'save');
    sinon.stub(localAssets, 'load');
    sinon.stub(remoteAssets, 'load');
    // @ts-expect-error confirm is private
    sinon.stub(command, 'confirm').callsFake( async () => true);
    return { command, dbFile, localAssets, remoteAssets, dbFileSave };
  }

  it('new file', async () => {
    const { command, dbFile, localAssets, remoteAssets, dbFileSave } = await createObjects();
    localAssets.items.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0 };
    sinon.stub(remoteAssets, 'uploadItem').callsFake(async () => ({ id: 'bar', payload: 'payload' }));

    await command.run();

    sinon.assert.calledOnce(dbFileSave);
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

  it('changed file', async () => {
    const { command, dbFile, localAssets, remoteAssets, dbFileSave } = await createObjects();

    localAssets.items.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 1 };
    dbFile.data.images.foo = 'old payload';
    dbFile.data.imagesMeta.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0, remoteId: 'old remote id' };
    sinon.stub(remoteAssets, 'uploadItem').callsFake(async () => ({ id: 'new remote id', payload: 'new payload' }));

    await command.run();

    sinon.assert.calledOnce(dbFileSave);
    assert.deepEqual(dbFile.data, {
      images: {
        foo: 'new payload'
      },
      imagesMeta: {
        foo: {
          file: 'foo.png',
          fileId: 'foo',
          mtimeMs: 1,
          remoteId: 'new remote id'
        }
      },
      sounds: {},
      soundsMeta: {}
    });
  });

  it('not changed, but missing on remote file', async () => {
    const { command, dbFile, localAssets, remoteAssets, dbFileSave } = await createObjects();

    localAssets.items.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0 };
    dbFile.data.images.foo = 'old payload';
    dbFile.data.imagesMeta.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0, remoteId: 'old remote id' };
    sinon.stub(remoteAssets, 'uploadItem').callsFake(async () => ({ id: 'new remote id', payload: 'new payload' }));

    await command.run();

    sinon.assert.calledOnce(dbFileSave);
    assert.deepEqual(dbFile.data, {
      images: {
        foo: 'new payload'
      },
      imagesMeta: {
        foo: {
          file: 'foo.png',
          fileId: 'foo',
          mtimeMs: 0,
          remoteId: 'new remote id'
        }
      },
      sounds: {},
      soundsMeta: {}
    });
  });

  it('synced file', async () => {
    const { command, dbFile, localAssets, remoteAssets, dbFileSave } = await createObjects();

    localAssets.items.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0 };
    dbFile.data.images.foo = 'payload';
    dbFile.data.imagesMeta.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0, remoteId: 'remoteId' };
    remoteAssets.items = [{ id: 'remoteId', payload: 'payload' }];

    const uploadItem = sinon.stub(remoteAssets, 'uploadItem');

    await command.run();

    sinon.assert.notCalled(uploadItem);
    sinon.assert.notCalled(dbFileSave);
    assert.deepEqual(dbFile.data, {
      images: {
        foo: 'payload'
      },
      imagesMeta: {
        foo: {
          file: 'foo.png',
          fileId: 'foo',
          mtimeMs: 0,
          remoteId: 'remoteId'
        }
      },
      sounds: {},
      soundsMeta: {}
    });
  });

});
