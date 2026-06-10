import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"

function authSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET is not configured")
  return secret
}

function createAuthProof(accessToken: string, user: string) {
  return createHmac("sha256", authSecret())
    .update(`${accessToken}\n${user}`)
    .digest("hex")
}

function verifyAuthProof(accessToken: string, user: string, proof: string) {
  const expected = Buffer.from(createAuthProof(accessToken, user), "hex")
  const received = Buffer.from(proof, "hex")

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  )
}

export { createAuthProof, verifyAuthProof }
