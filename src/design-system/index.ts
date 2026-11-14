// Public API of the design system. Features import only from '@/design-system'.
export { ThemeProvider, useTheme } from './theme/ThemeProvider';
export type { PaletteName, Theme, ThemeName, ThemePreference } from './theme/theme';
export { PALETTE_NAMES } from '@minik/design-tokens';
export type { ColorToken } from '@minik/design-tokens';
export type { Tone } from '@minik/design-tokens';
export type { SpaceToken, RadiusToken, TypeVariant } from '@minik/design-tokens';

export { Box, Stack, Inline, Spacer, type BoxProps, type StackProps } from './primitives/Box';
export { Text, type TextProps } from './primitives/Text';
export { Icon, type IconProps } from './primitives/Icon';
export type { IconName } from './primitives/icons';
export { Pressable, type PressableProps } from './primitives/Pressable';
export { Divider } from './primitives/Divider';

export { ActionTile, type ActionTileProps } from './components/ActionTile';
export { Avatar, type AvatarProps } from './components/Avatar';
export { Badge } from './components/Badge';
export { BarChart, type BarDatum } from './components/BarChart';
export { Button, type ButtonProps } from './components/Button';
export { Card, type CardProps } from './components/Card';
export { BrandMark } from './components/BrandMark';
export { Checkbox, type CheckboxProps } from './components/Checkbox';
export { Chip, ChipGroup, type ChipProps } from './components/Chip';
export { confirmAsync, type ConfirmOptions } from './components/confirm';
export { DateField, type DateFieldProps } from './components/DateField';
export { EmptyState, type EmptyStateProps } from './components/EmptyState';
export { IconBubble, ProgressDots, type IconBubbleProps } from './components/IconBubble';
export { IconButton, type IconButtonProps } from './components/IconButton';
export { ListItem, type ListItemProps } from './components/ListItem';
export { Notice } from './components/Notice';
export { PalettePicker, type PalettePickerProps } from './components/PalettePicker';
export { NumberStepper, type NumberStepperProps } from './components/NumberStepper';
export { SectionHeader } from './components/SectionHeader';
export { SegmentedControl, type SegmentOption } from './components/SegmentedControl';
export { SnackbarProvider, useSnackbar, type SnackbarMessage } from './components/Snackbar';
export { StatGrid, StatTile, type StatTileProps } from './components/StatTile';
export { TextField, type TextFieldProps } from './components/TextField';
export { TimerDisplay, formatDuration } from './components/TimerDisplay';

export { ScreenContainer, type ScreenContainerProps } from './patterns/ScreenContainer';
export { PeriodNavigator } from './patterns/PeriodNavigator';
export { HeroCard, type HeroCardProps } from './patterns/HeroCard';

export { useControllableState } from './headless/use-controllable-state';
export { useStepper, clampStep } from './headless/use-stepper';
export { usePressableA11y } from './headless/use-pressable';
