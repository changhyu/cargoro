import * as React from 'react';

// 기존 IconProps 유지
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// lucide-react에서 필요한 아이콘들 import
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Minus,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Sun,
  X,
} from 'lucide-react';

// DotsHorizontalIcon을 MoreHorizontal로 매핑
export const DotsHorizontalIcon = MoreHorizontal;

// 다른 lucide 아이콘들도 내보내기
export {
  AlertCircle as AlertCircleIcon,
  Check as CheckIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X as CloseIcon,
  Minus as MinusIcon,
  Moon as MoonIcon,
  MoreHorizontal,
  Plus as PlusIcon,
  Search as SearchIcon,
  Sun as SunIcon,
};
