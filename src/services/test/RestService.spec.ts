import { RestService } from "../RestService";
import fetch from "cross-fetch";
import HttpError from "standard-http-error";

const mockedFetch = fetch as jest.Mock;

jest.mock("cross-fetch", () => {
  // Mock the default export
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe("RestService", () => {
  const host = "http://localhost:3000";
  const api = new RestService(host);

  beforeEach(() => {
    jest.clearAllMocks();
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
