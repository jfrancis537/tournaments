import { DateTime } from "luxon";

export interface SerializedNewsPost {
  title: string;
  author: string;
  markdown: string;
  createdDate: string;
  updatedDate: string;
  id: string;
}

export interface NewsPost {
  title: string;
  author: string;
  markdown: string;
  createdDate: DateTime;
  updatedDate: DateTime;
  id: string;
}

export namespace NewsPost {
  export function Serialize(data: NewsPost): SerializedNewsPost {
    return {
      ...data, 
      createdDate: data.createdDate.toISO()!, 
      updatedDate: data.updatedDate.toISO()!
    }
  }

  export function Deserialize(data: SerializedNewsPost): NewsPost {
    return {
      ...data,
      createdDate: DateTime.fromISO(data.createdDate), 
      updatedDate: DateTime.fromISO(data.updatedDate)
    }
  }
}

