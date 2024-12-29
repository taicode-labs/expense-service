-- 计费使用统计查询
-- 参数说明：
-- @param {DateTime} $1:startTime 统计开始时间
-- @param {DateTime} $2:endTime 统计结束时间
-- @param {String} $3:stepInterval 时间步长（如：'1 hour'::interval, '1 day'::interval）
-- @param {String} $4:userId 用户ID（可选）
-- @param {String} $5:itemKey 项目Key（可选）

-- 编写注意：所有参数在消费处必须强制类型转换，如：$1::timestamp

WITH
TimeSlots AS (
    -- 生成时间窗口序列
    SELECT "timeBucket" as "periodStart", "timeBucket" + $3::interval as "periodEnd"
    FROM generate_series($1::timestamp, $2::timestamp, $3::interval) as "timeBucket"
),
FilteredUsage AS (
    -- 应用过滤条件的原始数据
    SELECT "consumptionTime", "quantity" FROM "BillingUsage"
    WHERE "consumptionTime" >= $1::timestamp
    AND "consumptionTime" < $2::timestamp
    -- 可选的用户和项目过滤条件
    AND ($4::text IS NULL OR "userId" = $4::text)
    AND ($5::text IS NULL OR "itemKey" = $5::text)
),
PeriodStats AS (
    -- 计算每个时间窗口的统计数据
    SELECT 
        ts."periodEnd",
        ts."periodStart",
        COUNT(fu."quantity") as "periodRecords", -- 计算该时间窗口的记录数
        COALESCE(SUM(fu."quantity"), 0) as "periodUsage" -- 计算累计使用量
    FROM TimeSlots ts LEFT JOIN FilteredUsage fu ON fu."consumptionTime" >= ts."periodStart" AND fu."consumptionTime" < ts."periodEnd"
    GROUP BY ts."periodStart", ts."periodEnd"
)
-- 最终结果
SELECT "periodEnd" as "consumptionTime", "periodUsage" as "quantity" FROM PeriodStats
ORDER BY "periodStart";
