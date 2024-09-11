import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const QUOTES_FILE_PATH = join(__dirname, "quotes.json");

interface Quote {
  id: number;
  season: number;
  episode: number;
  time: string;
  name: string;
  quote: string;
}

const fetchQuotes = async (): Promise<Quote[]> => {
  try {
    const data = await fs.readFile(QUOTES_FILE_PATH, "utf-8");
    const quotes = JSON.parse(data) as Quote[];
    return quotes;
  } catch (error) {
    console.error("Error reading quotes file:", error);
    throw new Error("Unable to read quotes from file");
  }
};

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    console.error(err.stack);
    res.status(500).send({ message: err.message });
  } else {
    res.status(500).send({ message: "An unknown error occurred" });
  }
});

app.get("/quotes", async (req: Request, res: Response) => {
  try {
    const quotes = await fetchQuotes();
    res.json(quotes);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
});

app.get("/quote", async (req: Request, res: Response) => {
  try {
    const quotes = await fetchQuotes();
    const { id } = req.query;

    if (id) {
      const quote = quotes.find((q) => q.id === parseInt(id as string, 10));
      if (quote) {
        return res.status(200).json(quote);
      } else {
        return res.status(404).json({ message: "Quote not found" });
      }
    }

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.status(200).json(randomQuote);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
});

app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (err: unknown) => {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("An unknown error occurred during server startup");
    }
  });
