import { MarusyaSoundsApi } from '../../src/api/marusya/sounds';
import { MarusyaTarget } from '../../src/config';
import config from '../assets.config.test';

describe('marusya sounds', () => {

  function createApi() {
    return new MarusyaSoundsApi(config.targets.marusya as MarusyaTarget);
  }

  it('getItems', async () => {
    const api = createApi();
    const items = await api.getItems();
    assert.ok(items.length > 0);
    assert.deepEqual(Object.keys(items[0]), [ 'id', 'title', 'owner_id' ]);
  });

  it('upload + delete', async () => {
    const api = createApi();
    const item = await api.uploadItem('test/data/sound.mp3');
    assert.deepEqual(Object.keys(item), [ 'id', 'title', 'owner_id' ]);

    const itemInList = await api.getItem(item.id);
    assert.ok(itemInList, 'item exists in list after upload');

    await api.deleteItem(item.id);
  });

});
