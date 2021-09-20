import { AssetType, Platform } from '../../src/types';
import { Sync } from '../../src/commands/sync';
import { DbFile } from '../../src/db-file';
import { LocalAssets } from '../../src/local-assets';
import { RemoteAssets } from '../../src/remote-assets';
import { Target } from '../../src/config';

describe('verify', () => {

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
    const command = new Sync(dbFile, localAssets, remoteAssets, { verify: true });
    sinon.stub(dbFile, 'load');
    const dbFileSave = sinon.stub(dbFile, 'save');
    sinon.stub(localAssets, 'load');
    sinon.stub(remoteAssets, 'load');
    // @ts-expect-error confirm is private
    sinon.stub(command, 'confirm').callsFake( async () => true);
    return { command, dbFile, localAssets, remoteAssets, dbFileSave };
  }

  it('all files synced', async () => {
    const { command, dbFile, localAssets, remoteAssets, dbFileSave } = await createObjects();

    localAssets.items = { foo: {fileId: 'foo', file: 'foo.png', hash: 'hash1' }};
    dbFile.data.payload = { foo: 'payload1' };
    dbFile.data.files.foo = { file: 'foo.png', hash: 'hash1' };
    dbFile.data.remoteIds = { hash1: 'remoteid1' };
    remoteAssets.items = [{ id: 'remoteid1', payload: 'payload1' }];

    const uploadItem = sinon.stub(remoteAssets, 'uploadItem');

    await command.run();

    sinon.assert.notCalled(uploadItem);
    sinon.assert.notCalled(dbFileSave);
  });

});
