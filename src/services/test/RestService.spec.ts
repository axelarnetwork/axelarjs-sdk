import { RestService } from "../RestService";
import fetch from "cross-fetch";

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
            text: () => "hello world",
          });
        });

        it("should return error", async () => {
          await expect(api.get("/")).rejects.toMatchObject({
            message: "AxelarJS-SDK uncaught post error",
            uncaught: true,
            fullMessage: "hello world",
          });
        });
      });
      describe("when json response", () => {
        beforeAll(() => {
          mockedFetch.mockRejectedValue({
            json: () => ({
              message: "Forbidden",
            }),
          });
        });

        it("should return error", async () => {
          expect(api.get("/")).rejects.toMatchObject({
            message: "AxelarJS-SDK uncaught post error",
            uncaught: true,
            fullMessage: "Forbidden",
          });
        });
      });
    });

    describe("when success", () => {
      let res: any;
      beforeAll(async () => {
        mockedFetch.mockResolvedValue({
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
