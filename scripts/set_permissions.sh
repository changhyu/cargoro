#!/bin/bash

echo "모든 스크립트 파일에 실행 권한을 부여합니다..."

# scripts/local-dev/ 폴더의 모든 .sh 파일에 실행 권한 부여
chmod +x /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/scripts/local-dev/*.sh

# scripts/backend/ 폴더의 모든 .sh 파일과 .js 파일에 실행 권한 부여
chmod +x /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/scripts/backend/*.sh
chmod +x /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/scripts/backend/*.js

echo "모든 스크립트 파일에 실행 권한이 부여되었습니다."
