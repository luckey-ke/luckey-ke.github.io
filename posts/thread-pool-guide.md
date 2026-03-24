## 前言

线程池是 Java 并发编程的核心组件。`java.util.concurrent` 提供了丰富的线程池实现，本文从基础到高级，梳理所有使用方式。

---

## ThreadPoolExecutor 核心参数

所有线程池最终都基于 `ThreadPoolExecutor`，理解它的 7 个参数是基础。

```java
public ThreadPoolExecutor(
    int corePoolSize,        // 核心线程数
    int maximumPoolSize,     // 最大线程数
    long keepAliveTime,      // 非核心线程空闲存活时间
    TimeUnit unit,           // 时间单位
    BlockingQueue<Runnable> workQueue,  // 工作队列
    ThreadFactory threadFactory,        // 线程工厂
    RejectedExecutionHandler handler    // 拒绝策略
)
```

**工作原理**:
1. 线程数 < corePoolSize → 创建新线程执行
2. 线程数 >= corePoolSize → 加入工作队列
3. 队列满 + 线程数 < maximumPoolSize → 创建新线程
4. 队列满 + 线程数 >= maximumPoolSize → 执行拒绝策略

---

## 四种工作队列

```java
// 1. 无界队列（默认 Executors 用这个）
new LinkedBlockingQueue<>()         // 无界，maximumPoolSize 无效
new LinkedBlockingQueue<>(100)      // 有界，容量 100

// 2. 有界数组队列
new ArrayBlockingQueue<>(100)       // FIFO，固定容量

// 3. 同步移交队列（SynchronousQueue）
new SynchronousQueue<>()            // 不存储元素，直接移交
// 配合大 maximumPoolSize 使用，适合短任务高并发

// 4. 优先级队列
new PriorityBlockingQueue<>()       // 按优先级出队
```

---

## 四种拒绝策略

```java
// 1. AbortPolicy — 抛 RejectedExecutionException（默认）
new ThreadPoolExecutor.AbortPolicy()

// 2. CallerRunsPolicy — 调用者线程执行任务
new ThreadPoolExecutor.CallerRunsPolicy()

// 3. DiscardPolicy — 静默丢弃被拒绝的任务
new ThreadPoolExecutor.DiscardPolicy()

// 4. DiscardOldestPolicy — 丢弃队列最旧的任务，重新提交
new ThreadPoolExecutor.DiscardOldestPolicy()

// 5. 自定义拒绝策略
new RejectedExecutionHandler() {
    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        // 比如：持久化到数据库，稍后重试
        System.out.println("任务被拒绝: " + r.toString());
    }
}
```

---

## Executors 工厂方法

Java 提供了 4 种预配置线程池，但生产环境建议用 `ThreadPoolExecutor` 手动配置。

### 1. FixedThreadPool

固定线程数，无界队列。

```java
ExecutorService pool = Executors.newFixedThreadPool(4);
// 等价于
new ThreadPoolExecutor(4, 4, 0L, TimeUnit.MILLISECONDS,
    new LinkedBlockingQueue<>());

// 适用场景：负载稳定的场景，控制最大并发数
```

### 2. CachedThreadPool

可缓存线程池，无上限。

```java
ExecutorService pool = Executors.newCachedThreadPool();
// 等价于
new ThreadPoolExecutor(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS,
    new SynchronousQueue<>());

// 适用场景：大量短生命周期的异步任务
// 风险：任务过多会创建大量线程，可能导致 OOM
```

### 3. SingleThreadExecutor

单线程串行执行。

```java
ExecutorService pool = Executors.newSingleThreadExecutor();
// 等价于
new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS,
    new LinkedBlockingQueue<>());

// 适用场景：需要保证任务顺序执行的场景
```

### 4. ScheduledThreadPool

定时和周期性任务。

```java
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

// 延迟执行
scheduler.schedule(() -> System.out.println("延迟3秒"), 3, TimeUnit.SECONDS);

// 固定速率周期执行（不管上次是否执行完）
scheduler.scheduleAtFixedRate(() -> {
    System.out.println("每5秒执行一次");
}, 0, 5, TimeUnit.SECONDS);

// 固定延迟周期执行（上次执行完后等 delay 再执行）
scheduler.scheduleWithFixedDelay(() -> {
    System.out.println("执行完后等2秒再执行");
}, 0, 2, TimeUnit.SECONDS);
```

---

## ForkJoinPool

分治思想的线程池，适合递归拆分任务。

```java
// 方式一：RecursiveTask（有返回值）
class SumTask extends RecursiveTask<Long> {
    private final int[] arr;
    private final int start, end;
    private static final int THRESHOLD = 1000;

    SumTask(int[] arr, int start, int end) {
        this.arr = arr; this.start = start; this.end = end;
    }

    @Override
    protected Long compute() {
        if (end - start <= THRESHOLD) {
            long sum = 0;
            for (int i = start; i < end; i++) sum += arr[i];
            return sum;
        }
        int mid = (start + end) / 2;
        SumTask left = new SumTask(arr, start, mid);
        SumTask right = new SumTask(arr, mid, end);
        left.fork();          // 异步执行左任务
        long rightResult = right.compute();  // 当前线程执行右任务
        long leftResult = left.join();       // 等待左任务结果
        return leftResult + rightResult;
    }
}

ForkJoinPool pool = new ForkJoinPool();
long sum = pool.invoke(new SumTask(arr, 0, arr.length));
```

