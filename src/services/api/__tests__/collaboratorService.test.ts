import { CollaboratorApiService } from "../collaboratorService";
import { HttpService } from "../../httpService";
import { API_ROUTES } from "../../apiRoutes";
import {
  CollaboratorType,
  CollaboratorStatus,
  type CollaboratorDto,
  type CreateCollaboratorApi,
  type UpdateCollaboratorApi,
} from "@/types";
import type { User } from "@/types/dto/User";

jest.mock("../../httpService", () => ({
  HttpService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
  },
}));

describe("CollaboratorApiService", () => {
  const http = HttpService as unknown as {
    get: jest.Mock;
    post: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
    put: jest.Mock;
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

  const makeCollab = (
    overrides?: Partial<CollaboratorDto>
  ): CollaboratorDto => ({
    id: "c-1",
    status: CollaboratorStatus.IS_PENDING,
    type: CollaboratorType.FULL_ACCESS,
    collaborator: makeUser(),
    sender: makeUser(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => jest.clearAllMocks());

  it("sendAsk() → post sur la bonne route avec payload", async () => {
    const body: CreateCollaboratorApi = {
      userName: "jane",
      type: CollaboratorType.FULL_ACCESS,
    };
    const data = makeCollab();
    http.post.mockResolvedValueOnce(data);
    const res = await CollaboratorApiService.sendAsk(body);
    expect(http.post).toHaveBeenCalledWith(
      API_ROUTES.collaborators.sendAsk,
      body
    );
    expect(res).toEqual(data);
  });

  it("remove() → delete sur la bonne route", async () => {
    http.delete.mockResolvedValueOnce({ status: 204, data: undefined });
    await CollaboratorApiService.remove("id1");
    expect(http.delete).toHaveBeenCalledWith(
      API_ROUTES.collaborators.delete("id1")
    );
  });

  it("accept() → post sur la bonne route", async () => {
    const data = makeCollab({ status: CollaboratorStatus.IS_ACCEPTED });
    http.post.mockResolvedValueOnce(data);
    const res = await CollaboratorApiService.accept("id2");
    expect(http.post).toHaveBeenCalledWith(
      API_ROUTES.collaborators.accept("id2")
    );
    expect(res).toEqual(data);
  });

  it("update() → put sur la bonne route avec payload", async () => {
    const body: UpdateCollaboratorApi = { type: CollaboratorType.FULL_ACCESS };
    const data = makeCollab({ type: CollaboratorType.FULL_ACCESS });
    http.put.mockResolvedValueOnce(data);
    const res = await CollaboratorApiService.update("id3", body);
    expect(http.put).toHaveBeenCalledWith(
      API_ROUTES.collaborators.update("id3"),
      body
    );
    expect(res).toEqual(data);
  });
});
