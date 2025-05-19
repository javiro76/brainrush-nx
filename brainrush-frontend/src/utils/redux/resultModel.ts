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
   * HTTP status code
   */
  statusCode?: number;

  /**
   * message internal
   */
  messageInternal?: string;

  /**
   * message internal
   */
  messageUser?: string;
  /**
   * is network error
   */
  isNetworkError?: boolean;

}
