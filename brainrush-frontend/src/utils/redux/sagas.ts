import { AxiosError } from "axios";


export const extractErrorInfo = (error: unknown): {
  originalMessage: string | undefined;
  statusCode: number;
  isNetworkError: boolean;
} => {
  let originalMessage: string | undefined = undefined; // Mensaje original del error
  let statusCode = 500; // Código por defecto
  let isNetworkError = false;

  if (error && typeof error === 'object') {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      // Error de respuesta del servidor (tiene código de estado HTTP)
      statusCode = axiosError.response.status;

      // Extraer el mensaje original del servidor
      if (axiosError.response.data && typeof axiosError.response.data === 'object') {
        const responseData = axiosError.response.data as Record<string, unknown>;
        if (responseData.message && typeof responseData.message === 'string') {
          originalMessage = responseData.message;
        }
      }
    } else if (axiosError.message) {
      // Error con mensaje pero sin respuesta HTTP (por ejemplo, error de red)
      originalMessage = axiosError.message;
      isNetworkError = true; // Marcar como error de red
    }
  }

  return {
    originalMessage,
    statusCode,
    isNetworkError
  };
};
