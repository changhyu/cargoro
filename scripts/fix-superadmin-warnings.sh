#!/bin/bash

# 스크립트 디렉토리를 monorepo-root로 변경
cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root

echo "=== 남은 린트 경고 자동 수정 시작 ==="

# @cargoro/superadmin-web의 catch 블록 error 변수들을 일괄 수정
echo "=== @cargoro/superadmin-web catch 블록 수정 중... ==="

# sed 명령어로 catch (error) 패턴을 catch로 변경
find apps/superadmin-web -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/} catch (error) {/} catch {/g' "$file"
  sed -i '' 's/} catch (_error) {/} catch {/g' "$file"
done

echo "=== 완료! ==="