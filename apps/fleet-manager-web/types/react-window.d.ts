declare module 'react-window' {
  import * as React from 'react';

  export interface FixedSizeListProps {
    children: (props: { index: number; style: React.CSSProperties }) => React.ReactElement;
    height: number;
    itemCount: number;
    itemSize: number;
    width: number | string;
    overscanCount?: number;
    onScroll?: (props: { scrollOffset: number }) => void;
  }

  export class FixedSizeList extends React.Component<FixedSizeListProps> {}

  export interface VariableSizeListProps {
    children: (props: { index: number; style: React.CSSProperties }) => React.ReactElement;
    height: number;
    itemCount: number;
    itemSize: (index: number) => number;
    width: number | string;
    overscanCount?: number;
  }

  export class VariableSizeList extends React.Component<VariableSizeListProps> {}
}
