import chai from 'chai';
import sinon from 'sinon';

declare global {
  const assert: typeof chai.assert;
  const sinon: typeof sinon;
}

Object.assign(global, {
  assert: chai.assert,
  sinon,
});

chai.config.truncateThreshold = 0;

afterEach(() => {
  sinon.restore();
});
