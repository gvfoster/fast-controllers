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
