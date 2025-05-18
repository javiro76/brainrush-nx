/**
 * result model
 */
export interface ResultModel {

    /**
     * action type
     */
    actionType?: string | undefined;//indentificador de la acción

    /**
     * error
     */
    error?: boolean;

    /**
     * message internal
     */
    messageInternal?: string;

    /**
     * message internal
     */
    messageUser?: string;

}
