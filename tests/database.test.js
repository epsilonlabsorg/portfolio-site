import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("migration enforces privacy, idempotency, constraints and atomic submission limits", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  // Match the Supabase roles relevant to this migration, using real Postgres.
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon, authenticated, service_role;",
  );
  await db.exec(
    await readFile(
      new URL(
        "../supabase/migrations/20260911000000_contact_enquiries.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const submit = async (
    id = crypto.randomUUID(),
    hash = "a".repeat(64),
    message = "Synthetic database enquiry.",
  ) => {
    const result = await db.query(
      "select public.submit_contact_enquiry($1, $2, $3, $4, $5, $6, $7) as result",
      [
        id,
        "Test visitor",
        "test@example.com",
        "",
        "AI assistants",
        message,
        hash,
      ],
    );
    return result.rows[0].result;
  };
  const count = async () =>
    (
      await db.query(
        "select count(*)::int as count from public.contact_enquiries",
      )
    ).rows[0].count;

  await t.test(
    "anonymous and authenticated roles cannot read, insert or execute the RPC",
    async () => {
      for (const role of ["anon", "authenticated"]) {
        await db.exec(`set role ${role}`);
        await assert.rejects(
          db.query("select * from public.contact_enquiries"),
          /permission denied/,
        );
        await assert.rejects(
          db.query("select * from public.contact_rate_limits"),
          /permission denied/,
        );
        await assert.rejects(
          db.query(
            "insert into public.contact_enquiries (id, name, email, message) values (gen_random_uuid(), 'Test', 'test@example.com', 'Synthetic enquiry.')",
          ),
          /permission denied/,
        );
        await assert.rejects(submit(), /permission denied/);
        await db.exec("reset role");
      }
      const tables = await db.query(
        "select relrowsecurity from pg_class where relname in ('contact_enquiries', 'contact_rate_limits')",
      );
      assert.equal(tables.rows.length, 2);
      assert.ok(tables.rows.every((row) => row.relrowsecurity));
    },
  );
  await db.exec("set role service_role");
  await t.test(
    "retries deduplicate and do not spend another rate-limit slot",
    async () => {
      const id = crypto.randomUUID();
      assert.equal(await submit(id), "stored");
      assert.equal(await submit(id), "stored");
      assert.equal(await count(), 1);
    },
  );
  await t.test(
    "invalid data rolls back, and the fourth enquiry per email is blocked",
    async () => {
      await assert.rejects(
        submit(crypto.randomUUID(), "a".repeat(64), "short"),
        /check constraint/,
      );
      assert.equal(await submit(), "stored");
      assert.equal(await submit(), "stored");
      assert.equal(await submit(), "rate_limited");
      assert.equal(await count(), 3);
    },
  );
  await t.test("global limit stops alternate-email bypass", async () => {
    for (let index = 0; index < 97; index++) {
      assert.equal(
        await submit(crypto.randomUUID(), index.toString(16).padStart(64, "0")),
        "stored",
      );
    }
    assert.equal(
      await submit(crypto.randomUUID(), "b".repeat(64)),
      "rate_limited",
    );
    assert.equal(await count(), 100);
  });
  await t.test(
    "old windows do not block new submissions and stale buckets are cleaned",
    async () => {
      await db.exec(
        "update public.contact_rate_limits set window_start = window_start - interval '2 days'",
      );
      assert.equal(await submit(), "stored");
      const old = await db.query(
        "select count(*)::int as count from public.contact_rate_limits where window_start < date_trunc('hour', now())",
      );
      assert.equal(old.rows[0].count, 0);
    },
  );
});
