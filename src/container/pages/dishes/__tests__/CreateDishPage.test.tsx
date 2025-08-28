import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";

jest.mock("next/router", () => ({
  __esModule: true,
  default: { push: jest.fn() },
}));

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

jest.mock("@hookform/resolvers/yup", () => ({
  yupResolver: () => () => ({ values: {}, errors: {} }),
}));

jest.mock("@/components", () => ({
  H1: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TextEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      aria-label="instructions"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  Toggle: ({
    value,
    onChange,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
  }) => <button aria-label="toggle" onClick={() => onChange(!value)} />,
  InputTags: ({
    tags,
    onChange,
  }: {
    tags: string[];
    onChange: (v: string[]) => void;
  }) => (
    <input
      aria-label="tags"
      value={(tags || []).join(",")}
      onChange={(e) => onChange(e.target.value.split(","))}
    />
  ),
}));

jest.mock("@/components/Inputs/ImageUpload", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormField: ({
    render,
    name,
    control,
    isRequired,
  }: {
    render: (args: any) => React.ReactNode;
    name?: string;
    control?: unknown;
    isRequired?: boolean;
  }) => <div>{render({ field: { value: "", onChange: () => {} } })}</div>,
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormLabel: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
  FormMessage: () => null,
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ isRemovable, isArrow, iconSize, ...props }: any) => (
    <input {...props} />
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ isLoading, disabled, ...props }: any) => (
    <button disabled={disabled} {...props} />
  ),
}));

jest.mock("@/container/components", () => ({
  CreateIngredients: () => null,
}));

let mockMutate: jest.Mock = jest.fn();
jest.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    mutate: (...args: any[]) => mockMutate(...args),
    isPending: false,
  }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock("@/validations/dish", () => ({
  dishValidation: { add: {} },
}));

jest.mock("@/contexts", () => ({
  useAppContext: () => ({ setDrawerOpen: () => {} }),
}));

// Mock pour simuler différents états de validation
const mockUseForm = jest.fn();
jest.mock("react-hook-form", () => ({
  useForm: () => mockUseForm(),
}));

// Import du composant après configuration de tous les mocks
import { CreateDishPage } from "../CreateDishPage";

describe("CreateDishPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rend le titre et le bouton submit désactivé au départ", () => {
    // Mock pour un formulaire invalide au départ
    mockUseForm.mockReturnValue({
      control: {},
      handleSubmit: (fn: any) => (e?: any) => fn(e),
      formState: { isValid: false },
      watch: () => "",
      setValue: () => {},
      reset: () => {},
    });

    act(() => {
      render(<CreateDishPage />);
    });

    expect(screen.getByRole("heading")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "dishes:create.submit" });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("active le bouton quand un champ obligatoire est rempli", () => {
    // Mock pour un formulaire valide après remplissage
    mockUseForm.mockReturnValue({
      control: {},
      handleSubmit: (fn: any) => (e?: any) => fn(e),
      formState: { isValid: true },
      watch: () => "Nom du plat",
      setValue: () => {},
      reset: () => {},
    });

    act(() => {
      render(<CreateDishPage />);
    });

    const button = screen.getByRole("button", { name: "dishes:create.submit" });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("appelle ApiService.dishes.create avec les bonnes valeurs lors de la soumission", async () => {
    mockMutate = jest.fn();
    const mockHandleSubmit = jest.fn((fn) => (e: any) => {
      e?.preventDefault?.();
      fn({ name: "Test Dish", instructions: "Test instructions" });
    });

    mockUseForm.mockReturnValue({
      control: {},
      handleSubmit: mockHandleSubmit,
      formState: { isValid: true },
      watch: () => "Test Dish",
      setValue: () => {},
      reset: () => {},
    });

    act(() => {
      render(<CreateDishPage />);
    });

    const button = screen.getByRole("button", { name: "dishes:create.submit" });

    act(() => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        name: "Test Dish",
        instructions: "Test instructions",
      });
    });
  });

  it("appelle ApiService.dishes.create avec les valeurs complètes du formulaire", async () => {
    mockMutate = jest.fn();
    const expectedValues = {
      name: "Plat Test",
      instructions: "Instructions du plat",
      ingredients: [],
      tags: ["tag1", "tag2"],
      imageIds: [],
      weeklyDish: false,
      status: "PUBLIC",
      ration: 2,
    };

    const mockHandleSubmit = jest.fn((fn) => (e: any) => {
      e?.preventDefault?.();
      fn(expectedValues);
    });

    mockUseForm.mockReturnValue({
      control: {},
      handleSubmit: mockHandleSubmit,
      formState: { isValid: true },
      watch: () => expectedValues.name,
      setValue: () => {},
      reset: () => {},
    });

    // Mock pour la mutation
    // déjà géré via mock global et variable mockMutate

    act(() => {
      render(<CreateDishPage />);
    });

    const button = screen.getByRole("button", { name: "dishes:create.submit" });

    act(() => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(expectedValues);
    });
  });
});
