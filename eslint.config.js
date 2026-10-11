import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['dist/**', 'node_modules/**', '*.tsbuildinfo'],
  },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    name: 'app/rules',
    rules: {
      // 允許以底線前綴標示「刻意未使用」的參數
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // 純排版規則交給 formatter，不由 lint 管（否則會要求重排幾乎所有 .vue）
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-indent': 'off',
      'vue/html-self-closing': 'off',
      // 以型別宣告的選填 prop 預設即為 undefined，不需要再補預設值
      'vue/require-default-prop': 'off',
      // 使用者輸入的內容一律以文字插值顯示；v-html 會在個案端執行人員輸入的 HTML（XSS）
      'vue/no-v-html': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='slice'][callee.object.callee.property.name='toISOString']",
          message: 'toISOString() 是 UTC，在 UTC+8 會差一天；日期字串請用 @/utils/date 的 toLocalDateString()。',
        },
      ],
    },
  },
)
