import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
        {
          name: 'gray',
          value: '#f5f5f5',
        },
      ],
    },
  },
  decorators: [
    Story => (
      <div className="font-sans antialiased">
        <Story />
      </div>
    ),
  ],
  globalTypes: {
    darkMode: {
      defaultValue: false,
      toolbar: {
        title: '다크 모드',
        icon: 'moon',
        items: [
          { title: '라이트', value: false, icon: 'sun' },
          { title: '다크', value: true, icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      defaultValue: 'ko',
      toolbar: {
        title: '언어',
        icon: 'globe',
        items: [
          { title: '한국어', value: 'ko' },
          { title: 'English', value: 'en' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
