import { createContactHandler } from "./handler.js";

Deno.serve(createContactHandler({ env: (name: string) => Deno.env.get(name) }));
