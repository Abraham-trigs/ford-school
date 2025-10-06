/**
 * Standardizes staff API responses for pagination
 */
export function createStaffResponse(
  data: any[],
  page: number,
  pageSize: number,
  total: number
) {
  return {
    data,
    meta: {
      page,
      pageSize,
      total
    }
  };
}
