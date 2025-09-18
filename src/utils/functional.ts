/**
 * 函数式编程工具函数库
// ============================================================================
// 数学工具函数
// ============================================================================

/**
 * 边界值限制函数 - 纯函数
 * 将数值限制在指定范围内
 * 
 * @param value 输入值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制在范围内的值
 * 
 * @example
 * clamp(15, 0, 10) // 返回 10
 * clamp(-5, 0, 10) // 返回 0
 * clamp(5, 0, 10)  // 返回 5
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max));

/**
 * 检查数值是否在指定范围内 - 纯函数
 *
 * @param value 要检查的值
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @returns 是否在范围内
 */
export const isInRange = (value: number, min: number, max: number): boolean =>
  value >= min && value <= max;

// ============================================================================
// 数组操作工具函数
// ============================================================================

/**
 * 根据谓词函数查找数组元素 - 纯函数
 *
 * @param items 要搜索的数组
 * @param predicate 查找条件函数
 * @returns 找到的元素或null
 */
export const findItem = <T>(
  items: readonly T[],
  predicate: (item: T) => boolean
): T | null => {
  return items.find(predicate) ?? null;
};

/**
 * 根据索引安全获取数组元素 - 纯函数
 *
 * @param items 数组
 * @param index 索引
 * @returns 元素或null（如果索引无效）
 */
export const getItemAt = <T>(items: readonly T[], index: number): T | null => {
  return items[index] ?? null;
};

/**
 * 检查索引是否有效 - 纯函数
 *
 * @param index 索引值
 * @param items 数组
 * @returns 索引是否有效
 */
export const isValidIndex = <T>(
  index: number,
  items: readonly T[]
): boolean => {
  return isInRange(index, 0, items.length - 1);
};

/**
 * 根据属性值查找数组元素的索引 - 纯函数
 *
 * @param items 数组
 * @param key 属性键
 * @param value 属性值
 * @returns 元素索引或-1
 */
export const findIndexByProperty = <T, K extends keyof T>(
  items: readonly T[],
  key: K,
  value: T[K]
): number => {
  return items.findIndex((item) => item[key] === value);
};

// ============================================================================
// 对象操作工具函数
// ============================================================================

/**
 * 深度冻结对象，确保不可变性 - 纯函数
 *
 * @param obj 要冻结的对象
 * @returns 冻结后的对象
 */
export const deepFreeze = <T extends Record<string, any>>(
  obj: T
): Readonly<T> => {
  // 获取对象的所有属性名
  Object.getOwnPropertyNames(obj).forEach((name) => {
    const prop = obj[name];

    // 如果属性值是对象，递归冻结
    if (prop && typeof prop === "object") {
      deepFreeze(prop);
    }
  });

  return Object.freeze(obj);
};

/**
 * 安全地合并对象，不修改原对象 - 纯函数
 *
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的新对象
 */
export const safeMerge = <T, U>(target: T, source: U): T & U => {
  return { ...target, ...source };
};

/**
 * 从对象中选择指定属性创建新对象 - 纯函数
 *
 * @param obj 源对象
 * @param keys 要选择的属性键数组
 * @returns 包含选择属性的新对象
 */
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
};

// ============================================================================
// 函数组合工具
// ============================================================================

/**
 * 函数组合 - 从右到左执行函数
 *
 * @param fns 要组合的函数数组
 * @returns 组合后的函数
 */
export const compose =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduceRight((acc, fn) => fn(acc), value);

/**
 * 管道操作 - 从左到右执行函数
 *
 * @param fns 要组合的函数数组
 * @returns 管道函数
 */
export const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value);

/**
 * 柯里化函数 - 将多参数函数转换为单参数函数链
 *
 * @param fn 要柯里化的函数
 * @returns 柯里化后的函数
 */
export const curry =
  <A, B, C>(fn: (a: A, b: B) => C) =>
  (a: A) =>
  (b: B): C =>
    fn(a, b);

// ============================================================================
// 条件逻辑工具函数
// ============================================================================

/**
 * 条件执行函数 - 纯函数
 *
 * @param condition 条件
 * @param onTrue 条件为真时执行的函数
 * @param onFalse 条件为假时执行的函数（可选）
 * @returns 执行结果
 */
