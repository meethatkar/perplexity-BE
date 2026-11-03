import { tavily as Tavily } from "@tavily/core";

const tavily = Tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function searchInternet({ query }) {
  console.log("Tavily USED: ", query);

  const response = await tavily.search(query, {
    searchDepth: "advanced",
  });

  return JSON.stringify(response);
}
