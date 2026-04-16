/**
 * @component Logo
 * @description Foodly brand logo that switches by current theme.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import useTheme from '@/hooks/useTheme';
import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/logo-dark.png';

const Logo = ({ className = '', size = 'default' }) => {
  const { theme } = useTheme();

  const sizeClasses = {
    small: 'h-25',
    default: 'h-30',
    large: 'h-35',
  };

  const logoSrc = theme === 'dark' ? logoDark : logoLight;

  return (
    <Link to="/" className={`flex items-center gap-2 shrink-0 ${className}`} aria-label="Foodly - Go to homepage">
      <img src={logoSrc} alt="Foodly Logo" className={`${sizeClasses[size]} w-auto object-contain`} loading="lazy" />
    </Link>
  );
};

export default Logo;
