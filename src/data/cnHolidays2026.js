// Official 2026 China public holiday schedule + 调休 makeup workdays
// Source: State Council Office announcement (国务院办公厅), November 4, 2025

export const CN_HOLIDAYS_2026 = {
  // 元旦 New Year's Day (Jan 1–3)
  '2026-01-01': '元旦 · New Year\'s Day',
  '2026-01-02': '元旦 · New Year\'s Day',
  '2026-01-03': '元旦 · New Year\'s Day',
  // 春节 Spring Festival (Feb 15–23, 9 days)
  '2026-02-15': '春节 · Spring Festival',
  '2026-02-16': '春节 · Spring Festival',
  '2026-02-17': '春节 · Spring Festival',
  '2026-02-18': '春节 · Spring Festival',
  '2026-02-19': '春节 · Spring Festival',
  '2026-02-20': '春节 · Spring Festival',
  '2026-02-21': '春节 · Spring Festival',
  '2026-02-22': '春节 · Spring Festival',
  '2026-02-23': '春节 · Spring Festival',
  // 清明节 Qingming Festival (Apr 4–6)
  '2026-04-04': '清明节 · Qingming Festival',
  '2026-04-05': '清明节 · Qingming Festival',
  '2026-04-06': '清明节 · Qingming Festival',
  // 劳动节 Labor Day (May 1–5)
  '2026-05-01': '劳动节 · Labor Day',
  '2026-05-02': '劳动节 · Labor Day',
  '2026-05-03': '劳动节 · Labor Day',
  '2026-05-04': '劳动节 · Labor Day',
  '2026-05-05': '劳动节 · Labor Day',
  // 端午节 Dragon Boat Festival (Jun 19–21)
  '2026-06-19': '端午节 · Dragon Boat Festival',
  '2026-06-20': '端午节 · Dragon Boat Festival',
  '2026-06-21': '端午节 · Dragon Boat Festival',
  // 中秋节 Mid-Autumn Festival (Sep 25–27)
  '2026-09-25': '中秋节 · Mid-Autumn Festival',
  '2026-09-26': '中秋节 · Mid-Autumn Festival',
  '2026-09-27': '中秋节 · Mid-Autumn Festival',
  // 国庆节 National Day / Golden Week (Oct 1–7)
  '2026-10-01': '国庆节 · National Day',
  '2026-10-02': '国庆节 · National Day',
  '2026-10-03': '国庆节 · National Day',
  '2026-10-04': '国庆节 · National Day',
  '2026-10-05': '国庆节 · National Day',
  '2026-10-06': '国庆节 · National Day',
  '2026-10-07': '国庆节 · National Day',
};

// 调休: weekends converted to workdays to compensate for extended breaks
export const CN_TIAOXIU_2026 = {
  '2026-01-04': '调休 · 元旦补班',       // Sun → workday (New Year's)
  '2026-02-14': '调休 · 春节补班',       // Sat → workday (Spring Festival)
  '2026-02-28': '调休 · 春节补班',       // Sat → workday (Spring Festival)
  '2026-05-09': '调休 · 劳动节补班',     // Sat → workday (Labor Day)
  '2026-09-20': '调休 · 国庆节补班',     // Sun → workday (National Day)
  '2026-10-10': '调休 · 国庆节补班',     // Sat → workday (National Day)
};
