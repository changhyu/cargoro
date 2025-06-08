export { CustomerList } from './components/customer-list';
export { CustomerForm } from './components/customer-form';
export { CustomerDetail } from './components/customer-detail';
export {
  useCustomers,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from './hooks/use-customers';
export type { Customer, CreateCustomerInput, UpdateCustomerInput, CustomerFilter } from './types';