```java
// 方式二：RecursiveAction（无返回值）
class PrintTask extends RecursiveAction {
    private final List<String> list;
    private final int start, end;

    @Override
    protected void compute() {
        if (end - start <= 10) {
            for (int i = start; i < end; i++) System.out.println(list.get(i));
            return;
        }
        int mid = (start + end) / 2;
        invokeAll(new PrintTask(list, start, mid),
                  new PrintTask(list, mid, end));
    }
}
```

---

## CompletableFuture

异步编程的现代方式，支持链式编排。

```java
// 创建异步任务
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    // 在 ForkJoinPool.commonPool() 中执行
    return fetchData();
}, myExecutor);

// 链式转换
CompletableFuture<String> result = CompletableFuture
    .supplyAsync(() -> "Hello")
    .thenApply(s -> s + " World")
    .thenApply(String::toUpperCase);

// 消费结果（无返回值）
future.thenAccept(s -> System.out.println(s));

// 组合多个异步任务
CompletableFuture<String> combined = CompletableFuture
    .supplyAsync(() -> getUser())
    .thenCompose(user -> getOrders(user.getId()))  // 扁平化
    .thenApply(orders -> orders.toString());

// allOf — 等待所有完成
List<CompletableFuture<String>> futures = urls.stream()
    .map(url -> CompletableFuture.supplyAsync(() -> fetch(url)))
    .collect(Collectors.toList());

CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
    .thenRun(() -> System.out.println("全部完成"));

// anyOf — 任一完成
CompletableFuture.anyOf(futures.toArray(new CompletableFuture[0]))
    .thenAccept(result -> System.out.println("最快的结果: " + result));

// 异常处理
CompletableFuture.supplyAsync(() -> riskyOperation())
    .exceptionally(ex -> {
        System.out.println("出错了: " + ex.getMessage());
        return "fallback";
    })
    .handle((result, ex) -> {
        if (ex != null) return "error";
        return result;
    });
```

---

## 自定义线程池最佳实践

生产环境推荐这种配置方式：

```java
public class ThreadPoolFactory {

    public static ThreadPoolExecutor create(
            int coreSize, int maxSize, String namePrefix) {

        return new ThreadPoolExecutor(
            coreSize,
            maxSize,
            60, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(1000),       // 有界队列
            new ThreadFactory() {
                private final AtomicInteger idx = new AtomicInteger(1);
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, namePrefix + "-" + idx.getAndIncrement());
                    t.setDaemon(false);
                    t.setUncaughtExceptionHandler((thread, ex) ->
                        System.err.println("线程异常: " + thread.getName() + ", " + ex));
                    return t;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy()  // 不丢弃，调用者执行
        );
    }

    // CPU 密集型：线程数 = CPU 核数 + 1
    public static ThreadPoolExecutor cpuIntensive() {
        return create(Runtime.getRuntime().availableProcessors() + 1,
                      Runtime.getRuntime().availableProcessors() + 1,
                      "cpu-worker");
    }

    // IO 密集型：线程数 = CPU 核数 * 2
    public static ThreadPoolExecutor ioIntensive() {
        int cores = Runtime.getRuntime().availableProcessors();
        return create(cores * 2, cores * 2, "io-worker");
    }
}
```

**线程数经验值**:
- CPU 密集型：`CPU核数 + 1`
- IO 密集型：`CPU核数 * 2`（或 `CPU核数 / (1 - 阻塞系数)`）
- 混合型：需要根据实际压测调优

---

## 线程池监控

```java
ThreadPoolExecutor pool = ThreadPoolFactory.ioIntensive();

// 定期打印线程池状态
ScheduledExecutorService monitor = Executors.newSingleThreadScheduledExecutor();
monitor.scheduleAtFixedRate(() -> {
    System.out.printf(
        "Pool: %s | Active: %d | Completed: %d | Queue: %d | PoolSize: %d%n",
        "io-worker",
        pool.getActiveCount(),
        pool.getCompletedTaskCount(),
        pool.getQueue().size(),
        pool.getPoolSize()
    );
}, 0, 10, TimeUnit.SECONDS);
```

---

## 优雅关闭

```java
// 标准关闭流程
pool.shutdown();  // 停止接受新任务，等待已提交任务完成

try {
    if (!pool.awaitTermination(60, TimeUnit.SECONDS)) {
        pool.shutdownNow();  // 尝试取消正在执行的任务
        if (!pool.awaitTermination(30, TimeUnit.SECONDS)) {
            System.err.println("线程池未能完全关闭");
        }
    }
} catch (InterruptedException e) {
    pool.shutdownNow();
    Thread.currentThread().interrupt();
}
```

---

## 总结

| 场景 | 推荐方案 |
|------|----------|
| 固定并发数 | `FixedThreadPool` 或手动配置 |
| 短任务高并发 | `CachedThreadPool`（注意风险） |
| 定时任务 | `ScheduledThreadPool` |
| 分治递归 | `ForkJoinPool` |
| 异步编排 | `CompletableFuture` |
| 生产环境 | 手动 `ThreadPoolExecutor` + 有界队列 + 拒绝策略 |

**核心原则**：
1. 永远不用无界队列处理不可控的任务量
2. 生产环境必须配置拒绝策略
3. 线程池用完必须优雅关闭
4. 根据任务类型（CPU/IO）合理设置线程数
