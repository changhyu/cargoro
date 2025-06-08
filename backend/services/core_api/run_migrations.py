import asyncio
import asyncpg
import os
import sys
import logging
from pathlib import Path

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("migrations")

# 환경 변수 로드
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/cargoro")

async def run_migrations():
    """마이그레이션 SQL 파일을 실행하는 함수"""
    try:
        # 데이터베이스 연결
        conn = await asyncpg.connect(DATABASE_URL)
        logger.info("데이터베이스 연결 성공")
        
        # 마이그레이션 파일 경로
        migrations_path = Path(__file__).parent.parent.parent / "database" / "migrations"
        
        # 마이그레이션 파일 실행
        migration_files = sorted([f for f in migrations_path.glob("*.sql")])
        
        for migration_file in migration_files:
            logger.info(f"마이그레이션 실행: {migration_file.name}")
            
            # SQL 파일 읽기
            sql = migration_file.read_text()
            
            # SQL 실행
            await conn.execute(sql)
            
            logger.info(f"마이그레이션 완료: {migration_file.name}")
        
        # 연결 종료
        await conn.close()
        logger.info("모든 마이그레이션 성공적으로 완료")
    
    except Exception as e:
        logger.error(f"마이그레이션 실행 중 오류 발생: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(run_migrations()) 