# Expectation Testing
Jest is the unit-testing and expectation library. The tests use assertions such as:
```js
expect(res.status).toHaveBeenCalledWith(403);
expect(next).toHaveBeenCalledTimes(1);
expect(hash).toMatch(/^[a-f0-9]{64}$/);
expect(result.notificationsCreated).toBe(1);
expect(response.body.totalCompanies).toBe(2);
```
These expectations cover controller results, authorization, tenant isolation, audit sanitization/hash behavior, export behavior, zero-activity behavior, notifications and endpoint wiring.
