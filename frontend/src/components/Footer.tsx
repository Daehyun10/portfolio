import Editable from './Editable';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line px-6 pb-32 pt-10 text-sm text-muted">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="space-y-1">
          <Editable id="footer.email" as="p" className="block transition-colors duration-150" />
          <Editable id="footer.githubLabel" as="p" className="block transition-colors duration-150" />
        </div>
        <p className="tnum text-xs">
          © {new Date().getFullYear()} <Editable id="footer.copyright" />
        </p>
      </div>
    </footer>
  );
}
