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
    token: 'token',
    soundsOwnerId: 1
  };

  async function createObjects() {
    const dbFile = new DbFile({ dbFilePath: 'file', assetType: AssetType.images });
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
    localAssets.items.foo = { fileId: 'foo', file: 'foo.png', hash: 'hash1' };
    sinon.stub(remoteAssets, 'uploadItem').callsFake(async () => ({ id: 'bar', payload: 'payload' }));

    await command.run();

    sinon.assert.calledOnce(dbFileSave);
    assert.deepEqual(dbFile.data, {
      payload: {
        foo: 'payload'
      },
      files: {
        foo: {
          file: 'foo.png',
          hash: 'hash1',
        }
      },
      remoteIds: {
        hash1: 'bar'
      },
    });
  });

  it('changed file', async () => {
    const { command, dbFile, localAssets, remoteAssets, dbFileSave } = await createObjects();

    localAssets.items.foo = { fileId: 'foo', file: 'foo.png', hash: 'hash2' };
    dbFile.data.payload.foo = 'payload1';
    dbFile.data.files.foo = { file: 'foo.png', hash: 'hash1' };
    dbFile.data.remoteIds.hash1 = 'remoteid1';
    remoteAssets.items = [{ id: 'remoteid1', payload: 'payload1' }];

    sinon.stub(remoteAssets, 'uploadItem').callsFake(async () => ({ id: 'remoteid2', payload: 'payload2' }));

    await command.run();

    sinon.assert.calledOnce(dbFileSave);
    assert.deepEqual(dbFile.data, {
      payload: {
        foo: 'payload2'
      },
      files: {
        foo: {
          file: 'foo.png',
          hash: 'hash2',
        }
      },
      remoteIds: {
        hash1: 'remoteid1',
        hash2: 'remoteid2',
      },
    });
  });

  it('not changed, but not uploaded file', async () => {
    const { command, dbFile, localAssets, remoteAssets, dbFileSave } = await createObjects();

    localAssets.items.foo = { fileId: 'foo', file: 'foo.png', hash: 'hash1' };
    dbFile.data.payload.foo = 'payload1';
    dbFile.data.files.foo = { file: 'foo.png', hash: 'hash1' };
    remoteAssets.items = [];
    sinon.stub(remoteAssets, 'uploadItem').callsFake(async () => ({ id: 'remoteid2', payload: 'payload2' }));

    await command.run();

    sinon.assert.calledOnce(dbFileSave);
    assert.deepEqual(dbFile.data, {
      payload: {
        foo: 'payload2'
      },
      files: {
        foo: {
          file: 'foo.png',
          hash: 'hash1',
        }
      },
      remoteIds: {
        hash1: 'remoteid2',
      },
    });
  });

  it('synced file', async () => {
    const { command, dbFile, localAssets, remoteAssets, dbFileSave } = await createObjects();

    localAssets.items.foo = { fileId: 'foo', file: 'foo.png', hash: 'hash1' };
    dbFile.data.payload.foo = 'payload1';
    dbFile.data.files.foo = { file: 'foo.png', hash: 'hash1' };
    dbFile.data.remoteIds.hash1 = 'remoteid1';
    remoteAssets.items = [{ id: 'remoteid1', payload: 'payload1' }];

    const uploadItem = sinon.stub(remoteAssets, 'uploadItem');

    await command.run();

    sinon.assert.notCalled(uploadItem);
    sinon.assert.notCalled(dbFileSave);
    assert.deepEqual(dbFile.data, {
      payload: {
        foo: 'payload1'
      },
      files: {
        foo: {
          file: 'foo.png',
          hash: 'hash1',
        }
      },
      remoteIds: {
        hash1: 'remoteid1',
      },
    });
  });

});
