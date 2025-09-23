import prisma from "../lib/prisma.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { paginationUtils } from "../utils/helpers.js";

const diaryService = {
  async createEntry(userId, entryData) {
    const { title, content, mood } = entryData;

    if (!title || !content) {
      throw new ValidationError("Title and content are required");
    }

    return prisma.diaryEntry.create({
      data: {
        userId,
        title,
        content,
        mood,
      },
    });
  },

  async getEntries(userId, query = {}) {
    const { skip, take, page } = paginationUtils.getPaginationParams(query);

    const [entries, total] = await Promise.all([
      prisma.diaryEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.diaryEntry.count({
        where: { userId },
      }),
    ]);

    return {
      entries,
      pagination: paginationUtils.getPaginationMetadata(total, page, take),
    };
  },

  async getEntryById(userId, entryId) {
    const entry = await prisma.diaryEntry.findFirst({
      where: {
        id: entryId,
        userId,
      },
    });

    if (!entry) {
      throw new NotFoundError("Diary entry not found");
    }

    return entry;
  },

  async updateEntry(userId, entryId, updateData) {
    const { title, content, mood } = updateData;

    // Verify entry exists and belongs to user
    await this.getEntryById(userId, entryId);

    return prisma.diaryEntry.update({
      where: { id: entryId },
      data: {
        title,
        content,
        mood,
      },
    });
  },

  async deleteEntry(userId, entryId) {
    // Verify entry exists and belongs to user
    await this.getEntryById(userId, entryId);

    return prisma.diaryEntry.delete({
      where: { id: entryId },
    });
  },
};

export default diaryService;
