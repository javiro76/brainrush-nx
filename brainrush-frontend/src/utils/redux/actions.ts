import {ActionCreatorWithPayload} from '@reduxjs/toolkit';

export const isActionOf = (action: any, reducer: ActionCreatorWithPayload<any>) => {
    return action?.type === reducer.type;
};
