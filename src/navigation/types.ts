import { MediaType } from '../store/libraryStore';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Profile: undefined;
  AiCoach: undefined;
  Discovery: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Detail: { id: number; mediaType: MediaType };
  PublicProfile: { uid: string };
  SharedList: { uid: string; listId: string };
};
