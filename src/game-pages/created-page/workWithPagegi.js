import { newStemmer } from "snowball-stemmers";

export function findIngredientMatch(actionText, ingredientName) {
  const stemmer = newStemmer("russian");

  const normalize = (text) =>
    text
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .split(" ");

  const stemWords = (words) => words.map((word) => stemmer.stem(word));

  const actionWords = normalize(actionText);
  const ingredientWords = normalize(ingredientName);

  const actionStems = stemWords(actionWords);
  const ingredientStems = stemWords(ingredientWords);

  for (let i = 0; i <= actionStems.length - ingredientStems.length; i++) {
    let matched = true;

    for (let j = 0; j < ingredientStems.length; j++) {
      if (actionStems[i + j] !== ingredientStems[j]) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return {
        start: i,
        end: i + ingredientStems.length,
      };
    }
  }

    if (ingredientName.toLowerCase() === "кипяток") {
        const hotWater = ["кипятком"];

        for (let i = 0; i < actionWords.length; i++) {
            if (hotWater.includes(actionWords[i])) {
                return {
                    start: i,
                    end: i + 1,
                };
            }
        }
    }

  return null;
}
