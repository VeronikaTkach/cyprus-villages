export type { IVillage, IVillageTranslation, ICreateVillageDto, IUpdateVillageDto } from './model';
export { getTranslation } from './model';
export { VillageCard } from './ui';
export {
  villageKeys,
  usePublicVillages,
  usePublicVillage,
  useAdminVillages,
  useAdminVillage,
  useCreateVillage,
  useUpdateVillage,
  useArchiveVillage,
} from './api';
