import fetch from "cross-fetch";
import HttpError from "standard-http-error";
import { Mock } from "vitest";

import { RestService } from "../RestService";

const mockedFetch = fetch as Mock;

vitest.mock("cross-fetch", () => {
  // Mock the default export
  return {
    __esModule: true,
    default: vitest.fn(),
  };
});

describe("RestService", () => {
  const host = "http://localhost:3000";
  const api = new RestService(host);

  beforeEach(() => {
    vitest.clearAllMocks();
  });

  describe("execRest()", () => {
    describe("when error", () => {
      describe("when text response", () => {
        beforeAll(() => {
          mockedFetch.mockRejectedValue({
            status: 400,
            text: () => "hello world",
          });
        });

        it("should throw error", async () => {
          const error = new HttpError(400, "hello world");
          expect(api.get("/")).rejects.toThrow(error);
        });
      });

      describe("when json response", () => {
        beforeAll(() => {
          mockedFetch.mockRejectedValue({
            status: 403,
            json: () => ({
              message: "Forbidden",
            }),
          });
        });

        it("should return error", async () => {
          const error = new HttpError(403, "Forbidden");
          expect(api.get("/")).rejects.toThrow(error);
        });
      });
    });

    describe("when success", () => {
      let res: any;
      beforeAll(async () => {
        mockedFetch.mockResolvedValue({
          status: 200,
          ok: true,
          json: () => ({ foo: "bar" }),
        });

        res = await api.get("/");
      });
      it("should return json", () => {
        expect(res.foo).toEqual("bar");
      });
    });
  });
});
