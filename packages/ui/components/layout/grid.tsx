import { cn } from '../../lib/utils';

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  fluid?: boolean;
};

export function Container({ className, fluid = false, ...props }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full', !fluid && 'max-w-7xl', 'px-4 md:px-6', className)}
      {...props}
    />
  );
}

type RowProps = React.HTMLAttributes<HTMLDivElement> & {
  gutter?: number | [number, number];
  wrap?: boolean;
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
};

export function Row({
  className,
  gutter = 4,
  wrap = true,
  justify = 'start',
  align = 'start',
  ...props
}: RowProps) {
  // gutter 처리
  const gutterX = Array.isArray(gutter) ? gutter[0] : gutter;
  const gutterY = Array.isArray(gutter) ? gutter[1] : gutter;

  // justify 클래스 매핑
  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  // align 클래스 매핑
  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  return (
    <div
      className={cn(
        'flex',
        wrap ? 'flex-wrap' : 'flex-nowrap',
        justifyClasses[justify],
        alignClasses[align],
        `-mx-${gutterX / 2}`,
        gutterY > 0 ? `-my-${gutterY / 2}` : '',
        className
      )}
      {...props}
    />
  );
}

type ColWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type ColProps = React.HTMLAttributes<HTMLDivElement> & {
  span?: ColWidth;
  offset?: ColWidth;
  sm?: ColWidth;
  md?: ColWidth;
  lg?: ColWidth;
  xl?: ColWidth;
  gutter?: number | [number, number];
};

export function Col({
  className,
  span = 12,
  offset,
  sm,
  md,
  lg,
  xl,
  gutter = 4,
  ...props
}: ColProps) {
  // gutter 처리
  const gutterX = Array.isArray(gutter) ? gutter[0] : gutter;
  const gutterY = Array.isArray(gutter) ? gutter[1] : gutter;

  // 반응형 클래스 생성
  const generateWidthClass = (prefix: string, value?: ColWidth) => {
    if (!value) return '';
    return `${prefix ? `${prefix}:` : ''}w-${(value / 12) * 100}%`;
  };

  const generateOffsetClass = (prefix: string, value?: ColWidth) => {
    if (!value) return '';
    return `${prefix ? `${prefix}:` : ''}ml-${(value / 12) * 100}%`;
  };

  return (
    <div
      className={cn(
        generateWidthClass('', span),
        generateWidthClass('sm', sm),
        generateWidthClass('md', md),
        generateWidthClass('lg', lg),
        generateWidthClass('xl', xl),
        offset ? generateOffsetClass('', offset) : '',
        `px-${gutterX / 2}`,
        gutterY > 0 ? `py-${gutterY / 2}` : '',
        className
      )}
      {...props}
    />
  );
}

export type GridProps = {
  Container: typeof Container;
  Row: typeof Row;
  Col: typeof Col;
};

export const Grid: GridProps = {
  Container,
  Row,
  Col,
};

export default Grid;
