import { MarusyaImagesApi } from '../../src/marusya/images';
import { MarusyaTarget } from '../../src/config';
import config from '../assets.config.test';

describe('marusya images', () => {

  function createApi() {
    return new MarusyaImagesApi(config.targets.marusya as MarusyaTarget);
  }

  it('getItems', async () => {
    const api = createApi();
    const items = await api.getItems();
    assert.ok(items.length > 0);
    assert.deepEqual(Object.keys(items[0]), [ 'id', 'owner_id' ]);
  });

  it('upload + delete', async () => {
    const api = createApi();
    const item = await api.uploadItem('test/data/image_1200x600.png');
    assert.deepEqual(Object.keys(item), [ 'app_id', 'photo_id' ]);

    const itemInList = await api.getItem(item.photo_id);
    assert.ok(itemInList, 'item exists in list after upload');

    await api.deleteItem(item.photo_id);
  });

});