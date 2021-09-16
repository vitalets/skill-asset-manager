import { AssetType, Platform } from '../../src/types';
import { Clean } from '../../src/commands/clean';
import { DbFile } from '../../src/db-file';
import { RemoteAssets } from '../../src/remote-assets';

describe('clean', () => {

  async function createObjects() {
    const dbFile = new DbFile({ dbFile: '', assetType: AssetType.images });
    const remoteAssets = new RemoteAssets({
      target: { platform: Platform.marusya, dbFile: '', token: '', ownerId: 1 },
      assetType: AssetType.images
    });
    const command = new Clean(dbFile, remoteAssets);
    sinon.stub(dbFile, 'load');
    const dbFileSave = sinon.stub(dbFile, 'save');
    sinon.stub(remoteAssets, 'load');
    // @ts-expect-error confirm is private
    sinon.stub(command, 'confirm').callsFake( async () => true);
    return { command, dbFile, remoteAssets, dbFileSave };
  }

  it('has unused files', async () => {
    const { command, remoteAssets, dbFileSave } = await createObjects();

    remoteAssets.items = [{ id: 'remoteId', payload: 'payload' }];
    const deleteItem = sinon.stub(remoteAssets, 'deleteItem');

    await command.run();

    sinon.assert.notCalled(dbFileSave);
    assert.deepEqual(deleteItem.firstCall.firstArg, { id: 'remoteId', payload: 'payload' });
  });

  it('no unused files', async () => {
    const { command, dbFile, remoteAssets, dbFileSave } = await createObjects();

    dbFile.data.images.foo = 'payload';
    dbFile.data.imagesMeta.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0, remoteId: 'remoteId' };
    remoteAssets.items = [{ id: 'remoteId', payload: 'payload' }];

    const deleteItem = sinon.stub(remoteAssets, 'deleteItem');

    await command.run();

    sinon.assert.notCalled(dbFileSave);
    sinon.assert.notCalled(deleteItem);
  });

});
