import { memoryStorage } from './key-value';
import { Table } from './table';

type Row = { id: string; v: number };

describe('Table', () => {
  it('seeds only on first launch and survives a restart', () => {
    const storage = memoryStorage();
    const seed = jest.fn(() => [{ id: 'a', v: 1 }]);
    const first = new Table<Row>(storage, 'k', seed);
    first.put({ id: 'b', v: 2 });
    first.delete('a');
    const restarted = new Table<Row>(storage, 'k', seed);
    expect(seed).toHaveBeenCalledTimes(1);
    expect(restarted.values()).toEqual([{ id: 'b', v: 2 }]);
  });

  it('does not re-seed after the user cleared everything', () => {
    const storage = memoryStorage();
    new Table<Row>(storage, 'k', () => [{ id: 'a', v: 1 }]).clear();
    expect(new Table<Row>(storage, 'k', () => [{ id: 'a', v: 1 }]).values()).toEqual([]);
  });

  it('keeps a corrupt payload aside instead of losing it silently', () => {
    const storage = memoryStorage({ k: '{not json' });
    const table = new Table<Row>(storage, 'k');
    expect(table.values()).toEqual([]);
    expect(storage.getItem('k.corrupt')).toBe('{not json');
  });
});
