import assert from 'assert';
import sinon from 'sinon';

type AssertType = typeof assert;
type SinonType = typeof sinon;

declare global {
  const assert: AssertType;
  const sinon: SinonType;
}

Object.assign(global, {
  assert: assert.strict,
  sinon,
});

afterEach(() => {
  sinon.restore();
});
