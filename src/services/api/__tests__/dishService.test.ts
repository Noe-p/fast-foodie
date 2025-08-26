import { DishApiService } from "../dishService";
import { HttpService } from "../../httpService";
import { API_ROUTES } from "../../apiRoutes";
import { Dish } from "@/types/dto/Dish";
import { User } from "@/types/dto/User";
import { CreateDishApi, UpdateDishApi, DishStatus } from "@/types";

jest.mock("../../httpService", () => ({
  HttpService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("DishApiService", () => {
  const http = HttpService as unknown as {
    get: jest.Mock;
    post: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
  };

  const makeUser = (overrides?: Partial<User>): User => ({
    id: "user-1",
    userName: "Chef",
    profilePicture: undefined,
    collaborators: [],
    collabSend: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const makeDish = (overrides?: Partial<Dish>): Dish => ({
    id: "dish-1",
    name: "Pâtes",
    instructions: undefined,
    ingredients: [],
    chef: makeUser(),
    tags: [],
    images: [],
    weeklyDish: false,
    status: DishStatus.PUBLIC,
    ration: 2,
    favoriteImage: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("get() → route correcte et data retournée", async () => {
    const dishes: Dish[] = [makeDish({ id: "1" })];
    http.get.mockResolvedValueOnce({ status: 200, data: dishes });

    const result = await DishApiService.get();

    expect(http.get).toHaveBeenCalledWith(API_ROUTES.dishes.get);
    expect(result).toEqual(dishes);
  });

  it("create() → route + payload, retourne created Dish", async () => {
    const payload: CreateDishApi = {
      name: "Riz",
      ingredients: [],
      status: DishStatus.PUBLIC,
      weeklyDish: false,
      ration: 2,
    };
    const created: Dish = makeDish({ id: "abc", name: "Riz" });
    http.post.mockResolvedValueOnce({ status: 201, data: created });

    const result = await DishApiService.create(payload);

    expect(http.post).toHaveBeenCalledWith(API_ROUTES.dishes.create, payload);
    expect(result).toEqual(created);
  });

  it("update() → route avec id + payload, retourne updated Dish", async () => {
    const payload: UpdateDishApi = { name: "Riz cantonnais" };
    const updated: Dish = makeDish({ id: "def", name: "Riz cantonnais" });
    http.patch.mockResolvedValueOnce({ status: 200, data: updated });

    const result = await DishApiService.update(payload, "def");

    expect(http.patch).toHaveBeenCalledWith(
      API_ROUTES.dishes.update("def"),
      payload
    );
    expect(result).toEqual(updated);
  });

  it("remove() → route avec id", async () => {
    http.delete.mockResolvedValueOnce({ status: 204, data: undefined });

    await DishApiService.remove("xyz");

    expect(http.delete).toHaveBeenCalledWith(API_ROUTES.dishes.delete("xyz"));
  });

  it("getTags() → route tags et data", async () => {
    const tags: string[] = ["rapide", "végétarien"];
    http.get.mockResolvedValueOnce({ status: 200, data: tags });

    const result = await DishApiService.getTags();

    expect(http.get).toHaveBeenCalledWith(API_ROUTES.dishes.getTags);
    expect(result).toEqual(tags);
  });

  it("deleteTag() → route avec tag", async () => {
    http.delete.mockResolvedValueOnce({ status: 204, data: undefined });

    await DishApiService.deleteTag("rapide");

    expect(http.delete).toHaveBeenCalledWith(
      API_ROUTES.dishes.deleteTag("rapide")
    );
  });
});
