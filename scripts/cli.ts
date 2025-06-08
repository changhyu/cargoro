#!/usr/bin/env node

import { Command } from 'commander';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

const program = new Command();

// 버전 정보
program.name('cargoro-cli').description('CarGoro 모노레포 프로젝트 CLI 도구').version('1.0.0');

// 컴포넌트 생성 명령어
program
  .command('generate:component <name>')
  .alias('gc')
  .description('새로운 React 컴포넌트를 생성합니다')
  .option('-p, --path <path>', '컴포넌트를 생성할 경로', 'components')
  .action(async (name, options) => {
    const componentName = name.charAt(0).toUpperCase() + name.slice(1);
    const fileName = name.toLowerCase().replace(/\s+/g, '-');
    const targetPath = path.join(process.cwd(), 'app', options.path, fileName);

    if (fs.existsSync(targetPath)) {
      console.error(chalk.red(`❌ 컴포넌트 ${componentName}가 이미 존재합니다.`));
      return;
    }

    fs.mkdirSync(targetPath, { recursive: true });

    // 컴포넌트 파일 생성
    const componentContent = `import React from 'react';

interface ${componentName}Props {
  // props 정의
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <div>
      <h1>${componentName} 컴포넌트</h1>
    </div>
  );
};
`;

    // 테스트 파일 생성
    const testContent = `import { render, screen } from '@testing-library/react';
import { ${componentName} } from '../${fileName}';

describe('${componentName}', () => {
  it('렌더링되어야 합니다', () => {
    render(<${componentName} />);
    expect(screen.getByText('${componentName} 컴포넌트')).toBeInTheDocument();
  });
});
`;

    // index 파일 생성
    const indexContent = `export { ${componentName} } from './${fileName}';
`;

    fs.writeFileSync(path.join(targetPath, `${fileName}.tsx`), componentContent);
    fs.mkdirSync(path.join(targetPath, '__tests__'), { recursive: true });
    fs.writeFileSync(path.join(targetPath, '__tests__', `${fileName}.test.tsx`), testContent);
    fs.writeFileSync(path.join(targetPath, 'index.ts'), indexContent);

    console.log(chalk.green(`✅ 컴포넌트 ${componentName}가 성공적으로 생성되었습니다!`));
    console.log(chalk.blue(`📁 위치: ${targetPath}`));
  });

// 기능 모듈 생성 명령어
program
  .command('generate:feature <name>')
  .alias('gf')
  .description('새로운 기능 모듈을 생성합니다')
  .action(async name => {
    const featureName = name.toLowerCase().replace(/\s+/g, '-');
    const targetPath = path.join(process.cwd(), 'app', 'features', featureName);

    if (fs.existsSync(targetPath)) {
      console.error(chalk.red(`❌ 기능 모듈 ${featureName}이 이미 존재합니다.`));
      return;
    }

    // 디렉토리 구조 생성
    const dirs = [
      '',
      'components',
      'hooks',
      'services',
      'types',
      '__tests__/unit',
      '__tests__/integration',
    ];

    dirs.forEach(dir => {
      fs.mkdirSync(path.join(targetPath, dir), { recursive: true });
    });

    // index.ts 생성
    fs.writeFileSync(path.join(targetPath, 'index.ts'), `// ${featureName} 기능 모듈\n`);

    console.log(chalk.green(`✅ 기능 모듈 ${featureName}이 성공적으로 생성되었습니다!`));
    console.log(chalk.blue(`📁 위치: ${targetPath}`));
  });

// 환경 설정 명령어
program
  .command('setup:env')
  .description('환경 변수를 설정합니다')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'environment',
        message: '설정할 환경을 선택하세요:',
        choices: ['development', 'staging', 'production'],
      },
    ]);

    const envExample = path.join(process.cwd(), '.env.example');
    const envTarget = path.join(process.cwd(), '.env.local');

    if (fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, envTarget);
      console.log(chalk.green(`✅ ${answers.environment} 환경 설정이 완료되었습니다!`));
      console.log(chalk.yellow('⚠️  .env.local 파일의 값들을 실제 값으로 수정해주세요.'));
    } else {
      console.error(chalk.red('❌ .env.example 파일을 찾을 수 없습니다.'));
    }
  });

// 린트 실행 명령어
program
  .command('lint')
  .description('전체 프로젝트 린트를 실행합니다')
  .option('-f, --fix', '자동으로 수정 가능한 오류를 수정합니다')
  .action(options => {
    try {
      const command = options.fix ? 'pnpm run lint:fix' : 'pnpm run lint';
      console.log(chalk.blue('🔍 린트 검사를 시작합니다...'));
      execSync(command, { stdio: 'inherit' });
      console.log(chalk.green('✅ 린트 검사가 완료되었습니다!'));
    } catch (error) {
      console.error(chalk.red('❌ 린트 검사 중 오류가 발생했습니다.'));
      process.exit(1);
    }
  });

// 테스트 실행 명령어
program
  .command('test')
  .description('테스트를 실행합니다')
  .option('-w, --watch', '감시 모드로 실행')
  .option('-c, --coverage', '커버리지 리포트 생성')
  .action(options => {
    let command = 'pnpm run test';
    if (options.watch) command += ':watch';
    if (options.coverage) command += ':coverage';

    try {
      console.log(chalk.blue('🧪 테스트를 시작합니다...'));
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(chalk.red('❌ 테스트 실행 중 오류가 발생했습니다.'));
      process.exit(1);
    }
  });

// 빌드 명령어
program
  .command('build [app]')
  .description('애플리케이션을 빌드합니다')
  .action(app => {
    const command = app ? `pnpm run build --filter=${app}` : 'pnpm run build';

    try {
      console.log(chalk.blue('🔨 빌드를 시작합니다...'));
      execSync(command, { stdio: 'inherit' });
      console.log(chalk.green('✅ 빌드가 완료되었습니다!'));
    } catch (error) {
      console.error(chalk.red('❌ 빌드 중 오류가 발생했습니다.'));
      process.exit(1);
    }
  });

// 개발 서버 실행 명령어
program
  .command('dev [app]')
  .description('개발 서버를 실행합니다')
  .action(app => {
    const command = app ? `pnpm run dev --filter=${app}` : 'pnpm run dev';

    try {
      console.log(chalk.blue('🚀 개발 서버를 시작합니다...'));
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(chalk.red('❌ 개발 서버 실행 중 오류가 발생했습니다.'));
      process.exit(1);
    }
  });

program.parse();
