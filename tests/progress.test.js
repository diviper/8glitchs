const { markDone, isDone, getProgress, setQuizPassed, isQuizPassed } = require('../assets/js/progress');

describe('progress utility', () => {
  beforeEach(() => {
    const store = {};
    global.localStorage = {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { for (const k in store) delete store[k]; }
    };
  });

  test('mark and retrieve progress', () => {
    expect(getProgress()).toEqual([]);
    markDone('a1');
    expect(isDone('a1')).toBe(true);
    expect(getProgress()).toEqual(['a1']);
    markDone('a2');
    expect(getProgress().sort()).toEqual(['a1', 'a2']);
  });

  test('quiz progress', () => {
    expect(isQuizPassed('s1', 'q1')).toBe(false);
    setQuizPassed('s1', 'q1');
    expect(isQuizPassed('s1', 'q1')).toBe(true);
  });
});
