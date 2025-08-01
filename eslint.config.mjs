import nkzw from '@nkzw/eslint-config'

export default [
  ...nkzw,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'perfectionist/sort-object-types': 'off',
      'perfectionist/sort-objects': 'off',
    },
  },
]
