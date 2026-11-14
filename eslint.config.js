// https://docs.expo.dev/guides/using-eslint/
// Architecture guardrails from docs/ARCHITECTURE.md are enforced here.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const rnUiPrimitives = {
  name: 'react-native',
  importNames: ['StyleSheet', 'View', 'Text', 'Pressable', 'TextInput', 'Image', 'ScrollView', 'FlatList', 'Modal'],
  message: 'Use design-system primitives (@/design-system) instead.',
};
const sizeBans = [
  { group: ['lodash', 'lodash/*', 'moment', 'axios'], message: 'Not allowed (bundle size). See docs/PERFORMANCE_AND_SIZE.md.' },
];
// Matches style objects/arrays/variables, not string props like <StatusBar style="dark" />.
const noStyleProp = {
  selector:
    "JSXAttribute[name.name='style'] > JSXExpressionContainer > :matches(ObjectExpression, ArrayExpression, Identifier, MemberExpression, CallExpression)",
  message: 'No style props outside the design system.',
};
const noRawTime = [
  { selector: "NewExpression[callee.name='Date']", message: 'Use the injected Clock / core/time helpers.' },
  { selector: "MemberExpression[object.name='Date'][property.name='now']", message: 'Use the injected Clock.' },
];

// Extractable packages (src/packages/*) must stay app-agnostic so they can move to npm unchanged.
const packageBoundary = {
  group: ['@/*', '@/**'],
  message: 'Packages must not import application code. Depend only on peers and relative files.',
};
// The app uses packages only through their public entry points.
const noDeepPackageImports = {
  group: ['**/packages/*/**', '@minik/*/*', '!@minik/*/testing'],
  message: 'Import packages via their public entry (e.g. @minik/design-tokens), not internal files.',
};

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/*', '.expo/*', 'scripts/*', 'node_modules/*'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/packages/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-restricted-imports': ['error', { patterns: [...sizeBans, noDeepPackageImports] }],
    },
  },
  {
    files: ['src/packages/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    files: ['src/packages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...sizeBans, packageBoundary] }],
    },
  },
  {
    files: ['src/app/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', { paths: [rnUiPrimitives], patterns: [...sizeBans, noDeepPackageImports] }],
      'no-restricted-syntax': ['error', noStyleProp],
    },
  },
  {
    files: ['src/features/*/presentation/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [rnUiPrimitives],
          patterns: [
            ...sizeBans,
            noDeepPackageImports,
            { group: ['**/data/*', '@/platform/*'], message: 'Presentation receives use-cases via deps context; never import data/platform.' },
          ],
        },
      ],
      'no-restricted-syntax': ['error', noStyleProp, ...noRawTime],
    },
  },
  {
    files: ['src/features/*/domain/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...sizeBans,
            noDeepPackageImports,
            { group: ['react', 'react-native', 'expo-*', '@/design-system', '@/platform/*', '**/presentation/*', '**/data/*'], message: 'domain/ is pure TypeScript.' },
          ],
        },
      ],
      'no-restricted-syntax': ['error', ...noRawTime],
    },
  },
]);
