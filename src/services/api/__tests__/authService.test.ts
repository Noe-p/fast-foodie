import { AuthApiService } from "../authService";
import { HttpService } from "../../httpService";
import { API_ROUTES } from "../../apiRoutes";
import type { AuthLoginApi, RegisterApi } from "@/types";

jest.mock("../../httpService", () => ({
  HttpService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("AuthApiService", () => {
  const http = HttpService as unknown as {
    get: jest.Mock;
    post: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => jest.clearAllMocks());

  it("register() → envoie payload et retourne access_token", async () => {
    const payload: RegisterApi = { userName: "john", password: "x" };
    http.post.mockResolvedValueOnce({
      status: 201,
      data: { access_token: "tok" },
    });
    const token = await AuthApiService.register(payload);
    expect(http.post).toHaveBeenCalledWith(API_ROUTES.auth.register, payload);
    expect(token).toBe("tok");
  });

  it("login() → envoie payload et retourne access_token", async () => {
    const payload: AuthLoginApi = { login: "john", password: "x" };
    http.post.mockResolvedValueOnce({
      status: 200,
      data: { access_token: "tok2" },
    });
    const token = await AuthApiService.login(payload);
    expect(http.post).toHaveBeenCalledWith(API_ROUTES.auth.login, payload);
    expect(token).toBe("tok2");
  });
});
