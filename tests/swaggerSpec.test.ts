import { test } from 'node:test';
import assert from 'node:assert/strict';
import Fastify, { FastifyRequest, FastifyReply, RouteOptions } from 'fastify';
import fastifySwagger from '@fastify/swagger';

import FastController from '../src/FastController';
import { prepareController } from '../src/fastControllers';

/**
 * Mirrors the DTL API FavoriteCompany controller shape:
 * get at /favoritecompany, put/delete at /favoritecompany/:companyId
 */
class FavoriteCompany extends FastController {
    constructor(instance: any = {}) {
        super(instance, '/favoritecompany');
    }

    override schema = {
        operationId: {
            get: 'companySettingsFavoriteCompanyList',
            put: 'companySettingsFavoriteCompanyAdd',
            delete: 'companySettingsFavoriteCompanyRemove'
        },
        summary: {
            get: 'List favorite companies',
            put: 'Add a favorite company',
            delete: 'Remove a favorite company'
        },
        params: {
            put: { type: 'object', properties: { companyId: { type: 'string' } } },
            delete: { type: 'object', properties: { companyId: { type: 'string' } } }
        },
        response: {
            get: { 200: { type: 'array', items: { type: 'string' } } },
            put: { 200: { type: 'object', properties: { added: { type: 'boolean' } } } },
            delete: { 200: { type: 'object', properties: { removed: { type: 'boolean' } } } }
        }
    };

    override params = {
        put: ['companyId'],
        delete: ['companyId']
    };

    override async get(request: FastifyRequest, reply: FastifyReply) {
        return [];
    }

    override async put(request: FastifyRequest, reply: FastifyReply) {
        return { added: true };
    }

    override async delete(request: FastifyRequest, reply: FastifyReply) {
        return { removed: true };
    }
}

class ScalarOperationId extends FastController {
    constructor(instance: any = {}) {
        super(instance, '/scalar');
    }

    override schema = {
        operationId: 'scalarOp',
        response: {
            get: { 200: { type: 'object', properties: { ok: { type: 'boolean' } } } },
            post: { 200: { type: 'object', properties: { ok: { type: 'boolean' } } } }
        }
    };

    override async get(request: FastifyRequest, reply: FastifyReply) {
        return { ok: true };
    }

    override async post(request: FastifyRequest, reply: FastifyReply) {
        return { ok: true };
    }
}

/**
 * Build a Fastify instance with @fastify/swagger and register one route per
 * controller method, exactly the way the fastControllers plugin does it.
 */
async function buildSpec(ControllerClass: new (instance: any) => FastController) {

    const instance = Fastify();
    await instance.register(fastifySwagger, {
        openapi: { info: { title: 'test', version: '1.0.0' } }
    });

    const methods = new ControllerClass(instance).methods;
    methods.forEach(method => {
        instance.route(prepareController(new ControllerClass(instance), method) as RouteOptions);
    });

    await instance.ready();
    const spec = instance.swagger() as any;
    await instance.close();

    return spec;
}

test('OpenAPI spec contains distinct per-method operationIds from a method-keyed schema', async () => {
    const spec = await buildSpec(FavoriteCompany);

    assert.equal(spec.paths['/favoritecompany'].get.operationId, 'companySettingsFavoriteCompanyList');
    assert.equal(spec.paths['/favoritecompany/{companyId}'].put.operationId, 'companySettingsFavoriteCompanyAdd');
    assert.equal(spec.paths['/favoritecompany/{companyId}'].delete.operationId, 'companySettingsFavoriteCompanyRemove');

    assert.equal(spec.paths['/favoritecompany'].get.summary, 'List favorite companies');
    assert.equal(spec.paths['/favoritecompany/{companyId}'].put.summary, 'Add a favorite company');
    assert.equal(spec.paths['/favoritecompany/{companyId}'].delete.summary, 'Remove a favorite company');

    // All operationIds in the spec are unique
    const operationIds = Object.values(spec.paths)
        .flatMap((path: any) => Object.values(path).map((op: any) => op.operationId));
    assert.equal(new Set(operationIds).size, operationIds.length);
});

test('OpenAPI spec copies a scalar operationId onto every route unchanged (backward compat)', async () => {
    const spec = await buildSpec(ScalarOperationId);

    assert.equal(spec.paths['/scalar'].get.operationId, 'scalarOp');
    assert.equal(spec.paths['/scalar'].post.operationId, 'scalarOp');
});
