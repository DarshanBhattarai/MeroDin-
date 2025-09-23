import prisma from "../lib/prisma.js";

export const getDiaryEntries = async (req, res) => {
  try {
    const entries = await prisma.diaryEntry.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(entries);
  } catch (error) {
    console.error("Error fetching diary entries:", error);
    res.status(500).json({ error: "Failed to fetch diary entries" });
  }
};

export const createDiaryEntry = async (req, res) => {
  try {
    const { userId, title, content, mood } = req.body;
    const entry = await prisma.diaryEntry.create({
      data: {
        userId,
        title,
        content,
        mood,
      },
    });
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating diary entry:", error);
    res.status(500).json({ error: "Failed to create diary entry" });
  }
};
