// Navigation 타입 정의
export type RootStackParamList = {
  Home: undefined;
  ActiveDelivery: { id: string };
  DeliveryHistory: undefined;
  Schedule: undefined;
  Profile: undefined;
  EditProfile: { field?: string };
  LocationScreen: undefined;
  Settings: { section?: string };
  DeliveryDetail: { id: string };
  MapView: { deliveryId: string };
  CustomerChat: { deliveryId: string };
  ReportIssue: { deliveryId: string };
  EarningsDetail: { period: string };
  Support: undefined;
  About: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
