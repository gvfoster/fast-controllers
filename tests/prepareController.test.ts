import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FastifyRequest, FastifyReply } from 'fastify';

import FastController from '../src/FastController';
import { prepareController } from '../src/fastControllers';

// create minimal fake fastify instance
const instance: any = {};

class DummyController extends FastController {
    constructor() {
        super(instance, '/dummy');
    }

    // Add a get method to satisfy FastController requirements
    override async get(request: FastifyRequest, reply: FastifyReply) {
        return { result: 'test' };
    }
}

class MultiMethodController extends FastController {
    constructor() {
        super(instance, '/multi');
    }

    override async get(request: FastifyRequest, reply: FastifyReply) {
        return { result: 'list' };
    }

    override async put(request: FastifyRequest, reply: FastifyReply) {
        return { result: 'add' };
    }

    override async delete(request: FastifyRequest, reply: FastifyReply) {
        return { result: 'remove' };
    }
}

test('prepareController sets method, url and schema for GET', () => {
    const controller = new DummyController();

    controller.params = { get: ['id'] };
    controller.schema = {
        params: {
            get: { type: 'object', properties: { id: { type: 'string' } } }
        },
        querystring: {
            get: { type: 'object', properties: { q: { type: 'string' } } }
        },
        response: {
            get: { 200: { type: 'object', properties: { result: { type: 'string' } } } },
            post: { 200: { type: 'object', properties: { data: { type: 'string' } } } }
        },
        body: {
            post: { type: 'object', properties: { name: { type: 'string' } } }
        }
    };

    const result = prepareController(controller, 'GET');

    assert.equal(result.method, 'GET');
    assert.equal(result.url, '/dummy/:id');
    assert.deepEqual(result.schema?.params, { type: 'object', properties: { id: { type: 'string' } } });
    assert.deepEqual(result.schema?.querystring, { type: 'object', properties: { q: { type: 'string' } } });
    assert.deepEqual(result.schema?.response, { 200: { type: 'object', properties: { result: { type: 'string' } } } });
    assert.equal(result.schema?.body, undefined);
});

test('prepareController narrows a method-keyed operationId to the current method', () => {
    const operationId = {
        get: 'favoriteCompanyList',
        put: 'favoriteCompanyAdd',
        delete: 'favoriteCompanyRemove'
    };

    const getResult = prepareController(Object.assign(new MultiMethodController(), { schema: { operationId: { ...operationId } } }), 'GET');
    const putResult = prepareController(Object.assign(new MultiMethodController(), { schema: { operationId: { ...operationId } } }), 'PUT');
    const deleteResult = prepareController(Object.assign(new MultiMethodController(), { schema: { operationId: { ...operationId } } }), 'DELETE');

    assert.equal(getResult.schema?.operationId, 'favoriteCompanyList');
    assert.equal(putResult.schema?.operationId, 'favoriteCompanyAdd');
    assert.equal(deleteResult.schema?.operationId, 'favoriteCompanyRemove');
});

test('prepareController removes a method-keyed operationId when the current method has no entry', () => {
    const controller = new MultiMethodController();

    controller.schema = {
        operationId: {
            get: 'favoriteCompanyList'
        }
    };

    const result = prepareController(controller, 'PUT');

    assert.equal(result.schema?.hasOwnProperty('operationId'), false);
});

test('prepareController copies a scalar operationId as-is', () => {
    const controller = new MultiMethodController();

    controller.schema = {
        operationId: 'favoriteCompany'
    };

    const result = prepareController(controller, 'GET');

    assert.equal(result.schema?.operationId, 'favoriteCompany');
});

test('prepareController narrows method-keyed summary and description to the current method', () => {
    const controller = new MultiMethodController();

    controller.schema = {
        summary: {
            get: 'List favorite companies',
            put: 'Add a favorite company'
        },
        description: {
            get: 'Returns the favorite companies for the current user'
        }
    };

    const result = prepareController(controller, 'PUT');

    assert.equal(result.schema?.summary, 'Add a favorite company');
    assert.equal(result.schema?.hasOwnProperty('description'), false);
});

test('prepareController copies scalar summary and description as-is', () => {
    const controller = new MultiMethodController();

    controller.schema = {
        summary: 'Favorite companies',
        description: 'Favorite company operations'
    };

    const result = prepareController(controller, 'DELETE');

    assert.equal(result.schema?.summary, 'Favorite companies');
    assert.equal(result.schema?.description, 'Favorite company operations');
});
