import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { initializeContractData } from '../store/slices/web3Slice';

export const useWeb3Init = () => {
  const dispatch = useAppDispatch();
  const { isInitialized, loading, error } = useAppSelector(
    (state) => state.web3
  );

  useEffect(() => {
    if (!isInitialized && !loading && !error) {
      dispatch(initializeContractData());
    }
  }, [dispatch, isInitialized, loading, error]);

  return { isInitialized, loading, error };
};
