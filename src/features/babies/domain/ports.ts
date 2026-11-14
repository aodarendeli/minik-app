import type { Baby } from './entities';

export interface BabyRepository {
  list(): Promise<Baby[]>;
  getById(id: string): Promise<Baby | undefined>;
  save(baby: Baby): Promise<void>;
}
