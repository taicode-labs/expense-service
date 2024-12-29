export function bigintToNumber(value: bigint | null): number {
  if (value === null) return NaN

  // JavaScript 的 number 类型最大值
  const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER // 2^53 - 1
  const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER // -(2^53 - 1)

  try {
    // 检查输入是否为 bigint
    if (typeof value !== 'bigint') {
      throw new TypeError('Input must be a bigint')
    }

    // 检查是否溢出
    if (value > BigInt(MAX_SAFE_INTEGER) || value < BigInt(MIN_SAFE_INTEGER)) {
      return NaN // 溢出，返回 NaN
    }

    // 将 bigint 转换为 number
    return Number(value)
  } catch {
    // 捕获任何错误并返回 NaN
    return NaN
  }
}
