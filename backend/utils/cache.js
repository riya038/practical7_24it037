const NodeCache = require('node-cache');

// Initialize a cache instance with a standard TTL of 60 seconds (as specified in Practical 9)
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

// Hit / Miss tracking for the debug stats endpoint
let hitCount = 0;
let missCount = 0;

cache.recordHit = () => {
  hitCount++;
};

cache.recordMiss = () => {
  missCount++;
};

cache.getDebugStats = () => {
  const nodeStats = cache.getStats();
  const keys = cache.keys();
  const total = hitCount + missCount;
  return {
    hits: hitCount,
    misses: missCount,
    totalRequests: total,
    hitRatio: total > 0 ? `${((hitCount / total) * 100).toFixed(2)}%` : '0.00%',
    activeKeyCount: keys.length,
    activeKeys: keys,
    stdTTL: 60,
    nodeCacheInternalStats: nodeStats,
  };
};

cache.resetStats = () => {
  hitCount = 0;
  missCount = 0;
  cache.flushAll();
};

module.exports = cache;
