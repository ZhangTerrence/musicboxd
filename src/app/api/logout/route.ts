import * as context from "next/headers";
import { NextRequest } from "next/server";

import { auth } from "@/lib/lucia";

export const POST = async (request: NextRequest) => {
  const authRequest = auth.handleRequest(request.method, context);

  const session = await authRequest.validate();
  if (!session) {
    return new Response(null, { status: 401 });
  }

  await auth.invalidateSession(session.sessionId);

  authRequest.setSession(null);

  return new Response(null, { status: 200 });
};
