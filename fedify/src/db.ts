import postgres from "postgres";

const {
  DATABASE_URL,
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DB_HOST = "localhost",
  DB_PORT = "5432",
} = process.env;

const connectionString =
  DATABASE_URL ??
  `postgres://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DB_HOST}:${DB_PORT}/${DATABASE_NAME}`;

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 30,
});

export type InstanceActorRow = {
  id: number;
  name: string;
  public_key: string;
  private_key: string;
};

export type ApFollowRow = {
  id: number;
  follower_url: string;
  follower_inbox_url: string;
  status: number;
  follow_activity_url: string | null;
};

export type ArticleRow = {
  id: number;
  title: string | null;
  description: string | null;
  url: string | null;
  source_name: string | null;
  image_url: string | null;
  published_at: Date | null;
  federated_url: string | null;
};

export type CommentRow = {
  id: number;
  content: string;
  federated_url: string | null;
  deleted_at: Date | null;
  parent_type: string;
  parent_id: number;
  created_at: Date;
};
