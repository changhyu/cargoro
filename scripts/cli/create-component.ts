#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const program = new Command();

// 컴포넌트 템플릿
const componentTemplate = (name: string) => `import React from 'react';

export interface ${name}Props {
  children?: React.ReactNode;
  className?: string;
}

export const ${name} = ({ children, className }: ${name}Props) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
`;

// 스토리 템플릿
const storyTemplate = (name: string) => `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'UI/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {
    children: '${name} 컴포넌트',
  },
};
`;

// 테스트 템플릿
const testTemplate = (name: string) => `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name} 컴포넌트', () => {
  it('렌더링이 정상적으로 된다', () => {
    render(<${name}>Test</${name}>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('className을 올바르게 적용한다', () => {
    const { container } = render(<${name} className="test-class">Test</${name}>);
    expect(container.firstChild).toHaveClass('test-class');
  });
});
`;

// 인덱스 템플릿
const indexTemplate = (name: string) => `export * from './${name}';
`;

// 컴포넌트 생성 함수
const createComponent = async (name: string, type?: string) => {
  try {
    // 컴포넌트 타입 선택 (UI 패키지, 앱 컴포넌트 등)
    if (!type) {
      const { componentType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'componentType',
          message: '컴포넌트를 생성할 위치를 선택하세요:',
          choices: [
            { name: 'UI 패키지 (공유 컴포넌트)', value: 'ui' },
            { name: '워크샵 웹 앱', value: 'workshop' },
            { name: '플릿 매니저 앱', value: 'fleet' },
            { name: '부품 관리 앱', value: 'parts' },
            { name: '관리자 앱', value: 'admin' },
          ],
        },
      ]);
      type = componentType;
    }

    // 대상 디렉토리 설정
    let targetDir;
    switch (type) {
      case 'ui':
        targetDir = path.join(process.cwd(), 'packages/ui/src/components');
        break;
      case 'workshop':
        targetDir = path.join(process.cwd(), 'apps/workshop-web/components');
        break;
      case 'fleet':
        targetDir = path.join(process.cwd(), 'apps/fleet-manager-web/components');
        break;
      case 'parts':
        targetDir = path.join(process.cwd(), 'apps/parts-web/components');
        break;
      case 'admin':
        targetDir = path.join(process.cwd(), 'apps/superadmin-web/components');
        break;
      default:
        throw new Error('지원되지 않는 컴포넌트 타입입니다.');
    }

    // 컴포넌트 디렉토리 생성
    const componentDir = path.join(targetDir, name);

    if (fs.existsSync(componentDir)) {
      console.log(chalk.red(`❌ 에러: ${componentDir} 이미 존재합니다.`));
      return;
    }

    fs.mkdirSync(componentDir, { recursive: true });

    // 파일 생성
    fs.writeFileSync(path.join(componentDir, `${name}.tsx`), componentTemplate(name));
    fs.writeFileSync(path.join(componentDir, `${name}.stories.tsx`), storyTemplate(name));
    fs.writeFileSync(path.join(componentDir, `${name}.test.tsx`), testTemplate(name));
    fs.writeFileSync(path.join(componentDir, 'index.ts'), indexTemplate(name));

    // UI 컴포넌트인 경우, 인덱스 파일 업데이트
    if (type === 'ui') {
      updateUIIndexFile(name);
    }

    console.log(chalk.green(`✅ ${name} 컴포넌트가 생성되었습니다!`));
    console.log(chalk.cyan(`📁 위치: ${componentDir}`));
  } catch (error) {
    console.error(chalk.red('❌ 컴포넌트 생성 실패:'), error);
  }
};

// UI 패키지의 인덱스 파일 업데이트
const updateUIIndexFile = (componentName: string) => {
  const indexPath = path.join(process.cwd(), 'packages/ui/src/index.ts');

  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf-8');

    // 이미 export가 있는지 확인
    if (!content.includes(`export * from './components/${componentName}';`)) {
      content = content.trim() + `\nexport * from './components/${componentName}';\n`;
      fs.writeFileSync(indexPath, content);
      console.log(chalk.green(`✅ UI 패키지 인덱스 파일이 업데이트되었습니다.`));
    }
  } else {
    console.log(chalk.yellow(`⚠️ 경고: ${indexPath} 파일을 찾을 수 없습니다.`));
  }
};

// CLI 설정
program
  .name('create-component')
  .description('CarGoro 모노레포에서 리액트 컴포넌트를 생성하는 CLI 도구')
  .argument('[name]', '컴포넌트 이름')
  .option('-t, --type <type>', '컴포넌트 타입 (ui, workshop, fleet, parts, admin)')
  .action(async (name, options) => {
    if (!name) {
      // 이름이 제공되지 않았을 때 프롬프트
      const { componentName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'componentName',
          message: '컴포넌트 이름을 입력하세요 (파스칼 케이스로 입력):',
          validate: input => {
            if (!input) return '컴포넌트 이름은 필수입니다.';
            if (!/^[A-Z][a-zA-Z0-9]*$/.test(input))
              return '파스칼 케이스로 입력해주세요 (예: Button, UserCard)';
            return true;
          },
        },
      ]);
      name = componentName;
    }

    await createComponent(name, options.type);
  });

program.parse();
