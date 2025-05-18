import {ActionCreatorWithPayload} from '@reduxjs/toolkit';

export const isActionOf = <T>(resultActionType: string | undefined, actionCreator: ActionCreatorWithPayload<T, string>) => {
    return resultActionType === actionCreator.type;
};
