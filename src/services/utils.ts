// Utilitaire pour fusionner les classes Tailwind
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
  unit1?: IngredientUnit,
  unit2?: IngredientUnit
): boolean {
  if (!unit1 || !unit2) return false;

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
    if (!existingFood.unit && !existingFood.quantity) {
      if (ingredient.unit || ingredient.quantity) {
        aisle.push({
          id: uuidv4(),
          name: ingredient.food.name,
          icon: ingredient.food.icon,
          quantity: ingredient.quantity ?? undefined,
          unit: ingredient.unit ?? IngredientUnit.UNIT, // Ajout de "UNIT" si unit est undefined
          isCheck: false,
        });
      }
    } else if (existingFood.unit === ingredient.unit && ingredient.unit) {
      existingFood.quantity =
        (existingFood.quantity ?? 0) + (ingredient.quantity ?? 0);
    } else if (areUnitsConvertible(existingFood.unit, ingredient.unit)) {
      try {
        const convertedQuantity = convert(
          ingredient.quantity ?? 0,
          ingredient.unit as Unit
        ).to(existingFood.unit as Unit);
        existingFood.quantity =
          (existingFood.quantity ?? 0) + convertedQuantity;
      } catch (error) {
        console.error(`Erreur lors de la conversion : ${error}`, {
          existingUnit: existingFood.unit,
          ingredientUnit: ingredient.unit,
          quantity: ingredient.quantity,
        });
      }
    } else {
      aisle.push({
        id: uuidv4(),
        name: ingredient.food.name,
        icon: ingredient.food.icon,
        quantity: ingredient.quantity ?? undefined,
        unit: ingredient.unit ?? IngredientUnit.UNIT, // Ajout de "UNIT" si unit est undefined
        isCheck: false,
      });
    }
  } else {
    aisle.push({
      id: uuidv4(),
      name: ingredient.food.name,
      icon: ingredient.food.icon,
      quantity: ingredient.quantity ?? undefined,
      unit: ingredient.unit ?? IngredientUnit.UNIT, // Ajout de "UNIT" si unit est undefined
      isCheck: false,
    });
  }
}

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
              quantity: ingredient.quantity ?? undefined,
              unit: ingredient.unit ?? undefined,
              isCheck: false,
            },
          ],
        });
      }
    });
    return acc;
  }, []);
}

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
          quantity: ingredient.quantity ?? undefined,
          unit: ingredient.unit ?? undefined,
          isCheck: false,
        },
      ],
    });
  }

  return shoppingList;
}

export function writeUnitFromQuantity(
  t: TFunction,
  quantity?: number,
  unit?: IngredientUnit
): string {
  if (
    quantity === undefined ||
    unit === undefined ||
    quantity === undefined ||
    unit === undefined
  )
    return '';

  const excludeUnits = [
    'unit',
    'cup',
    'tbsp',
    'tsp',
    'piece',
    'slice',
    'packet',
  ];

  if (!excludeUnits.includes(unit)) {
    const converted = convert(quantity, unit as Unit).to('best');
    const formattedQuantity = Number.isInteger(converted.quantity)
      ? `${converted.quantity}`
      : `${parseFloat(converted.quantity.toFixed(1))}`;
    return `${formattedQuantity}${converted.unit}`;
  }

  const formattedQuantity =
    quantity && Number.isFinite(quantity)
      ? Number.isInteger(quantity)
        ? `${quantity}`
        : `${parseFloat(quantity.toFixed(1))}`
      : '';

  switch (unit) {
    case 'unit':
      return `x${formattedQuantity}`;
    case 'cup':
    case 'tbsp':
    case 'tsp':
      return `${formattedQuantity}${t(`enums.units.${unit}`)}`;
    case 'piece':
    case 'slice':
    case 'packet':
      return `${formattedQuantity} ${t(`enums.units.${unit}`)}`;
    default:
      return formattedQuantity;
  }
}

