import { IngredientUnit, ShoppingList } from '@/types';
import { Dish } from '@/types/dto/Dish';
import { Ingredient } from '@/types/dto/Ingredient';
import clsx, { ClassValue } from 'clsx';
import { convert, Unit } from 'convert';
import { TFunction } from 'next-i18next';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

// Utilitaire pour fusionner les classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Vérifie si deux unités sont convertibles (liquide ou poids)
function areUnitsConvertible(
  unit1: IngredientUnit,
  unit2: IngredientUnit
): boolean {
  const liquidUnits = [
    IngredientUnit.MILLILITER,
    IngredientUnit.CENTILITER,
    IngredientUnit.LITER,
  ];
  const weightUnits = [IngredientUnit.GRAM, IngredientUnit.KILOGRAM];

  const isLiquidConvertible =
    liquidUnits.includes(unit1) && liquidUnits.includes(unit2);
  const isWeightConvertible =
    weightUnits.includes(unit1) && weightUnits.includes(unit2);

  return isLiquidConvertible || isWeightConvertible;
}

function addIngredientToAisle(
  aisle: ShoppingList['foods'],
  ingredient: Ingredient
) {
  const existingFood = aisle.find((food) =>
    areSimilar(food.name, ingredient.food.name)
  );

  if (existingFood) {
    if (existingFood.unit === (ingredient.unit ?? IngredientUnit.UNIT)) {
      // Si l'unité est identique, addition directe
      existingFood.quantity += ingredient.quantity;
    } else if (
      areUnitsConvertible(
        existingFood.unit as IngredientUnit,
        ingredient.unit as IngredientUnit
      )
    ) {
      // Si les unités sont convertibles, convertir et ajouter
      try {
        const convertedQuantity = convert(
          ingredient.quantity,
          ingredient.unit as Unit
        ).to(existingFood.unit as Unit);
        existingFood.quantity += convertedQuantity;
      } catch (error) {
        console.error(`Erreur lors de la conversion : ${error}`, {
          existingUnit: existingFood.unit,
          ingredientUnit: ingredient.unit,
          quantity: ingredient.quantity,
        });
      }
    } else {
      // Si les unités ne sont pas convertibles, créer un nouvel aliment
      aisle.push({
        id: uuidv4(),
        name: ingredient.food.name,
        icon: ingredient.food.icon,
        quantity: ingredient.quantity,
        unit: ingredient.unit ?? IngredientUnit.UNIT,
        isCheck: false,
      });
    }
  } else {
    // Ajouter un nouvel aliment si aucun existant ne correspond
    aisle.push({
      id: uuidv4(),
      name: ingredient.food.name,
      icon: ingredient.food.icon,
      quantity: ingredient.quantity,
      unit: ingredient.unit ?? IngredientUnit.UNIT,
      isCheck: false,
    });
  }
}

// Génère une liste de courses à partir d'une liste de plats
export function generateShoppingListFromDishes(dishes: Dish[]): ShoppingList[] {
  return dishes.reduce((acc: ShoppingList[], dish) => {
    dish.ingredients.forEach((ingredient) => {
      const aisle = acc.find((item) => item.aisle === ingredient.food.aisle);

      if (aisle) {
        addIngredientToAisle(aisle.foods, ingredient);
      } else {
        acc.push({
          aisle: ingredient.food.aisle,
          foods: [
            {
              id: uuidv4(),
              name: ingredient.food.name,
              icon: ingredient.food.icon,
              quantity: ingredient.quantity,
              unit: ingredient.unit ?? IngredientUnit.UNIT,
              isCheck: false,
            },
          ],
        });
      }
    });
    return acc;
  }, []);
}

