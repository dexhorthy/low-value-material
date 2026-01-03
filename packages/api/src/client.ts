import type { RouterClient } from "@orpc/server";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { router } from "./index";

export function createClient(url: string = "http://localhost:3001/rpc") {
  const link = new RPCLink({ url });
  return createORPCClient(link) as RouterClient<typeof router>;
}

export type Client = ReturnType<typeof createClient>;
