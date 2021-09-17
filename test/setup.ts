import chai from 'chai';
import sinon from 'sinon';

type AssertType = typeof chai.assert;
type SinonType = typeof sinon;

declare global {
  const assert: AssertType;
  const sinon: SinonType;
}

Object.assign(global, {
  assert: chai.assert,
  sinon,
});

chai.config.truncateThreshold = 0;

afterEach(() => {
  sinon.restore();
});
