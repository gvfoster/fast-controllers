import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
/**
 * FastControllers Fastify Plugin
 * This plugin allows for defining, and registering routes through
 * the user defined controllers directory structure
 *
 * ```
 * // example usage
 * fastify.register(fastControllers, { path: 'path to projects controller directory' } )
 * ```
 * @param instance - The provided Fastify Instance
 * @param options  - The provided Fastify options object
 * @param done     - The plugin done callback
 */
declare function fastControllers(instance: FastifyInstance, options: FastifyPluginOptions & {
    path: string;
}, done: (err?: Error) => void): Promise<void>;
export default fastControllers;
