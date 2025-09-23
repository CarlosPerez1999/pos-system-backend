export class PaginatedResponseDto<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
