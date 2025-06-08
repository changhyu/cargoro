import asyncio
import json
import logging
import requests
from datetime import datetime
from typing import Dict, Any, List, Optional

from prisma import Prisma
from prisma.errors import PrismaError

logger = logging.getLogger(__name__)


class ERPSyncService:
    """
    ERP 시스템과의 데이터 동기화를 처리하는 서비스 클래스
    """

    def __init__(self):
        self.db = Prisma()
        self.erp_adapters = {
            "SAP": self._sync_sap,
            "ORACLE": self._sync_oracle,
            "MICROSOFT_DYNAMICS": self._sync_dynamics,
            "CUSTOM": self._sync_custom,
        }

    async def sync_data(
        self,
        config: Any,
        sync_log_id: str,
        direction: str,
        filters: Dict[str, Any] = None,
    ):
        """
        ERP 시스템과 데이터 동기화를 수행하는 백그라운드 작업
        """
        try:
            # Prisma 연결 확인
            if not self.db.is_connected():
                await self.db.connect()

            # 동기화 시작
            logger.info(f"ERP 동기화 시작: 설정 ID {config.id}, 로그 ID {sync_log_id}")

            # 시스템 유형에 따른 동기화 함수 호출
            erp_system = config.erpSystem
            if erp_system in self.erp_adapters:
                result = await self.erp_adapters[erp_system](config, direction, filters)
            else:
                result = {
                    "success": False,
                    "message": f"지원되지 않는 ERP 시스템: {erp_system}",
                    "processed": 0,
                    "success_count": 0,
                    "failed_count": 0,
                    "error_details": None,
                }

            # 동기화 로그 업데이트
            await self._update_sync_log(
                sync_log_id,
                result["success"],
                result["message"],
                result["processed"],
                result["success_count"],
                result["failed_count"],
                result["error_details"],
            )

            # 성공적인 동기화인 경우 설정의 마지막 동기화 시간 업데이트
            if result["success"]:
                await self.db.erpsyncconfig.update(
                    where={"id": config.id},
                    data={"lastSyncTime": datetime.now()},
                )

            logger.info(f"ERP 동기화 완료: 설정 ID {config.id}, 로그 ID {sync_log_id}")

        except Exception as e:
            logger.error(f"ERP 동기화 중 오류 발생: {str(e)}")
            # 동기화 로그 업데이트 (실패)
            try:
                await self._update_sync_log(
                    sync_log_id,
                    False,
                    "동기화 중 예외 발생",
                    0,
                    0,
                    0,
                    str(e),
                )
            except Exception as log_error:
                logger.error(f"로그 업데이트 중 오류: {str(log_error)}")
        finally:
            # Prisma 연결 해제
            if self.db.is_connected():
                await self.db.disconnect()

    async def _update_sync_log(
        self,
        log_id: str,
        success: bool,
        message: str,
        processed: int,
        success_count: int,
        failed_count: int,
        error_details: Optional[str] = None,
    ):
        """
        동기화 로그를 업데이트합니다.
        """
        try:
            status = "COMPLETED" if success else "FAILED"
            if success and failed_count > 0:
                status = "PARTIAL"

            await self.db.erpsynclog.update(
                where={"id": log_id},
                data={
                    "status": status,
                    "endTime": datetime.now(),
                    "totalItems": processed,
                    "processedItems": processed,
                    "successItems": success_count,
                    "failedItems": failed_count,
                    "errorDetails": error_details,
                },
            )
        except PrismaError as e:
            logger.error(f"동기화 로그 업데이트 중 Prisma 오류: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"동기화 로그 업데이트 중 오류: {str(e)}")
            raise

    async def _sync_sap(
        self, config: Any, direction: str, filters: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        SAP ERP 시스템과 데이터 동기화
        """
        try:
            logger.info(f"SAP 동기화 시작: 방향={direction}")

            # SAP 연결 정보
            connection_url = config.connectionUrl
            username = config.username
            password = config.password
            mapping_config = json.loads(config.mappingConfig)

            # 동기화 방향에 따른 처리
            if direction == "IMPORT":
                # SAP에서 데이터 가져오기
                result = await self._import_from_sap(
                    connection_url, username, password, mapping_config, filters
                )
            elif direction == "EXPORT":
                # SAP로 데이터 내보내기
                result = await self._export_to_sap(
                    connection_url, username, password, mapping_config, filters
                )
            else:  # BIDIRECTIONAL
                # 양방향 동기화
                import_result = await self._import_from_sap(
                    connection_url, username, password, mapping_config, filters
                )
                export_result = await self._export_to_sap(
                    connection_url, username, password, mapping_config, filters
                )

                # 결과 병합
                result = {
                    "success": import_result["success"] and export_result["success"],
                    "message": f"가져오기: {import_result['message']}, 내보내기: {export_result['message']}",
                    "processed": import_result["processed"]
                    + export_result["processed"],
                    "success_count": import_result["success_count"]
                    + export_result["success_count"],
                    "failed_count": import_result["failed_count"]
                    + export_result["failed_count"],
                    "error_details": (
                        import_result["error_details"]
                        if import_result["error_details"]
                        else export_result["error_details"]
                    ),
                }

            return result

        except Exception as e:
            logger.error(f"SAP 동기화 중 오류: {str(e)}")
            return {
                "success": False,
                "message": f"SAP 동기화 실패: {str(e)}",
                "processed": 0,
                "success_count": 0,
                "failed_count": 0,
                "error_details": str(e),
            }

    async def _import_from_sap(
        self,
        connection_url: str,
        username: str,
        password: str,
        mapping_config: Dict[str, Any],
        filters: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        SAP에서 데이터를 가져옵니다.
        실제 구현에서는 SAP API를 호출하고 데이터를 로컬 데이터베이스에 저장합니다.
        """
        try:
            # 이 부분은 실제 SAP API 호출 코드로 대체해야 함
            # 예시를 위한 더미 구현
            logger.info(f"SAP 데이터 가져오기 호출: {connection_url}")
            logger.info(f"필터: {filters}")

            # 더미 결과 - 실제 구현에서는 실제 SAP API 결과를 처리해야 함
            return {
                "success": True,
                "message": "SAP에서 데이터를 성공적으로 가져왔습니다.",
                "processed": 50,
                "success_count": 48,
                "failed_count": 2,
                "error_details": "일부 항목에 유효하지 않은 값이 있습니다.",
            }

        except Exception as e:
            logger.error(f"SAP에서 데이터 가져오기 중 오류: {str(e)}")
            return {
                "success": False,
                "message": f"SAP에서 데이터 가져오기 실패: {str(e)}",
                "processed": 0,
                "success_count": 0,
                "failed_count": 0,
                "error_details": str(e),
            }

    async def _export_to_sap(
        self,
        connection_url: str,
        username: str,
        password: str,
        mapping_config: Dict[str, Any],
        filters: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        데이터를 SAP로 내보냅니다.
        실제 구현에서는 로컬 데이터베이스에서 데이터를 가져와 SAP API로 전송합니다.
        """
        try:
            # 이 부분은 실제 SAP API 호출 코드로 대체해야 함
            # 예시를 위한 더미 구현
            logger.info(f"SAP 데이터 내보내기 호출: {connection_url}")
            logger.info(f"필터: {filters}")

            # 더미 결과 - 실제 구현에서는 실제 SAP API 결과를 처리해야 함
            return {
                "success": True,
                "message": "데이터를 SAP로 성공적으로 내보냈습니다.",
                "processed": 30,
                "success_count": 30,
                "failed_count": 0,
                "error_details": None,
            }

        except Exception as e:
            logger.error(f"SAP로 데이터 내보내기 중 오류: {str(e)}")
            return {
                "success": False,
                "message": f"SAP로 데이터 내보내기 실패: {str(e)}",
                "processed": 0,
                "success_count": 0,
                "failed_count": 0,
                "error_details": str(e),
            }

    async def _sync_oracle(
        self, config: Any, direction: str, filters: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Oracle ERP 시스템과 데이터 동기화
        """
        # Oracle ERP 동기화 구현
        # 예시를 위한 더미 구현
        logger.info(f"Oracle 동기화 시작: 방향={direction}")
        return {
            "success": True,
            "message": "Oracle 동기화가 완료되었습니다.",
            "processed": 40,
            "success_count": 40,
            "failed_count": 0,
            "error_details": None,
        }

    async def _sync_dynamics(
        self, config: Any, direction: str, filters: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Microsoft Dynamics ERP 시스템과 데이터 동기화
        """
        # Microsoft Dynamics ERP 동기화 구현
        # 예시를 위한 더미 구현
        logger.info(f"Microsoft Dynamics 동기화 시작: 방향={direction}")
        return {
            "success": True,
            "message": "Microsoft Dynamics 동기화가 완료되었습니다.",
            "processed": 35,
            "success_count": 32,
            "failed_count": 3,
            "error_details": "일부 항목에 호환되지 않는 필드가 있습니다.",
        }

    async def _sync_custom(
        self, config: Any, direction: str, filters: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        사용자 정의 ERP 시스템과 데이터 동기화
        """
        # 사용자 정의 ERP 동기화 구현
        # 예시를 위한 더미 구현
        logger.info(f"사용자 정의 ERP 동기화 시작: 방향={direction}")
        return {
            "success": True,
            "message": "사용자 정의 ERP 동기화가 완료되었습니다.",
            "processed": 20,
            "success_count": 18,
            "failed_count": 2,
            "error_details": "일부 항목을 처리할 수 없습니다.",
        }
