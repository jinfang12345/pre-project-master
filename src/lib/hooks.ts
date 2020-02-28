import { useEffect, useState } from 'react';
import { getMeasurements } from '@maxtropy/kingfisher-api';

interface Request<T> {
  (): Promise<T>;
}

export function useFetchData<T>(request: Request<T>, deps: any[] = []) {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<T>();
  useEffect(() => {
    setLoading(true);
    request()
      .then(res => setValue(res))
      .catch(err => {
        console.log('useFetchData', err);
        throw err;
      })
      .finally(() => setLoading(false));
  }, deps);
  return { loading, value };
}

/**
 * @param projectId
 * @return undefined代表还在请求中，true代表有计费进线，false代表没有
 */
export function useHasMeasurements(projectId: number): boolean | undefined {
  const [hasMeasurement, setHasMeasurement] = useState<boolean>();
  useEffect(() => {
    async function getData(): Promise<void> {
      const response = await getMeasurements({
        projectId,
        size: 1,
      });
      setHasMeasurement(response.totalElements > 0);
    }
    getData().catch(console.error);
  }, [projectId]);
  return hasMeasurement;
}
