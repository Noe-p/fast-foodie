import { render, screen, fireEvent } from "@testing-library/react";
import { DishesCard } from "../DishesCard";
import type { Dish } from "@/types/dto/Dish";
import { DishStatus } from "@/types";

const mockMutate = jest.fn();
let mockWeeklyData: Dish[] = [];
jest.mock("@/hooks/useWeeklyDishes", () => ({
  useWeeklyDishes: () => ({ data: mockWeeklyData }),
  useSetWeeklyDishes: () => ({ mutate: mockMutate }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

jest.mock("@/components", () => ({
  ColCenter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  H2: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  ImageLoader: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock("@/container/components/Drawers", () => ({
  DrawerDetailDish: () => null,
}));

const makeDish = (overrides?: Partial<Dish>): Dish => ({
  id: "1",
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "Pâtes carbonara",
  ingredients: [],
  chef: {
    id: "u1",
    createdAt: new Date(),
    updatedAt: new Date(),
    userName: "chef",
    collaborators: [],
    collabSend: [],
  },
  tags: ["italien"],
  images: [],
  weeklyDish: false,
  status: DishStatus.PUBLIC,
  ration: 2,
  ...overrides,
});

describe("DishesCard", () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockWeeklyData = [];
  });
  it("affiche le nom du plat", () => {
    const dish = makeDish();
    render(<DishesCard dish={dish} />);
    expect(
      screen.getByRole("heading", { name: dish.name })
    ).toBeInTheDocument();
  });

  it("affiche un bouton d'ajout au planning hebdo et gère le clic", () => {
    const dish = makeDish();
    render(<DishesCard dish={dish} />);
    const btn = document.querySelector(
      'div[class*="rounded-full"][class*="h-10"][class*="w-10"]'
    ) as HTMLElement;
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(
      screen.getByRole("heading", { name: dish.name })
    ).toBeInTheDocument();
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith([dish]);
  });

  it("retire le plat du planning si déjà présent", () => {
    const dish = makeDish({ id: "42", name: "Salade" });
    mockWeeklyData = [dish];

    render(<DishesCard dish={dish} />);
    const btn = document.querySelector(
      'div[class*="rounded-full"][class*="h-10"][class*="w-10"]'
    ) as HTMLElement;
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(mockMutate).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenLastCalledWith([]);
  });
});
