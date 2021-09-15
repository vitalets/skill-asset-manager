/**
 * Set SyncingAsset action.
 */

import { LocalState, RemoteState, SyncingAsset } from './syncing-assets';

export enum Action {
  /** Do nothing */
  noop = 'noop',
  /** Upload asset to remote and update db file */
  upload = 'upload',
  /** Remove asset from db file */
  forget = 'forget',
  /** Remove asset from remote */
  clean = 'clean',
}

export function detectActions(items: SyncingAsset[]) {
  const actions: Record<Action, SyncingAsset[]> = {
    [Action.noop]: [],
    [Action.upload]: [],
    [Action.forget]: [],
    [Action.clean]: [],
  };
  items.forEach(item => {
    const action = detectAction(item);
    actions[action].push(item);
  });
  return actions;
}

function detectAction(item: SyncingAsset) {
  switch (true) {
    case isSynced(item): return Action.noop;
    case isNeedsSync(item): return Action.upload;
    case isFileDeleted(item): return Action.forget;
    case isUnused(item): return Action.clean;
    default: throw new Error(`Can not detect action for: ${item}`);
  }
}

function isSynced({ localState, remoteState }: SyncingAsset) {
  return [
    localState === LocalState.NOT_CHANGED,
    remoteState === RemoteState.UPLOADED,
  ].every(Boolean);
}

function isNeedsSync({ localState, remoteState }: SyncingAsset) {
  return [
    localState === LocalState.NEW,
    localState === LocalState.CHANGED,
    localState === LocalState.NOT_CHANGED && remoteState === RemoteState.NOT_UPLOADED,
  ].some(Boolean);
}

function isFileDeleted({ localState }: SyncingAsset) {
  return localState === LocalState.DELETED;
}

function isUnused({ localState, remoteState }: SyncingAsset) {
  return [
    localState === LocalState.DELETED,
    remoteState === RemoteState.NOT_USED,
  ].some(Boolean);
}
