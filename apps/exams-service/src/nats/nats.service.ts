import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, catchError, timeout, throwError } from 'rxjs';

@Injectable()
export class NatsService {
    private readonly logger = new Logger(NatsService.name);

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    /**
     * Envía un mensaje y espera respuesta
     */
    send<T = any>(pattern: string, data: any): Observable<T> {
        this.logger.debug(`Sending message with pattern: ${pattern}`);

        return this.natsClient.send<T>(pattern, data).pipe(
            timeout(5000), // 5 segundos timeout
            catchError((error) => {
                this.logger.error(`Error sending message: ${pattern}`, error);
                return throwError(() => error);
            }),
        );
    }

    /**
     * Emite un evento sin esperar respuesta
     */
    emit(pattern: string, data: any): Observable<any> {
        this.logger.debug(`Emitting event with pattern: ${pattern}`);

        return this.natsClient.emit(pattern, data).pipe(
            catchError((error) => {
                this.logger.error(`Error emitting event: ${pattern}`, error);
                return throwError(() => error);
            }),
        );
    }

    /**
     * Patrones de comunicación con auth-service
     */
    validateToken(token: string): Observable<any> {
        return this.send('auth.validate.token', { token });
    }

    getUserById(userId: string): Observable<any> {
        return this.send('auth.user.findById', { id: userId });
    }

    /**
     * Patrones de comunicación con content-service
     */
    getContent(contentId: string): Observable<any> {
        return this.send('content.findById', { id: contentId });
    }

    getQuestionsByContent(contentId: string): Observable<any> {
        return this.send('content.questions.findByContent', { contentId });
    }

    /**
     * Eventos para notificaciones
     */
    emitExamStarted(examData: any): Observable<any> {
        return this.emit('exam.started', examData);
    }

    emitExamSubmitted(examData: any): Observable<any> {
        return this.emit('exam.submitted', examData);
    }

    emitExamCompleted(examData: any): Observable<any> {
        return this.emit('exam.completed', examData);
    }
}
