import { HttpError } from 'wasp/server';
import { type File } from 'wasp/entities';

// Define the operation types ourselves since they're not exported from wasp/server/operations
type Context = {
  user?: { id: string };
  entities: any;
};

type CreateFile<Args, Return> = (args: Args, context: Context) => Promise<Return>;
type GetAllFilesByUser<Args, Return> = (args: Args, context: Context) => Promise<Return>;
type GetDownloadFileSignedURL<Args, Return> = (args: Args, context: Context) => Promise<Return>;

import { getUploadFileSignedURLFromS3, getDownloadFileSignedURLFromS3 } from './s3Utils';

type FileDescription = {
  fileType: string;
  name: string;
};

export const createFile: CreateFile<FileDescription, File> = async ({ fileType, name }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const userInfo = context.user.id;

  const { uploadUrl, key } = await getUploadFileSignedURLFromS3({ fileType, userInfo });

  return await context.entities.File.create({
    data: {
      name,
      key,
      uploadUrl,
      type: fileType,
      user: { connect: { id: context.user.id } },
    },
  });
};

export const getAllFilesByUser: GetAllFilesByUser<void, File[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.File.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getDownloadFileSignedURL: GetDownloadFileSignedURL<{ key: string }, string> = async (
  { key },
  _context
) => {
  return await getDownloadFileSignedURLFromS3({ key });
};
