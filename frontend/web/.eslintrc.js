module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Uses rules from @typescript-eslint/eslint-plugin
    'plugin:react/recommended', // Uses rules from eslint-plugin-react
    'plugin:react-hooks/recommended', // Uses rules from eslint-plugin-react-hooks
    'prettier', // Uses eslint-config-prettier to disable conflicting rules
  ],
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser for TypeScript
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Allows parsing of JSX
    },
    ecmaVersion: 'latest', // Allows parsing of modern ECMAScript features
    sourceType: 'module', // Allows use of imports
  },
  plugins: [
    '@typescript-eslint', // Loads the plugin @typescript-eslint/eslint-plugin
    'react', // Loads eslint-plugin-react
    'react-hooks', // Loads eslint-plugin-react-hooks
    'react-refresh', // Loads eslint-plugin-react-refresh
    'prettier', // Loads eslint-plugin-prettier
  ],
  rules: {
    // Prettier rules
    'prettier/prettier': 'error',
    // React Refresh rules
    'react-refresh/only-export-components': 'warn',
    // TypeScript specific rules (customize as needed)
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^',
      },
    ],
    // React specific rules (customize as needed)
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+ and new JSX transform
    'react/prop-types': 'off', // Disable prop-types as we use TypeScript
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  ignorePatterns: ['dist/', 'build/', '.turbo/', 'node_modules/', '.env'], // Ignore build outputs, node_modules, etc.
}; 