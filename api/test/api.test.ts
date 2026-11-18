import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers.ts';

describe('Contoso API', () => {
  let api: Awaited<ReturnType<typeof startTestServer>>;
  before(async () => { api = await startTestServer(); });
  after(async () => { await api.close(); });

  test('GET /api/health returns ok', async () => {
    const res = await api.get('/api/health');
    assert.equal(res.status, 200);
    assert.equal((await res.json()).status, 'ok');
  });

  test('GET /api/members lists all synthetic members', async () => {
    const members = await (await api.get('/api/members')).json();
    assert.equal(members.length, 8);
  });

  test('GET /api/members filters by status', async () => {
    const members = await (await api.get('/api/members?status=deferred')).json();
    assert.deepEqual(members.map((m: { id: string }) => m.id), ['M-1006']);
  });

  test('GET /api/members rejects an unknown status with the error envelope', async () => {
    const res = await api.get('/api/members?status=unknown');
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'BAD_REQUEST');
  });

  test('GET /api/members/:id returns 404 for an unknown member', async () => {
    const res = await api.get('/api/members/M-9999');
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error.code, 'NOT_FOUND');
  });

  test('GET /api/members/:id/contributions returns the yearly history', async () => {
    const rows = await (await api.get('/api/members/M-1001/contributions')).json();
    assert.equal(rows.length, 10);
    assert.equal(rows[0].year, 2016);
  });

  test('GET /api/members/:id/statement for a full-time member', async () => {
    const statement = await (await api.get('/api/members/M-1001/statement')).json();
    assert.equal(statement.yearsOfService, 10);
    assert.equal(statement.currentPensionableSalary, 34_455);
    assert.equal(statement.currentYearAccrual, 602.96);
  });

  test('POST /api/projections projects at the standard retirement age', async () => {
    const res = await api.post('/api/projections', { memberId: 'M-1001' });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.retirementAge, 68);
    assert.equal(body.earlyRetirementReduction, 0);
    assert.equal(body.unreducedAnnualPension, body.projectedAnnualPension);
    assert.ok(body.projectedAnnualPension > body.accruedToDate);
  });

  test('POST /api/projections supports early retirement and returns reduction fields', async () => {
    const res = await api.post('/api/projections', { memberId: 'M-1004', retirementAge: 63 });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.earlyRetirementReduction, 0.325);
    assert.ok(typeof body.unreducedAnnualPension === 'number');
    assert.ok(body.projectedAnnualPension < body.unreducedAnnualPension);
  });

  test('POST /api/projections boundary success ages 60 and 68 return 200', async () => {
    const min = await api.post('/api/projections', { memberId: 'M-1004', retirementAge: 60 });
    const max = await api.post('/api/projections', { memberId: 'M-1004', retirementAge: 68 });
    assert.equal(min.status, 200);
    assert.equal(max.status, 200);
  });

  test('POST /api/projections age 59 and 69 return 422 envelope', async () => {
    const tooLow = await api.post('/api/projections', { memberId: 'M-1004', retirementAge: 59 });
    const tooHigh = await api.post('/api/projections', { memberId: 'M-1004', retirementAge: 69 });
    assert.equal(tooLow.status, 422);
    assert.equal(tooHigh.status, 422);
    assert.equal((await tooLow.json()).error.code, 'UNPROCESSABLE');
    assert.equal((await tooHigh.json()).error.code, 'UNPROCESSABLE');
  });

  test('POST /api/projections retirement age below current age returns 422 envelope', async () => {
    const res = await api.post('/api/projections', { memberId: 'M-1006', retirementAge: 60 });
    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.error.code, 'UNPROCESSABLE');
  });

  test('POST /api/projections rejects non-integer retirementAge with 400', async () => {
    const res = await api.post('/api/projections', { memberId: 'M-1004', retirementAge: 63.5 });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'BAD_REQUEST');
  });

  test('POST /api/projections validates the body', async () => {
    const res = await api.post('/api/projections', {});
    assert.equal(res.status, 400);
    assert.deepEqual((await res.json()).error.details, ['memberId is required']);
  });

  test('POST /api/service-requests creates an open request', async () => {
    const res = await api.post('/api/service-requests', {
      memberId: 'M-1002', category: 'address-change', subject: 'New address', description: 'Moved to Assen',
    });
    assert.equal(res.status, 201);
    const created = await res.json();
    assert.equal(created.status, 'open');
    assert.match(created.id, /^SR-\d+$/);
  });

  test('GET /api/service-requests filters by status', async () => {
    const open = await (await api.get('/api/service-requests?status=closed')).json();
    assert.deepEqual(open.map((r: { id: string }) => r.id), ['SR-5002']);
  });

  test('unknown API route returns 404 envelope', async () => {
    const res = await api.get('/api/unknown');
    assert.equal(res.status, 404);
  });
});
