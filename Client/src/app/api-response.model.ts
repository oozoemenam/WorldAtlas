import { City } from './cities/city.model';
import { Country } from './countries/country.model';

export interface ApiResponse {
  data: City[] | Country[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
