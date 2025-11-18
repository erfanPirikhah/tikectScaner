import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
}

const Logo = ({ className, size = 'md', showText = true, href = '/' }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const logoContent = (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(sizeClasses[size], 'relative')}>
        <Image
          src="/ALogo.png"
          alt="Logo"
          fill
          style={{ objectFit: 'contain' }}
          className="rounded-sm"
          sizes="(max-width: 768px) 10vw, (max-width: 1200px) 8vw, 6vw"
          priority
        />
      </div>
      {showText && (
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          itiket
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;