export const DASHBOARD_THEME_MODES = ['light', 'dark', 'system'] as const;
export const DASHBOARD_THEME_SOURCES = ['default', 'shadcn', 'tweakcn', 'imported'] as const;
export const DASHBOARD_SIDEBAR_VARIANTS = ['sidebar', 'floating', 'inset'] as const;
export const DASHBOARD_SIDEBAR_COLLAPSIBLE = ['offcanvas', 'icon', 'none'] as const;
export const DASHBOARD_SIDEBAR_SIDES = ['left', 'right'] as const;
export const DASHBOARD_LATIN_FONTS = ['inter', 'manrope', 'poppins'] as const;
export const DASHBOARD_ARABIC_FONTS = ['noto-sans-arabic', 'cairo', 'tajawal'] as const;

export const ALLOWED_DASHBOARD_THEME_VARIABLES = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
  'font-sans',
  'font-serif',
  'font-mono',
  'shadow-2xs',
  'shadow-xs',
  'shadow-sm',
  'shadow',
  'shadow-md',
  'shadow-lg',
  'shadow-xl',
  'shadow-2xl',
  'spacing',
  'tracking-normal',
  'shadow-color',
  'shadow-opacity',
  'shadow-blur',
  'shadow-spread',
  'shadow-offset-x',
  'shadow-offset-y',
  'letter-spacing',
] as const;

export type DashboardThemeMode = (typeof DASHBOARD_THEME_MODES)[number];
export type DashboardThemeSource = (typeof DASHBOARD_THEME_SOURCES)[number];
export type DashboardSidebarVariant = (typeof DASHBOARD_SIDEBAR_VARIANTS)[number];
export type DashboardSidebarCollapsible = (typeof DASHBOARD_SIDEBAR_COLLAPSIBLE)[number];
export type DashboardSidebarSide = (typeof DASHBOARD_SIDEBAR_SIDES)[number];
export type DashboardThemeVariables = Record<string, string>;

export interface DashboardPreferences {
  version: 1;
  mode: DashboardThemeMode;
  theme: {
    source: DashboardThemeSource;
    presetId: string | null;
    customVariables: { light: DashboardThemeVariables; dark: DashboardThemeVariables };
    overrides: { light: DashboardThemeVariables; dark: DashboardThemeVariables };
  };
  radius: string;
  fonts: {
    latin: (typeof DASHBOARD_LATIN_FONTS)[number];
    arabic: (typeof DASHBOARD_ARABIC_FONTS)[number];
  };
  sidebar: {
    variant: DashboardSidebarVariant;
    collapsible: DashboardSidebarCollapsible;
    side: DashboardSidebarSide;
  };
}

export function createDefaultDashboardPreferences(_language?: unknown): DashboardPreferences {
  return {
    version: 1,
    mode: 'dark',
    theme: {
      source: 'tweakcn',
      presetId: 'violet-bloom',
      customVariables: { light: {}, dark: {} },
      overrides: { light: {}, dark: {} },
    },
    radius: '1rem',
    fonts: { latin: 'poppins', arabic: 'cairo' },
    sidebar: {
      variant: 'inset',
      collapsible: 'icon',
      side: 'left',
    },
  };
}
