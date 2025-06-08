import { SWRConfiguration } from 'swr';

export interface SWRProviderProps {
  children: React.ReactNode;
  options?: SWRConfiguration;
}
