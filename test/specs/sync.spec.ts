// todo: write sync tests!

// import { AliceTarget } from '../../src/config';
// import { DbFile } from '../../src/db-file';
// import { LocalAssets } from '../../src/local-assets';
// import { RemoteAssets } from '../../src/remote-assets';
// import { AssetType } from '../../src/types';
// import config from '../assets.config.test';

// describe('sync', () => {

//   const dbFile = new DbFile({ dbFile: '', assetType: AssetType.images });
//   const localAssets = new LocalAssets({ pattern: '' });
//   const remoteAssets = new RemoteAssets({ target: config.targets.alice as AliceTarget, assetType: AssetType.images });

//   beforeEach(() => {
//     localAssets.items = {};
//     dbFile.data.imagesMeta = {};
//     remoteAssets.items = [];
//   });

//   it('new file', () => {
//     localAssets.items.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0 };
//     syncingAssets.compare();
//     assert.deepEqual(syncingAssets.items, [ {
//       fileId: 'foo',
//       localState: 'NEW',
//     }]);
//   });

//   it('changed file', () => {
//     localAssets.items.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 1 };
//     dbFile.data.imagesMeta.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0, remoteId: 'bar' };
//     syncingAssets.compare();
//     assert.deepEqual(syncingAssets.items, [{
//       fileId: 'foo',
//       remoteId: 'bar',
//       localState: 'CHANGED',
//       remoteState: 'NOT_UPLOADED',
//     }]);
//   });

//   it('not changed file', () => {
//     localAssets.items.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0 };
//     dbFile.data.imagesMeta.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0, remoteId: 'bar' };
//     syncingAssets.compare();
//     assert.deepEqual(syncingAssets.items, [{
//       fileId: 'foo',
//       remoteId: 'bar',
//       localState: 'NOT_CHANGED',
//       remoteState: 'NOT_UPLOADED',
//     }]);
//   });

//   it('not changed uploaded file', () => {
//     localAssets.items.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0 };
//     dbFile.data.imagesMeta.foo = { fileId: 'foo', file: 'foo.png', mtimeMs: 0, remoteId: 'bar' };
//     remoteAssets.items = [ { id: 'bar', payload: 'payload' } ];
//     assert.deepEqual(syncingAssets.items, [{
//       fileId: 'foo',
//       remoteId: 'bar',
//       localState: 'NOT_CHANGED',
//       remoteState: 'UPLOADED',
//     }]);
//   });

//   it('not used file', () => {
//     remoteAssets.items = [ { id: 'bar', payload: 'payload' } ];
//     syncingAssets.compare();
//     assert.deepEqual(syncingAssets.items, [{
//       remoteId: 'bar',
//       remoteState: 'NOT_USED',
//     }]);
//   });

// });
