import { describe, expect, it } from "vitest";
import { oauthReturnPath } from "./oauth-return-path";

describe("OAuth return paths", () => {
  it("preserves the consent authorization id, query and fragment", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=request-123&state=ready#approve"))
      .toBe("/.lovable/oauth/consent?authorization_id=request-123&state=ready#approve");
  });
  it.each(["//outside.invalid", "/\\outside.invalid", "https://outside.invalid", "/login\n", "/login\u0000", null])("rejects unsafe return paths: %s", value => {
    expect(oauthReturnPath(value)).toBe("/dashboard");
  });
  it("canonicalizes once without decoding query parameters again", () => {
    expect(oauthReturnPath("/a/../.lovable/oauth/consent?authorization_id=a%2Fb"))
      .toBe("/.lovable/oauth/consent?authorization_id=a%2Fb");
  });
});