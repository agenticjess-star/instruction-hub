import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OAuthConsent from "./OAuthConsent";

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  oauth: { getAuthorizationDetails: vi.fn(), approveAuthorization: vi.fn(), denyAuthorization: vi.fn() },
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth } }));
const details = { authorization_id: "request-123", client: { id: "client-123", name: "Test agent", uri: "", logo_uri: "" }, redirect_uri: "https://client.invalid/callback", user: { id: "user-123", email: "test@example.invalid" }, scope: "" };
const open = (query = "?authorization_id=request-123") => render(<MemoryRouter initialEntries={[`/.lovable/oauth/consent${query}`]}><OAuthConsent /></MemoryRouter>);

describe("OAuth consent decisions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    auth.getSession.mockResolvedValue({ data: { session: { user: { id: "user-123" } } } });
    auth.oauth.getAuthorizationDetails.mockResolvedValue({ data: details, error: null });
  });
  afterEach(cleanup);
  it("does not call the provider without an authorization id", async () => {
    open("");
    await screen.findByRole("heading", { name: "Authorization Failed" });
    expect(auth.oauth.getAuthorizationDetails).not.toHaveBeenCalled();
  });
  it.each([true, false])("sends the exact authorization id for approve=%s and permits retry after failure", async approve => {
    const action = approve ? auth.oauth.approveAuthorization : auth.oauth.denyAuthorization;
    action.mockResolvedValue({ data: null, error: { message: "Provider unavailable" } });
    open();
    fireEvent.click(await screen.findByRole("button", { name: approve ? "Approve" : "Deny" }));
    await waitFor(() => expect(action).toHaveBeenCalledWith("request-123", { skipBrowserRedirect: true }));
    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
    await screen.findByRole("button", { name: "Approve" });
    expect(auth.oauth.getAuthorizationDetails).toHaveBeenCalledTimes(2);
  });
  it("handles expired authorization requests without allowing a decision", async () => {
    auth.oauth.getAuthorizationDetails.mockResolvedValue({ data: null, error: { message: "Authorization expired" } });
    open();
    await screen.findByRole("heading", { name: "Authorization Failed" });
    expect(auth.oauth.approveAuthorization).not.toHaveBeenCalled();
    expect(auth.oauth.denyAuthorization).not.toHaveBeenCalled();
  });
});