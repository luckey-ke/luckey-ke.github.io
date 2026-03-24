## 前言

Java 8 是 Java 历史上变化最大的版本之一，引入了大量语法糖让代码更简洁、更函数式。本文整理了 Java 8 中最实用的语法特性。

---

## Lambda 表达式

Lambda 是 Java 8 最核心的语法糖，让匿名内部类变得简洁。

```java
// 传统写法
Runnable r = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello");
    }
};

// Lambda 写法
Runnable r = () -> System.out.println("Hello");

// 带参数
Comparator<String> cmp = (a, b) -> a.length() - b.length();

// 多行
Consumer<String> print = s -> {
    System.out.println(">>> " + s);
    System.out.println("长度: " + s.length());
};
```

**语法要点**:
- 参数类型可省略，编译器自动推断
- 单参数可省略括号：`x -> x * 2`
- 单语句可省略大括号和 return

---

## 函数式接口

只有一个抽象方法的接口，可用 `@FunctionalInterface` 标注。

**常用内置函数式接口**:

| 接口 | 方法 | 签名 |
|------|------|------|
| `Function<T,R>` | apply | T → R |
| `Consumer<T>` | accept | T → void |
| `Supplier<T>` | get | () → T |
| `Predicate<T>` | test | T → boolean |
| `BiFunction<T,U,R>` | apply | (T,U) → R |

```java
Function<String, Integer> length = String::length;
Predicate<String> notEmpty = s -> !s.isEmpty();
Supplier<List<String>> listFactory = ArrayList::new;
```

---

## Stream API

Stream 是处理集合的利器，支持链式操作和惰性求值。

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

// 过滤 + 映射 + 收集
List<String> result = names.stream()
    .filter(name -> name.length() > 3)
    .map(String::toUpperCase)
    .sorted()
    .collect(Collectors.toList());
// [ALICE, CHARLIE, DAVID]

// 统计
long count = names.stream().filter(n -> n.startsWith("A")).count();

// 归约
int total = Stream.of(1, 2, 3, 4, 5)
    .reduce(0, Integer::sum);
// 15

// 分组
Map<Integer, List<String>> grouped = names.stream()
    .collect(Collectors.groupingBy(String::length));
```

**常用操作**:
- `filter` — 过滤
- `map` / `flatMap` — 映射 / 扁平映射
- `sorted` — 排序
- `distinct` — 去重
- `limit` / `skip` — 截取
- `peek` — 调试观察
- `forEach` — 终端遍历
- `collect` — 收集结果
- `reduce` — 归约

---

## Optional

解决 NullPointerException 的优雅方案。

```java
// 创建
Optional<String> opt1 = Optional.of("hello");
Optional<String> opt2 = Optional.empty();
Optional<String> opt3 = Optional.ofNullable(maybeNull);

// 取值
String val = opt1.orElse("default");
String val2 = opt1.orElseGet(() -> computeDefault());
String val3 = opt1.orElseThrow(() -> new RuntimeException("空值"));

// 链式操作
Optional<String> result = opt1
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .flatMap(s -> Optional.of(s + "!"));
```

---

## 方法引用

Lambda 的进一步简化，直接引用已有方法。

```java
// 四种形式
Function<String, Integer> f1 = String::length;          // 实例方法
Function<String, String> f2 = String::toUpperCase;       // 实例方法
Comparator<Integer>     f3 = Integer::compare;           // 静态方法
Supplier<List<String>>  f4 = ArrayList::new;             // 构造方法

// 在 Stream 中使用
names.stream().map(String::toUpperCase).collect(Collectors.toList());
names.forEach(System.out::println);
```

---

## 接口默认方法和静态方法

接口可以有实现了的方法体。

```java
public interface Logger {
    // 抽象方法
    void log(String message);

    // 默认方法
    default void logWarning(String message) {
        log("[WARN] " + message);
    }

    default void logError(String message) {
        log("[ERROR] " + message);
    }

    // 静态方法
    static Logger console() {
        return msg -> System.out.println(msg);
    }
}
```

---

## 新日期时间 API

`java.time` 包取代了老旧的 `Date` 和 `Calendar`。

```java
// 日期
LocalDate today = LocalDate.now();
LocalDate birthday = LocalDate.of(1995, 6, 15);
long daysBetween = ChronoUnit.DAYS.between(birthday, today);

// 时间
LocalTime now = LocalTime.now();
LocalTime meeting = LocalTime.of(14, 30);

// 日期时间
LocalDateTime ldt = LocalDateTime.now();

// 格式化
String formatted = today.format(DateTimeFormatter.ISO_LOCAL_DATE);
String custom = today.format(DateTimeFormatter.ofPattern("yyyy年MM月dd日"));

// 计算
LocalDate nextWeek = today.plusWeeks(1);
LocalDate lastMonth = today.minusMonths(1);
```

---

## 总结

Java 8 的语法糖极大地提升了开发体验：

- **Lambda** — 告别匿名内部类的臃肿
- **Stream** — 集合操作从命令式变为声明式
- **Optional** — 让空值处理更安全
- **方法引用** — 进一步精简代码
- **新日期 API** — 终于有了好用的时间处理

掌握这些特性，写 Java 也能像写脚本语言一样流畅。
