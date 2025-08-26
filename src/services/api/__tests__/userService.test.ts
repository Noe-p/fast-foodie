import { UserApiService } from "../userService";
import { HttpService } from "../../httpService";
import { API_ROUTES } from "../../apiRoutes";
import type { User } from "@/types/dto/User";
import type { UpdateUserApi } from "@/types";

jest.mock("../../httpService", () => ({
  HttpService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("UserApiService", () => {
  const http = HttpService as unknown as {
    get: jest.Mock;
    post: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
  };

  const makeUser = (overrides?: Partial<User>): User => ({
    id: "u-1",
    userName: "John",
    profilePicture: undefined,
    collaborators: [],
    collabSend: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => jest.clearAllMocks());

  it("me() → route et data", async () => {
    const user: User = makeUser();
    http.get.mockResolvedValueOnce({ status: 200, data: user });
    const result = await UserApiService.me();
    expect(http.get).toHaveBeenCalledWith(API_ROUTES.users.me);
    expect(result).toEqual(user);
  });

  it("updateMe() → route+payload et data", async () => {
    const payload: UpdateUserApi = { userName: "Jane" } as UpdateUserApi;
    const updated: User = makeUser({ userName: "Jane" });
    http.patch.mockResolvedValueOnce({ status: 200, data: updated });
    const result = await UserApiService.updateMe(payload);
    expect(http.patch).toHaveBeenCalledWith(API_ROUTES.users.update, payload);
    expect(result).toEqual(updated);
  });

  it("deleteMe() → route", async () => {
    http.delete.mockResolvedValueOnce({ status: 204, data: undefined });
    await UserApiService.deleteMe();
    expect(http.delete).toHaveBeenCalledWith(API_ROUTES.users.delete);
  });
});
