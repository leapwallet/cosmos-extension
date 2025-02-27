import { action, makeObservable, observable, runInAction } from 'mobx';

export abstract class BaseObservableQueryStore<T> {
  data: T | null = null;

  lastFetchedAt: number | null = null;
  isLoading = false;
  error: Error | null = null;

  protected staleTime: number;

  constructor(staleTime: number = 5 * 60 * 1000) {
    this.staleTime = staleTime;
    makeObservable(this, {
      data: observable.deep,
      lastFetchedAt: observable,
      isLoading: observable,
      error: observable,
    });
  }

  @action
  protected setData(newData: T) {
    this.data = newData;
    this.lastFetchedAt = Date.now();
  }

  protected isDataStale() {
    if (!this.lastFetchedAt) return true;
    return Date.now() - this.lastFetchedAt > this.staleTime;
  }

  @action setLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  @action setError(error: Error | null) {
    this.error = error;
  }

  @action
  invalidateCache() {
    this.lastFetchedAt = null;
  }

  abstract fetchData(): Promise<T>;

  @action
  async getData(): Promise<T> {
    if (!this.isDataStale() && this.data !== null) {
      return this.data;
    }
    if (this.isLoading) {
      return new Promise<T>((resolve, reject) => {
        const checkDataReady = () => {
          if (!this.isLoading) {
            if (this.error) {
              reject(this.error);
            } else if (this.data !== null) {
              resolve(this.data);
            } else {
              reject(new Error('Data not found'));
            }
          } else {
            setTimeout(checkDataReady, 50);
          }
        };
        checkDataReady();
      });
    }
    this.setLoading(true);
    this.setError(null);

    try {
      const newData = await this.fetchData();
      runInAction(() => {
        this.setData(newData);
        this.setLoading(false);
      });
      return newData;
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error : new Error(String(error)));
        this.setLoading(false);
      });
      throw error;
    }
  }

  @action
  async refetchData(): Promise<T> {
    this.invalidateCache();
    return this.getData();
  }
}
