/**
 * lucide-react 타입 정의
 * 다양한 아이콘 컴포넌트에 대한 타입 정의를 제공합니다.
 */

declare module 'lucide-react' {
  import * as React from 'react';

  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  // 기본 아이콘들
  export const Activity: React.FC<IconProps>;
  export const AlertCircle: React.FC<IconProps>;
  export const AlertTriangle: React.FC<IconProps>;
  export const ArrowDown: React.FC<IconProps>;
  export const ArrowLeft: React.FC<IconProps>;
  export const ArrowRight: React.FC<IconProps>;
  export const ArrowUp: React.FC<IconProps>;
  export const ArrowUpDown: React.FC<IconProps>;
  export const Award: React.FC<IconProps>;

  // B 시리즈
  export const BarChart3: React.FC<IconProps>;
  export const Battery: React.FC<IconProps>;
  export const Bell: React.FC<IconProps>;
  export const BellRing: React.FC<IconProps>;

  // C 시리즈
  export const Calendar: React.FC<IconProps>;
  export const CalendarDays: React.FC<IconProps>;
  export const Car: React.FC<IconProps>;
  export const CarFront: React.FC<IconProps>;
  export const Check: React.FC<IconProps>;
  export const CheckCircle: React.FC<IconProps>;
  export const CheckCircle2: React.FC<IconProps>;
  export const ChevronDown: React.FC<IconProps>;
  export const ChevronLeft: React.FC<IconProps>;
  export const ChevronRight: React.FC<IconProps>;
  export const ChevronUp: React.FC<IconProps>;
  export const ChevronsUpDown: React.FC<IconProps>;
  export const Circle: React.FC<IconProps>;
  export const ClipboardCheck: React.FC<IconProps>;
  export const ClipboardList: React.FC<IconProps>;
  export const Clock: React.FC<IconProps>;
  export const CreditCard: React.FC<IconProps>;

  // D 시리즈
  export const Database: React.FC<IconProps>;
  export const DollarSign: React.FC<IconProps>;
  export const Download: React.FC<IconProps>;
  export const DownloadIcon: React.FC<IconProps>; // 별칭
  export const Droplet: React.FC<IconProps>;

  // E 시리즈
  export const Edit: React.FC<IconProps>;
  export const Eye: React.FC<IconProps>;
  export const EyeOff: React.FC<IconProps>;

  // F 시리즈
  export const File: React.FC<IconProps>;
  export const FileSpreadsheet: React.FC<IconProps>;
  export const FileText: React.FC<IconProps>;
  export const Filter: React.FC<IconProps>;
  export const FilterIcon: React.FC<IconProps>; // 별칭
  export const Fuel: React.FC<IconProps>;

  // G 시리즈
  export const Gauge: React.FC<IconProps>;

  // H 시리즈
  export const Home: React.FC<IconProps>;

  // I 시리즈
  export const Image: React.FC<IconProps>;
  export const Info: React.FC<IconProps>;

  // L 시리즈
  export const Layers: React.FC<IconProps>;
  export const Loader2: React.FC<IconProps>;
  export const Locate: React.FC<IconProps>;
  export const LogOut: React.FC<IconProps>;

  // M 시리즈
  export const Mail: React.FC<IconProps>;
  export const MapIcon: React.FC<IconProps>;
  export const MapPin: React.FC<IconProps>;
  export const Menu: React.FC<IconProps>;
  export const Minus: React.FC<IconProps>;
  export const Moon: React.FC<IconProps>;
  export const MoreHorizontal: React.FC<IconProps>;
  export const MoreHorizontalIcon: React.FC<IconProps>; // 별칭
  export const MoreVertical: React.FC<IconProps>;

  // P 시리즈
  export const PenLine: React.FC<IconProps>;
  export const Phone: React.FC<IconProps>;
  export const PieChart: React.FC<IconProps>;
  export const Play: React.FC<IconProps>;
  export const Plus: React.FC<IconProps>;
  export const PlusIcon: React.FC<IconProps>; // 별칭

  // R 시리즈
  export const RefreshCcw: React.FC<IconProps>;
  export const RefreshCw: React.FC<IconProps>;
  export const Route: React.FC<IconProps>;

  // S 시리즈
  export const Save: React.FC<IconProps>;
  export const Search: React.FC<IconProps>;
  export const SearchIcon: React.FC<IconProps>; // 별칭
  export const Settings: React.FC<IconProps>;
  export const Shield: React.FC<IconProps>;
  export const ShieldAlert: React.FC<IconProps>;
  export const Star: React.FC<IconProps>;
  export const Sun: React.FC<IconProps>;

  // T 시리즈
  export const Target: React.FC<IconProps>;
  export const Thermometer: React.FC<IconProps>;
  export const Trash: React.FC<IconProps>;
  export const Trash2: React.FC<IconProps>;
  export const TrendingDown: React.FC<IconProps>;
  export const TrendingUp: React.FC<IconProps>;
  export const Trophy: React.FC<IconProps>;
  export const Truck: React.FC<IconProps>;

  // U 시리즈
  export const Upload: React.FC<IconProps>;
  export const UploadCloud: React.FC<IconProps>;
  export const User: React.FC<IconProps>;
  export const UserMinus: React.FC<IconProps>;
  export const UserPlus: React.FC<IconProps>;
  export const Users: React.FC<IconProps>;

  // W 시리즈
  export const Wrench: React.FC<IconProps>;

  // X-Z 시리즈
  export const X: React.FC<IconProps>;
  export const XCircle: React.FC<IconProps>;
  export const Zap: React.FC<IconProps>;
  export const ZoomIn: React.FC<IconProps>;
  export const ZoomOut: React.FC<IconProps>;
}
