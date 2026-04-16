import * as LucideIcons from 'lucide-react';

const iconOverrides = {
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'badge-check': 'BadgeCheck',
  bell: 'Bell',
  'chart-bar': 'ChartBar',
  check: 'Check',
  circle: 'Circle',
  clock: 'Clock',
  copy: 'Copy',
  'credit-card': 'CreditCard',
  edit: 'Pencil',
  eye: 'Eye',
  'eye-off': 'EyeOff',
  flame: 'Flame',
  'git-merge': 'GitMerge',
  heart: 'Heart',
  'layout-dashboard': 'LayoutDashboard',
  'link-2': 'Link2',
  lock: 'Lock',
  'log-out': 'LogOut',
  menu: 'Menu',
  'menu-square': 'SquareMenu',
  'message-circle': 'MessageCircle',
  'message-square-warning': 'MessageSquareWarning',
  minus: 'Minus',
  moon: 'Moon',
  'map-pin': 'MapPin',
  package: 'Package',
  phone: 'Phone',
  plus: 'Plus',
  radio: 'Radio',
  search: 'Search',
  'shield-check': 'ShieldCheck',
  shuffle: 'Shuffle',
  'shopping-bag': 'ShoppingBag',
  'shopping-cart': 'ShoppingCart',
  share: 'Share2',
  'share-2': 'Share2',
  star: 'Star',
  store: 'Store',
  sun: 'Sun',
  'trash-2': 'Trash2',
  truck: 'Truck',
  'user-round': 'UserRound',
  users: 'Users',
  wallet: 'Wallet',
  workflow: 'Workflow',
  x: 'X',
};

function toPascalCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function Icon({ icon, className = '', ...props }) {
  const iconName = typeof icon === 'string' ? icon.replace(/^lucide:/, '') : '';
  const componentName = iconOverrides[iconName] || toPascalCase(iconName);
  const Component = LucideIcons[componentName] || LucideIcons.CircleHelp;

  return <Component className={className} aria-hidden="true" focusable="false" {...props} />;
}

export default Icon;