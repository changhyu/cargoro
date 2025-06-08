export * from './use-parts-api';
export * from './use-suppliers-api';

// 이전 훅 이름과의 호환성 유지
import { useGetParts, useCreatePart, useErpSync } from './use-parts-api';

import { useGetSuppliers } from './use-suppliers-api';

// 기존 이름을 별칭으로 내보내기
export const usePartsList = useGetParts;
export const useAddPart = useCreatePart;
export const useSuppliersList = useGetSuppliers;
export const useSyncWithErp = useErpSync;