export const when = <T, R>(
  condition: boolean,
  onTrue: () => R,
  onFalse?: () => R
): R | undefined => {
  return condition ? onTrue() : onFalse?.();
};

/**
 * 空值合并 - 纯函数
 *
 * @param value 主值
 * @param fallback 备用值
 * @returns 非空值
 */
export const nullish = <T>(value: T | null | undefined, fallback: T): T => {
  return value ?? fallback;
};

// ============================================================================
// 字符串处理工具函数
// ============================================================================

/**
 * 安全的字符串转换 - 纯函数
 *
 * @param value 要转换的值
 * @returns 字符串
 */
export const safeString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value.toString();
  return String(value ?? "");
};

/**
 * 首字母大写 - 纯函数
 *
 * @param str 输入字符串
 * @returns 首字母大写的字符串
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * 检查字符串是否非空 - 纯函数
 * 
 * @param value 要检查的字符串
 * @returns 字符串是否非空（不是null、undefined或空字符串）
 * 
 * @example
 * isNotEmpty("hello") // 返回 true
 * isNotEmpty("") // 返回 false
 * isNotEmpty("   ") // 返回 true（包含空格）
 * isNotEmpty(null) // 返回 false
 * isNotEmpty(undefined) // 返回 false
 */
export const isNotEmpty = (value: string | null | undefined): boolean => {
  return exists(value) && value !== '';
};

/**
 * 检查字符串是否为空或只包含空白字符 - 纯函数
 * 
 * @param value 要检查的字符串
 * @returns 字符串是否为空或只包含空白字符
 * 
 * @example
 * isEmpty("") // 返回 true
 * isEmpty("   ") // 返回 true
 * isEmpty("hello") // 返回 false
 * isEmpty(null) // 返回 true
 * isEmpty(undefined) // 返回 true
 */
export const isEmpty = (value: string | null | undefined): boolean => {
  return !exists(value) || value.trim() === '';
};

// ============================================================================
// 类型谓词函数
// ============================================================================

/**
 * 检查值是否为定义 - 类型谓词
 *
 * @param value 要检查的值
 * @returns 是否已定义
 */
export const isDefined = <T>(value: T | undefined): value is T => {
  return value !== undefined;
};

/**
 * 检查值是否不为空 - 类型谓词
 *
 * @param value 要检查的值
 * @returns 是否不为空
 */
export const isNotNull = <T>(value: T | null): value is T => {
  return value !== null;
};

/**
 * 检查值是否存在（既不为null也不为undefined）- 类型谓词
 *
 * @param value 要检查的值
 * @returns 是否存在
 */
export const exists = <T>(value: T | null | undefined): value is T => {
  return value != null;
};

// ============================================================================
// 错误处理工具函数
// ============================================================================

/**
 * 安全执行函数，捕获错误 - 纯函数
 *
 * @param fn 要执行的函数
 * @param fallback 出错时的备用值
 * @returns 执行结果或备用值
 */
export const tryCatch = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

/**
 * 创建结果类型，用于错误处理
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * 创建成功结果
 *
 * @param data 成功数据
 * @returns 成功结果
 */
export const success = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

/**
 * 创建错误结果
 *
 * @param error 错误信息
 * @returns 错误结果
 */
export const failure = <E = Error>(error: E): Result<never, E> => ({
  success: false,
  error,
});

// ============================================================================
// 导出所有工具函数
// ============================================================================

/**
 * 函数式编程工具函数集合
 * 包含所有常用的纯函数和工具函数
 */
export const FunctionalUtils = {
  // 数学工具
  clamp,
  isInRange,

  // 数组操作
  findItem,
  getItemAt,
  isValidIndex,
  findIndexByProperty,

  // 对象操作
  deepFreeze,
  safeMerge,
  pick,

  // 函数组合
  compose,
  pipe,
  curry,

  // 条件逻辑
  when,
  nullish,

  // 字符串处理
  safeString,
  capitalize,

  // 类型谓词
  isDefined,
  isNotNull,
  exists,

  // 错误处理
  tryCatch,
  success,
  failure,
} as const;

export default FunctionalUtils;
