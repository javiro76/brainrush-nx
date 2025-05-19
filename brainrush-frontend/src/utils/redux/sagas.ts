import { AxiosError } from "axios";


export const extractErrorInfo = (error: unknown): {
  originalMessage: string | undefined;
  statusCode: number;
  isNetworkError: boolean;
} => {
  let originalMessage: string | undefined = undefined; // Mensaje original del error
  let statusCode = 500; // Código por defecto
  let isNetworkError = false;

  console.log('Error original recibido en extractErrorInfo:', error);

  if (error && typeof error === 'object') {
    const axiosError = error as AxiosError;
    console.log('¿Es error de Axios?', 'isAxiosError' in error);
    console.log('Propiedades del error:', Object.keys(error));

    // Mejor detección de errores de respuesta con código de estado HTTP
    if (axiosError.response) {
      // Error de respuesta del servidor (tiene código de estado HTTP)
      statusCode = axiosError.response.status;
      console.log('Código HTTP detectado:', statusCode);

      // Extraer el mensaje original del servidor
      if (axiosError.response.data && typeof axiosError.response.data === 'object') {
        const responseData = axiosError.response.data as Record<string, unknown>;
        if (responseData.message && typeof responseData.message === 'string') {
          originalMessage = responseData.message;
        } else if (typeof responseData.error === 'string') {
          originalMessage = responseData.error;
        }
        console.log('Datos de respuesta:', responseData);
      }
    } else if (axiosError.message) {
      // Error con mensaje pero sin respuesta HTTP (por ejemplo, error de red)
      originalMessage = axiosError.message;

      // Verificar si es realmente un error de red
      isNetworkError = (
        axiosError.code === 'ECONNABORTED' ||
        axiosError.code === 'ETIMEDOUT' ||
        axiosError.code === 'ERR_NETWORK' ||
        axiosError.message.includes('network') ||
        axiosError.message.includes('connection')
      );
    }
  }

  return {
    originalMessage,
    statusCode,
    isNetworkError
  };
};
