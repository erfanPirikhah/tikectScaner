import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" showText={true} />
          </Link>
          
          <div className="flex flex-col items-center md:items-end">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} itiket - تمامی حقوق محفوظ است
            </p>
            {/* <p className="text-xs text-muted-foreground mt-1">
              ساخته شده با Next.js PWA
            </p> */}
          </div>
        </div>
      </div>
    </footer>
  );
}