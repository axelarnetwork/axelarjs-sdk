import { RestService } from "../RestService";
import crossFetch from "cross-fetch";

jest.mock("cross-fetch", () => {
  //Mock the default export
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe("AxelarQueryAPI", () => {
  const host = "http://localhost:4000";
  const api = new RestService(host);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    test("It should get a proper GET response", async () => {
      (crossFetch as jest.Mock).mockResolvedValue({
        status: 200,
        ok: true,
        json: () => ({
          foo: "bar",
        }),
      });
      await api.get("/").then((res) => {
        expect(res.foo).toEqual("bar");
      });
    });
    test("It should catch", async () => {
      (crossFetch as jest.Mock).mockRejectedValueOnce(new Error("network error"));
      await expect(api.get("/")).rejects.toMatchObject({
        message: "AxelarJS-SDK uncaught post error",
        uncaught: true,
        fullMessage: "network error",
      });
    });
  });
});
