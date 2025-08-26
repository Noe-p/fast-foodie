import { FoodApiService } from "../foodService";
import { HttpService } from "../../httpService";
import { API_ROUTES } from "../../apiRoutes";
import type { Food } from "@/types/dto/Food";
import type { CreateFoodApi, UpdateFoodApi } from "@/types";

jest.mock("../../httpService", () => ({
  HttpService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("FoodApiService", () => {
  const http = HttpService as unknown as {
    get: jest.Mock;
    post: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
  };

  const makeFood = (overrides?: Partial<Food>): Food => ({
    id: "food-1",
    name: "Riz",
    icon: "🍚",
    aisle: "A",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => jest.clearAllMocks());

  it("get() → route et data", async () => {
    const foods: Food[] = [makeFood({ id: "1" })];
    http.get.mockResolvedValueOnce({ status: 200, data: foods });
    const result = await FoodApiService.get();
    expect(http.get).toHaveBeenCalledWith(API_ROUTES.foods.get);
    expect(result).toEqual(foods);
  });

  it("create() → route+payload et data", async () => {
    const payload: CreateFoodApi = {
      name: "Pâtes",
      icon: "🍝",
      aisle: "B",
    } as CreateFoodApi;
    const created: Food = makeFood({
      id: "2",
      name: "Pâtes",
      icon: "🍝",
      aisle: "B",
    });
    http.post.mockResolvedValueOnce({ status: 201, data: created });
    const result = await FoodApiService.create(payload);
    expect(http.post).toHaveBeenCalledWith(API_ROUTES.foods.create, payload);
    expect(result).toEqual(created);
  });

  it("update() → route(id)+payload et data", async () => {
    const payload: UpdateFoodApi = { name: "Riz basmati" } as UpdateFoodApi;
    const updated: Food = makeFood({ id: "1", name: "Riz basmati" });
    http.patch.mockResolvedValueOnce({ status: 200, data: updated });
    const result = await FoodApiService.update(payload, "1");
    expect(http.patch).toHaveBeenCalledWith(
      API_ROUTES.foods.update("1"),
      payload
    );
    expect(result).toEqual(updated);
  });

  it("remove() → route(id)", async () => {
    http.delete.mockResolvedValueOnce({ status: 204, data: undefined });
    await FoodApiService.remove("1");
    expect(http.delete).toHaveBeenCalledWith(API_ROUTES.foods.delete("1"));
  });
});
