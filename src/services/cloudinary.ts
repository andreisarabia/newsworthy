import { v2 as _cloudinary } from 'cloudinary';

import Config from '../Config';
import { deepClone } from '../util';

// cloudinary doesn't export this type for devs to use...
interface UploadApiResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: Array<string>;
  pages: number;
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
  moderation: Array<string>;
  access_control: Array<string>;
  context: object;
  metadata: object;
  [futureKey: string]: any;
}

const {
  cloudinaryCloudName: cloud_name,
  cloudinaryApiKey: api_key,
  cloudinaryApiSecret: api_secret,
} = Config.getAll(
  'cloudinaryCloudName',
  'cloudinaryApiKey',
  'cloudinaryApiSecret'
);

let cloudinary: typeof _cloudinary;

if (cloud_name && api_key && api_secret) {
  cloudinary = _cloudinary;
  cloudinary.config({ cloud_name, api_key, api_secret });
} else {
  // no point in exporting the whole library if no creds provided
  cloudinary = deepClone(_cloudinary);
  // if no library to use, we avoid using the sdk fns that are
  // used throughout the app
  cloudinary.uploader.upload = () => Promise.resolve({} as UploadApiResponse);
}

export default cloudinary;
