import { cn } from '../../lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  heading?: React.ReactNode;
  description?: React.ReactNode;
  centered?: boolean;
  fullWidth?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Section({
  heading,
  description,
  centered = false,
  fullWidth = false,
  padding = 'medium',
  className,
  children,
  ...props
}: SectionProps) {
  const getPaddingClass = () => {
    switch (padding) {
      case 'none':
        return 'py-0';
      case 'small':
        return 'py-4';
      case 'large':
        return 'py-12';
      case 'medium':
      default:
        return 'py-8';
    }
  };

  return (
    <section className={cn('w-full', getPaddingClass(), className)} {...props}>
      <div
        className={cn(!fullWidth && 'container mx-auto px-4', centered && 'text-center')}
        data-testid="section-inner"
      >
        {(heading || description) && (
          <div className="mb-6">
            {heading && (
              <h2 className="text-3xl font-bold tracking-tight text-foreground">{heading}</h2>
            )}
            {description && <p className="mt-3 text-xl text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export default Section;
