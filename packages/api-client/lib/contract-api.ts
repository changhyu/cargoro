import { PaginationParams } from '@cargoro/types/schema/api';
import {
  Contract,
  CreateContractDto,
  UpdateContractDto,
  ContractPayment,
  CreateContractPaymentDto,
  UpdateContractPaymentDto,
} from '@cargoro/types/schema/contract';

import { ApiClient } from './api-client';

export class ContractApi extends ApiClient {
  private readonly contractsEndpoint = '/api/fleet-api/contracts';

  // 모든 계약 조회
  async getContracts(
    params?: PaginationParams & { status?: string; vehicleId?: string; organizationId?: string }
  ): Promise<Contract[]> {
    return this.get<Contract[]>(this.contractsEndpoint, { params });
  }

  // 특정 계약 조회
  async getContractById(id: string): Promise<Contract> {
    return this.get<Contract>(`${this.contractsEndpoint}/${id}`);
  }

  // 특정 차량의 계약 조회
  async getContractsByVehicleId(vehicleId: string): Promise<Contract[]> {
    return this.get<Contract[]>(this.contractsEndpoint, { params: { vehicle_id: vehicleId } });
  }

  // 계약 생성
  async createContract(data: CreateContractDto): Promise<Contract> {
    return this.post<Contract>(this.contractsEndpoint, data);
  }

  // 계약 업데이트
  async updateContract(id: string, data: UpdateContractDto): Promise<Contract> {
    return this.patch<Contract>(`${this.contractsEndpoint}/${id}`, data);
  }

  // 계약 상태 변경
  async updateContractStatus(id: string, status: string): Promise<Contract> {
    return this.patch<Contract>(`${this.contractsEndpoint}/${id}/status`, { status });
  }

  // 계약 삭제
  async deleteContract(id: string): Promise<void> {
    return this.delete<void>(`${this.contractsEndpoint}/${id}`);
  }

  // 계약 결제 조회
  async getContractPayments(contractId: string): Promise<ContractPayment[]> {
    return this.get<ContractPayment[]>(`${this.contractsEndpoint}/${contractId}/payments`);
  }

  // 계약 결제 추가
  async addContractPayment(
    contractId: string,
    data: CreateContractPaymentDto
  ): Promise<ContractPayment> {
    return this.post<ContractPayment>(`${this.contractsEndpoint}/${contractId}/payments`, data);
  }

  // 계약 결제 업데이트
  async updateContractPayment(
    contractId: string,
    paymentId: string,
    data: UpdateContractPaymentDto
  ): Promise<ContractPayment> {
    return this.patch<ContractPayment>(
      `${this.contractsEndpoint}/${contractId}/payments/${paymentId}`,
      data
    );
  }

  // 계약 결제 삭제
  async deleteContractPayment(contractId: string, paymentId: string): Promise<void> {
    return this.delete<void>(`${this.contractsEndpoint}/${contractId}/payments/${paymentId}`);
  }
}
