export async function asyncPool<T, R>(
  limit: number,
  items: T[],
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const poolSize = Math.max(1, limit);
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (true) {
      const currentIndex = nextIndex;
      if (currentIndex >= items.length) return;
      nextIndex = currentIndex + 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const runners = Array.from(
    { length: Math.min(poolSize, items.length) },
    () => runWorker()
  );

  await Promise.all(runners);
  return results;
}
