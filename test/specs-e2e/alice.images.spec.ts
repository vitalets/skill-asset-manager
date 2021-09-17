import { AliceImagesApi } from '../../src/api/alice/images';
import { AliceTarget } from '../../src/config';
import config from '../assets.config.test';

describe('alice images', () => {

  function createApi() {
    return new AliceImagesApi(config.targets[0] as AliceTarget);
  }

  it('getItems', async () => {
    const api = createApi();
    const items = await api.getItems();
    assert.ok(items.length > 0);
    assert.deepEqual(Object.keys(items[0]), [
      'id', 'origUrl', 'size', 'createdAt'
    ]);
  });

  it('upload + delete', async () => {
    const api = createApi();
    const item = await api.uploadItem('test/data/image.png');
    assert.deepEqual(Object.keys(item), [ 'id', 'size', 'createdAt' ]);

    const itemInList = await api.getItem(item.id);
    assert.ok(itemInList, 'item exists in list after upload');

    await api.deleteItem(item.id);
  });

});
