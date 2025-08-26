import { MediaApiService } from "../mediaService";
import { HttpService } from "../../httpService";
import { API_ROUTES } from "../../apiRoutes";
import type { MediaDto } from "@/types";

jest.mock("../../httpService", () => ({
  HttpService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("MediaApiService", () => {
  const http = HttpService as unknown as {
    get: jest.Mock;
    post: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
  };

  const makeMedia = (overrides?: Partial<MediaDto>): MediaDto => ({
    id: "m-1",
    filename: "a.jpg",
    size: 100,
    url: "https://example.com/img.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => jest.clearAllMocks());

  it("fileUpload() → post multipart avec formData", async () => {
    const file = new File(["abc"], "a.jpg", { type: "image/jpeg" });
    const media = makeMedia();
    http.post.mockResolvedValueOnce({ status: 201, data: media });
    const res = await MediaApiService.fileUpload(file);
    expect(http.post).toHaveBeenCalledWith(
      API_ROUTES.media.upload,
      expect.any(FormData),
      expect.objectContaining({
        headers: expect.any(Object),
        timeout: expect.any(Number),
      })
    );
    expect(res).toEqual(media);
  });

  it("fileRemove() → delete sur la bonne route", async () => {
    http.delete.mockResolvedValueOnce({ status: 204, data: undefined });
    await MediaApiService.fileRemove("m-1");
    expect(http.delete).toHaveBeenCalledWith(API_ROUTES.media.delete("m-1"));
  });
});