// Ajoute un ingrédient à une liste de courses existante
export function addItemToShoppingList(
  shoppingList: ShoppingList[],
  ingredient: Ingredient
): ShoppingList[] {
  const aisle = shoppingList.find(
    (item) => item.aisle === ingredient.food.aisle
  );

  if (aisle) {
    addIngredientToAisle(aisle.foods, ingredient);
  } else {
    shoppingList.push({
      aisle: ingredient.food.aisle,
      foods: [
        {
          id: uuidv4(),
          name: ingredient.food.name,
          icon: ingredient.food.icon,
          quantity: ingredient.quantity,
          unit: ingredient.unit ?? IngredientUnit.UNIT,
          isCheck: false,
        },
      ],
    });
  }

  return shoppingList;
}

// Formate la quantité et l'unité d'un ingrédient pour un plat spécifique
export function writeUnit(
  ingredient: Ingredient,
  newRation: number,
  t: TFunction,
  currentDish?: Dish
): string {
  const initialRation = currentDish?.ration ?? 2;
  const adjustedQuantity = (ingredient.quantity / initialRation) * newRation;
  const excludeUnits = ['unit', 'cup', 'tbsp', 'tsp'];

  if (ingredient.unit && !excludeUnits.includes(ingredient.unit)) {
    const converted = convert(adjustedQuantity, ingredient.unit as Unit).to(
      'best'
    );

    // Formate correctement la quantité sans ".0" pour les entiers
    const formattedQuantity = Number.isInteger(converted.quantity)
      ? `${converted.quantity}`
      : `${parseFloat(converted.quantity.toFixed(1))}`; // Supprime le ".0" si inutile

    return `${formattedQuantity}${converted.unit}`;
  }

  // Même logique pour les unités spéciales
  const formattedAdjustedQuantity = Number.isInteger(adjustedQuantity)
    ? `${adjustedQuantity}`
    : `${parseFloat(adjustedQuantity.toFixed(1))}`; // Supprime le ".0" si inutile

  switch (ingredient.unit) {
    case 'unit':
      return `${formattedAdjustedQuantity}`;
    case 'cup':
    case 'tbsp':
    case 'tsp':
      return `${formattedAdjustedQuantity}${t(
        `enums.units.${ingredient.unit}`
      )}`;
    default:
      return formattedAdjustedQuantity;
  }
}

// Formate la quantité et l'unité d'un ingrédient à partir de sa quantité
export function writeUnitFromQuantity(
  quantity: number,
  unit: IngredientUnit,
  t: TFunction
): string {
  const excludeUnits = ['unit', 'cup', 'tbsp', 'tsp'];

  if (unit && !excludeUnits.includes(unit)) {
    const converted = convert(quantity, unit as Unit).to('best');

    // Formate correctement la quantité sans ".0" pour les entiers
    const formattedQuantity = Number.isInteger(converted.quantity)
      ? `${converted.quantity}`
      : `${parseFloat(converted.quantity.toFixed(1))}`; // Supprime le ".0" si inutile

    return `${formattedQuantity}${converted.unit}`;
  }

  // Même logique pour les unités spéciales
  const formattedQuantity = Number.isInteger(quantity)
    ? `${quantity}`
    : `${parseFloat(quantity.toFixed(1))}`; // Supprime le ".0" si inutile

  switch (unit) {
    case 'unit':
      return `x${formattedQuantity}`;
    case 'cup':
    case 'tbsp':
    case 'tsp':
      return `${formattedQuantity}${t(`enums.units.${unit}`)}`;
    default:
      return formattedQuantity;
  }
}

export function areSimilar(word1: string, word2: string): boolean {
  // Convertir en minuscules pour éviter la différence de casse
  word1 = word1.toLowerCase();
  word2 = word2.toLowerCase();

  // Vérifier si les mots sont exactement les mêmes
  if (word1 === word2) return true;

  // Vérifier si l'un des mots est le pluriel de l'autre (ajout d'un "s")
  if (word1 + 's' === word2 || word2 + 's' === word1) return true;

  // Vérifier la distance de Levenshtein (permettant 1 changement max)
  if (levenshteinDistance(word1, word2) <= 1) return true;

  return false;
}

function levenshteinDistance(a: string, b: string): number {
  const dp: number[][] = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // Suppression
        dp[i][j - 1] + 1, // Insertion
        dp[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return dp[a.length][b.length];
}
