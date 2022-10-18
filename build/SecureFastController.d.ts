import type { FastifyReply, FastifyRequest } from 'fastify';
import FastController from './FastController';
declare class SecureFastController extends FastController {
    static scope: string;
    onPreValidation(request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void): void;
}
export default SecureFastController;
