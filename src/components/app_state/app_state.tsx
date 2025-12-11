import { createContext } from 'react';
import type { AppState } from '../../types/appStateTypes';
import type { Dispatch } from 'react';
import type { AppAction } from '../../types/appStateTypes';

export const AppContext = createContext<AppState>({chat_list: []});
export const AppDispatchContext = createContext<Dispatch<AppAction> | undefined>(undefined);
