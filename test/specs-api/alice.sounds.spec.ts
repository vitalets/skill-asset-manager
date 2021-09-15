import { AliceSoundsApi } from '../../src/alice/sounds';
import { AliceTarget } from '../../src/config';
import config from '../assets.config.test';

describe('alice sounds', () => {

  function createApi() {
    return new AliceSoundsApi(config.targets.alice as AliceTarget);
  }

  it('getItems', async () => {
    const api = createApi();
    const items = await api.getItems();
    assert.ok(items.length > 0);
    assert.deepEqual(Object.keys(items[0]), [
      'id',
      'skillId',
      'size',
      'originalName',
      'createdAt',
      'isProcessed',
      'error',
    ]);
  });

  it('upload + delete', async () => {
    const api = createApi();
    const item = await api.uploadItem('test/data/sound.mp3');
    assert.deepEqual(Object.keys(item), [
      'id',
      'skillId',
      'size',
      'originalName',
      'createdAt',
      'isProcessed',
      'error',
    ]);

    const itemInList = await api.getItem(item.id);
    assert.ok(itemInList, 'item exists in list after upload');

    await api.deleteItem(item.id);
  });

});
