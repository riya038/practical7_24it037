**# Practical 9: In-Memory Caching and Query Optimization**

**\*\*Course:\*\*** Advanced Web Development Frameworks (ITUE301)  

**\*\*Program:\*\*** B.Tech (IT / CE / CSE / AIML) — CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY (CHARUSAT)  

**\*\*Author:\*\*** 24IT037  

**\*\*Course Outcomes:\*\*** CO2, CO4 / PO3, PO5  

**---**

**## 📌 Objectives**

1\. Implement server-side in-memory caching using **\*\*\`node-cache\`\*\*** to optimize backend read performance.

2\. Cache the response of **\*\*\`GET /tasks\`\*\*** (all tasks) with a standard Time-To-Live (**\*\*TTL: 60 seconds\*\***).

3\. Cache single-task retrieval **\*\*\`GET /tasks/\:id\`\*\*** separately to prevent redundant database hits.

4\. Implement strict **\*\*Cache Invalidation\*\*** across write operations (**\*\*\`POST\`\*\***, **\*\*\`PUT\`\*\***, **\*\*\`DELETE\`\*\***) to guarantee zero stale data.

5\. Expose real-time **\*\*Cache Hit / Cache Miss counters\*\*** and performance metrics via a dedicated debug endpoint (\`GET /cache/stats\` & \`GET /tasks/cache/stats\`).

6\. Measure and document empirical API response time differences (uncached vs cached) using Thunder Client with 3 sample readings per condition.



**## 🛠️ Step-by-Step Implementation Summary**

**### 1. Install \`node-cache\`**

\`\`\`bash

npm install node-cache

\`\`\`

**### 2. Initialize Shared Cache Module (\`backend/utils/cache.js\`)**

\`\`\`javascript

const NodeCache = require('node-cache');

// Standard TTL: 60 seconds, background checkperiod: 120 seconds

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120, useClones: false });

let hitCount = 0;

let missCount = 0;

cache.recordHit = () => { hitCount++; };

cache.recordMiss = () => { missCount++; };

cache.getDebugStats = () => {

  const nodeStats = cache.getStats();

  const keys = cache.keys();

  const total = hitCount + missCount;

  return {

    hits: hitCount,

    misses: missCount,

    totalRequests: total,

    hitRatio: total > 0 ? \`${((hitCount / total) \* 100).toFixed(2)}%\` : '0.00%',

    activeKeyCount: keys.length,

    activeKeys: keys,

    stdTTL: 60,

    nodeCacheInternalStats: nodeStats,

  };

};

module.exports = cache;

\`\`\`

**### 3. Implement Cache Check on \`GET /tasks\` & \`GET /tasks/\:id\` (\`backend/routes/taskRoutes.js\`)**

\`\`\`javascript

// GET /tasks with Cache Check

router.get('/', async (req, res, next) => {

  try {

    const cacheKey = req.user ? \`all_tasks\_${req.user.id}\` : 'all_tasks';

    const cached = cache.get(cacheKey) || cache.get('all_tasks');

    if (cached) {

      cache.recordHit();

      res.setHeader('X-Cache', 'HIT');

      return res.status(200).json(cached);

    }

    cache.recordMiss();

    res.setHeader('X-Cache', 'MISS');

    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });

    const responsePayload = { success: true, count: tasks.length, data: tasks };

    cache.set(cacheKey, responsePayload);

    cache.set('all_tasks', responsePayload);

    res.status(200).json(responsePayload);

  } catch (err) {

    next(err);

  }

});

\`\`\`

**### 4. Invalidate Cache on Write Operations (\`POST\`, \`PUT\`, \`DELETE\`)**

\`\`\`javascript

// In POST /tasks:

await task.save();

cache.del('all_tasks');

if (req.user) cache.del(\`all_tasks\_${req.user.id}\`);

// In PUT /tasks/\:id & DELETE /tasks/\:id:

await task.save(); // or findOneAndDelete()

cache.del('all_tasks');

cache.del(\`task\_${req.params.id}\`);

if (req.user) {

  cache.del(\`all_tasks\_${req.user.id}\`);

  cache.del(\`task\_${req.user.id}\_${req.params.id}\`);

}

\`\`\`

**---**

**## ⏱️ Empirical Performance Measurements: Uncached vs Cached**

The performance test was performed using **Thunder Client** on \`http\://localhost:5000/tasks\`.

The first \`GET /tasks\` request returned **X-Cache: MISS** with an observed response time of **28 ms**. The same request was then repeated to verify the **X-Cache: HIT** behavior.

> **Note:** Response times can vary between runs depending on the local machine, MongoDB state, and system load. The values below should reflect the actual Thunder Client readings captured during testing rather than predefined sample values.

\| Reading # | Uncached (Database Query) | Cached (\`node-cache\` In-Memory HIT) | Difference / Speedup |

\| :---: | :---: | :---: | :---: |

\| **\*\*Sample 1\*\*** | **28 ms** | *See Screenshot 4 / Thunder Client reading* | Calculate from actual HIT reading |

\| **\*\*Sample 2\*\*** | *Record from MISS request* | *Record from HIT request* | Calculate from actual readings |

\| **\*\*Sample 3\*\*** | *Record from MISS request* | *Record from HIT request* | Calculate from actual readings |

\| **\*\*Average\*\*** | *Calculate* | *Calculate* | *Calculate* |

\> **\*\*Analysis Observation:\*\*** The cache allows repeated read requests to be served from the Node.js process memory instead of querying MongoDB again. The actual performance gain should be reported using the response times observed in Thunder Client.

**---**

**## 🧪 Postman & Thunder Client API Test Reference**

**### 1. Cache Performance & Metrics (\`GET /cache/stats\`)**

\* **\*\*URL:\*\*** \`http\://localhost:5000/cache/stats\`

\* **\*\*Method:\*\*** \`GET\`

\* **\*\*Sample Response:\*\***

  \`\`\`json

  {

    "success": true,

    "message": "Cache performance metrics & statistics",

    "data": {

      "hits": 6,

      "misses": 2,

      "totalRequests": 8,

      "hitRatio": "75.00%",

      "activeKeyCount": 2,

      "activeKeys": ["all_tasks", "task_66c84c7890abcdef12345678"],

      "stdTTL": 60,

      "nodeCacheInternalStats": {

        "hits": 6,

        "misses": 2,

        "keys": 2,

        "ksize": 42,

        "vsize": 1840

      }

    }

  }

  \`\`\`

**### 2. Fetch All Tasks (\`GET /tasks\`)**

\* **\*\*URL:\*\*** \`http\://localhost:5000/tasks\`

\* **\*\*Headers:\*\*** \`Authorization: Bearer \<JWT_TOKEN>\`

\* **\*\*Response Headers:\*\*** \`X-Cache: HIT\` (or \`X-Cache: MISS\` on first query / after write)

\* **\*\*Response Body:\*\***

  \`\`\`json

  {

    "success": true,

    "count": 3,

    "data": [

      {

        "\_id": "66c84c7890abcdef12345678",

        "title": "Complete Practical 9 In-Memory Caching",

        "description": "Implement node-cache with 60s TTL and cache invalidation",

        "completed": false,

        "priority": "high"

      }

    ]

  }

  \`\`\`

**## ❓ Key Analysis & Viva Questions with Detailed Answers**

**### Q1: Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?**

**\*\*Answer:\*\***  

1\. **\*\*Cache Consistency:\*\*** In-memory caching stores a snapshot of database query results. When write operations (\`POST\`, \`PUT\`, \`DELETE\`) modify the underlying MongoDB records, the cached snapshot immediately becomes stale and out of sync with reality.

2\. **\*\*Data Correctness Violations:\*\*** Without cache invalidation, subsequent \`GET\` requests would continue serving stale data from memory until the TTL expires.

   - A newly created task would not appear on the dashboard.

   - An updated task title/status would revert to the old state on reload.

   - A deleted task would still be visible and interactable.

3\. **\*\*Invalidation Strategy:\*\*** By immediately invoking \`cache.del(key)\` inside write handlers after successful database writes, we enforce a **\*\*cache-aside (lazy loading)\*\*** pattern that guarantees absolute read-after-write consistency.

**---**

**### Q2: What is a reasonable TTL (Time-To-Live) for cached data in a task management context, and what trade-off does TTL length represent?**

**\*\*Answer:\*\***  

1\. **\*\*Reasonable TTL Range:\*\*** In an interactive task management application, a TTL of **\*\*30 to 120 seconds\*\*** (default: **\*\*60 seconds\*\***) is recommended when combined with active cache invalidation on write events.

2\. **\*\*The Fundamental TTL Trade-off:\*\***

   - **\*\*Shorter TTL (e.g., 5–15 seconds):\*\***

     - *\*Advantage:\** Minimal risk of stale data if an unexpected out-of-band write occurs.

     - *\*Disadvantage:\** Frequent cache misses, resulting in higher database query load and reduced latency savings.

   - **\*\*Longer TTL (e.g., 5–15 minutes):\*\***

     - *\*Advantage:\** Higher cache hit ratio and maximum relief on database compute resources.

     - *\*Disadvantage:\** If cache invalidation logic fails or external database edits occur, stale data persists for longer periods.

3\. **\*\*Conclusion:\*\*** Because we implement explicit write invalidation (\`cache.del\`), a moderate TTL (60s) provides the ideal balance by protecting the database against read-heavy traffic spikes while ensuring expired keys are automatically evicted from RAM.

**---**

**### Q3: Why is in-memory caching (\`node-cache\`) not suitable for a multi-server / multi-instance deployment, even though it works fine in this lab?**

**\*\*Answer:\*\***  

1\. **\*\*Process-Local Memory Isolation:\*\*** \`node-cache\` stores cached key-value pairs strictly inside the heap memory of a single Node.js process.

2\. **\*\*Split Cache State (Incoherent Caching):\*\*** In a multi-server or clustered architecture (e.g., Node.js cluster, Kubernetes pods, or load-balanced EC2 instances):

   - Server Instance A and Server Instance B maintain completely independent RAM caches.

   - If a client writes to Instance A, Instance A invalidates its local cache.

   - Instance B remains unaware of the update and continues serving stale data from its own local RAM to clients routed to it by the load balancer.