export function writeUnit(
  ingredient: Ingredient,
  newRation: number,
  t: TFunction,
  currentDish?: Dish
): string {
  if (ingredient.quantity === undefined || ingredient.unit === undefined)
    return '';
  const initialRation = currentDish?.ration ?? 2;
  const adjustedQuantity = (ingredient.quantity / initialRation) * newRation;
  const excludeUnits = [
    'unit',
    'cup',
    'tbsp',
    'tsp',
    'piece',
    'slice',
    'packet',
  ];

  if (ingredient.unit && !excludeUnits.includes(ingredient.unit)) {
    const converted = convert(adjustedQuantity, ingredient.unit as Unit).to(
      'best'
    );
    const formattedQuantity = Number.isInteger(converted.quantity)
      ? `${converted.quantity}`
      : `${parseFloat(converted.quantity.toFixed(1))}`;
    return `${formattedQuantity}${converted.unit}`;
  }

  const formattedAdjustedQuantity = Number.isInteger(adjustedQuantity)
    ? `${adjustedQuantity}`
    : `${parseFloat(adjustedQuantity.toFixed(1))}`;

  switch (ingredient.unit) {
    case 'unit':
      return `${formattedAdjustedQuantity}`;
    case 'cup':
    case 'tbsp':
    case 'tsp':
      return `${formattedAdjustedQuantity}${t(
        `enums.units.${ingredient.unit}`
      )}`;
    case 'piece':
    case 'slice':
    case 'packet':
      return `${formattedAdjustedQuantity} ${t(
        `enums.units.${ingredient.unit}`
      )}`;
    default:
      return formattedAdjustedQuantity;
  }
}
export function areSimilar(
  word1: string,
  word2: string,
  isPerfect = false
): boolean {
  const normalize = (str: string) => removeAccents(str.toLowerCase());

  word1 = normalize(word1);
  word2 = normalize(word2);

  // Vérifier les synonymes avec tolérance
  if (areSynonyms(word1, word2)) return true;

  // Vérification des correspondances exactes ou simples
  if (word1 === word2) return true;

  // Vérification des correspondances partielles (mots contenant la chaîne)
  if (word1.includes(word2) || word2.includes(word1)) return true;

  const singularPluralMatch =
    word1.replace(/s$/, '') === word2.replace(/s$/, '');
  if (singularPluralMatch) return true;

  const startsWith = word1.startsWith(word2) || word2.startsWith(word1);
  const endsWith = word1.endsWith(word2) || word2.endsWith(word1);

  // Calcul de la distance de Levenshtein avec plus de tolérance
  const distance = levenshteinDistance(word1, word2);
  const maxDistance = Math.ceil(word1.length / 2); // Augmenter le seuil d'erreur autorisé

  if (isPerfect) {
    return distance <= 1;
  } else {
    return distance <= maxDistance || startsWith || endsWith;
  }
}

// Fonction améliorée pour vérifier les synonymes avec tolérance
function areSynonyms(word1: string, word2: string): boolean {
  const synonyms: Record<string, string[]> = {
    haché: ['hache', 'moulu'],
    boeuf: ['bœuf', 'boeuf'], // Ajout de 'boeu' comme variante
    // Ajoutez d'autres synonymes selon besoin
  };

  // Vérification des synonymes exacts ou en utilisant la distance de Levenshtein
  for (const key in synonyms) {
    const synonymList = synonyms[key];
    for (const synonym of synonymList) {
      const distance = levenshteinDistance(word1, synonym);
      const distance2 = levenshteinDistance(word2, synonym);
      const maxDistance = 3; // Tolérance d'erreur pour les synonymes (exemple : distance <= 2)
      if (distance <= maxDistance && distance2 <= maxDistance) {
        return true;
      }
    }
  }

  return false;
}

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function levenshteinDistance(a: string, b: string): number {
  const dp: number[][] = Array(a.length + 1)
    .fill(undefined)
    .map(() => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}
