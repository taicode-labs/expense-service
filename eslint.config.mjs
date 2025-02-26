import globals from 'globals'
import eslint from '@eslint/js'
import tsEslint from 'typescript-eslint'


export default [
  { ignores: ['source/clients/account'] },
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  { languageOptions: { globals: globals.node } },
  {
    rules: {
      'quotes': ['error', 'single'],
      'semi': ['error', 'never']
    }
  }
]
