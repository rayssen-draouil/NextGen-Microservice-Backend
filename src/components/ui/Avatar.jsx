export default function Avatar({ src, alt, className = 'w-10 h-10', fallback = 'U' }) {
  return src ? (
    <img src={src} alt={alt} loading="lazy" className={`${className} rounded-full object-cover`} />
  ) : (
    <div className={`${className} rounded-full bg-muted text-primary flex items-center justify-center font-bold`}>{fallback}</div>
  );
}
