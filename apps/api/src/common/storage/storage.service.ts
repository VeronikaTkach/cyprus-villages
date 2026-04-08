import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function mimeToExt(mimeType: string): string {
  const ext = MIME_TO_EXT[mimeType];
  if (!ext) {
    throw new BadRequestException(`Cannot derive extension for mime type "${mimeType}".`);
  }
  return ext;
}

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = config.get<string>('R2_ACCOUNT_ID', '');
    const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID', '');
    const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY', '');
    this.bucket = config.get<string>('R2_BUCKET_NAME', '');
    this.publicBaseUrl = config.get<string>('R2_PUBLIC_BASE_URL', '');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  /**
   * Upload a file buffer to R2 and return its public URL.
   * @param prefix    e.g. 'villages/42' or 'festivals/7'
   * @param kind      e.g. 'cover' or 'gallery'
   * @param buffer    file contents
   * @param mimeType  e.g. 'image/jpeg' — used for both ContentType and key extension
   *
   * Key format: {prefix}/{kind}-{Date.now()}.{ext}
   * Extension is derived from mimeType, never from the original filename.
   */
  async upload(
    prefix: string,
    kind: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    const ext = mimeToExt(mimeType);
    const key = `${prefix}/${kind}-${Date.now()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return `${this.publicBaseUrl}/${key}`;
  }

  /**
   * Delete an object from R2 by its public URL.
   * Returns silently if the key cannot be derived.
   */
  async deleteByUrl(url: string): Promise<void> {
    if (!url.startsWith(this.publicBaseUrl)) return;

    const key = url.slice(this.publicBaseUrl.length + 1); // strip leading slash
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
