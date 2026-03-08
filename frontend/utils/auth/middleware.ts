import { type NextRequest, NextResponse } from "next/server"

/** Session được lưu cookie gather_clone_token. */
export const updateSession = async (request: NextRequest) => {
  return NextResponse.next({
    request: { headers: request.headers },
  })
}
