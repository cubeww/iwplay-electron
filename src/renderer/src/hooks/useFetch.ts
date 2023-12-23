import { ShallowRef } from 'vue';
import { shallowRef } from 'vue';
import { Ref, ref } from 'vue';

type FetchStatus = 'pending' | 'fetching' | 'ok' | 'error';

export function useFetch<T extends (...a: any) => any>(initValue: Awaited<ReturnType<T>>, fetcher: T): [(...a: Parameters<T>) => void, Ref<Awaited<ReturnType<T>>>, Ref<FetchStatus>, Ref<string>] {
  const result = ref(initValue);
  const status = ref<FetchStatus>('pending');
  const error = ref<string>('');

  return [
    async function (...args: any) {
      if (status.value === 'fetching') {
        return;
      }
      status.value = 'fetching';
      try {
        result.value = await fetcher(...args);
        status.value = 'ok';
      } catch (err) {
        status.value = 'error';
        error.value = (err as Error).message;
      }
    },
    result,
    status,
    error
  ];
}

export function useFetchShallow<T extends (...a: any) => any>(initValue: Awaited<ReturnType<T>>, fetcher: T): [(...a: Parameters<T>) => void, ShallowRef<Awaited<ReturnType<T>>>, Ref<FetchStatus>, Ref<string>] {
  const result = shallowRef(initValue);
  const status = ref<FetchStatus>('pending');
  const error = ref<string>('');

  return [
    async function (...args: any) {
      if (status.value === 'fetching') {
        return;
      }
      status.value = 'fetching';
      try {
        result.value = await fetcher(...args);
        status.value = 'ok';
      } catch (err) {
        status.value = 'error';
        error.value = (err as Error).message;
      }
    },
    result,
    status,
    error
  ];
}
