import { createContext } from 'react';
import type { AppState } from '../../types/appStateTypes';

export const AppContext = createContext<AppState>({chat_list: []});
export const AppDispatchContext = createContext({});
