import { RestService } from "../../../src/services";

export const restError = () => {
  describe("RestService", () => {
    let rest: RestService;

    beforeAll(() => {
      rest = new RestService("https://jsonplaceholder.typicode.com");
    });

    test("init", () => {
      expect(rest).toBeDefined();
    });

    describe("execRest()", () => {
      describe("when called", () => {
        let response: any;
        beforeAll(async () => {
          response = await rest.execRest("/posts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
        });
        it("should return response", () => {
          expect(response).toBeTruthy();
        });
      });

      describe("when error", () => {
        let error: any;
        beforeAll(async () => {
          await rest
            .execRest("/postzzz", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            })
            .catch((_error) => {
              error = _error;
            });
        });
        it("should return response", () => {
          expect(error.message).toBe("Not Found");
        });
      });
    });
  });
};
