/// <reference types="expo/types" />

// Expo SDK 타입 정의
declare module '*.png' {
  const value: number;
  export = value;
}

declare module '*.jpg' {
  const value: number;
  export = value;
}

declare module '*.jpeg' {
  const value: number;
  export = value;
}

declare module '*.gif' {
  const value: number;
  export = value;
}

declare module '*.svg' {
  import { SvgProps } from 'react-native-svg';
  import { FC } from 'react';
  const content: FC<SvgProps>;
  export default content;
}
