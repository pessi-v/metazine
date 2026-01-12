SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: f_unaccent(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.f_unaccent(input_text text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE
    AS $$ BEGIN RETURN public.unaccent(input_text); END $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.articles (
    id bigint NOT NULL,
    title character varying,
    image_url character varying,
    url character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    description character varying,
    source_name character varying,
    published_at timestamp(6) without time zone,
    source_id integer,
    paywalled boolean DEFAULT false,
    description_length integer,
    readability_output_jsonb jsonb DEFAULT '"{}"'::jsonb NOT NULL,
    tags jsonb,
    federated_url character varying,
    federails_actor_id bigint,
    searchable_content text
);


--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.articles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id bigint NOT NULL,
    content text NOT NULL,
    parent_type character varying NOT NULL,
    parent_id integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    federated_url character varying,
    federails_actor_id bigint,
    deleted_at timestamp(6) without time zone,
    user_id bigint
);


--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: federails_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.federails_activities (
    id bigint NOT NULL,
    entity_type character varying NOT NULL,
    entity_id bigint NOT NULL,
    action character varying NOT NULL,
    actor_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    uuid character varying
);


--
-- Name: federails_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.federails_activities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: federails_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.federails_activities_id_seq OWNED BY public.federails_activities.id;


--
-- Name: federails_actors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.federails_actors (
    id bigint NOT NULL,
    name character varying,
    federated_url character varying,
    username character varying,
    server character varying,
    inbox_url character varying,
    outbox_url character varying,
    followers_url character varying,
    followings_url character varying,
    profile_url character varying,
    local boolean,
    entity_id integer,
    entity_type character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    uuid character varying,
    public_key text,
    private_key text,
    tombstoned_at timestamp(6) without time zone,
    actor_type character varying,
    extensions json
);


--
-- Name: federails_actors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.federails_actors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: federails_actors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.federails_actors_id_seq OWNED BY public.federails_actors.id;


--
-- Name: federails_followings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.federails_followings (
    id bigint NOT NULL,
    actor_id bigint NOT NULL,
    target_actor_id bigint NOT NULL,
    status integer DEFAULT 0,
    federated_url character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    uuid character varying
);


--
-- Name: federails_followings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.federails_followings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: federails_followings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.federails_followings_id_seq OWNED BY public.federails_followings.id;


--
-- Name: federails_hosts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.federails_hosts (
    id bigint NOT NULL,
    domain character varying NOT NULL,
    nodeinfo_url character varying,
    software_name character varying,
    software_version character varying,
    protocols jsonb DEFAULT '[]'::jsonb,
    services jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: federails_hosts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.federails_hosts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: federails_hosts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.federails_hosts_id_seq OWNED BY public.federails_hosts.id;


--
-- Name: instance_actors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.instance_actors (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    name character varying
);


--
-- Name: instance_actors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.instance_actors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: instance_actors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.instance_actors_id_seq OWNED BY public.instance_actors.id;


--
-- Name: job_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_runs (
    id bigint NOT NULL,
    job_name character varying,
    started_at timestamp(6) without time zone,
    finished_at timestamp(6) without time zone,
    success boolean,
    error_message text,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: job_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_runs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_runs_id_seq OWNED BY public.job_runs.id;


--
-- Name: mastodon_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mastodon_clients (
    id bigint NOT NULL,
    domain character varying NOT NULL,
    client_id character varying NOT NULL,
    client_secret character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: mastodon_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mastodon_clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mastodon_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mastodon_clients_id_seq OWNED BY public.mastodon_clients.id;


--
-- Name: pghero_query_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pghero_query_stats (
    id bigint NOT NULL,
    database text,
    "user" text,
    query text,
    query_hash bigint,
    total_time double precision,
    calls bigint,
    captured_at timestamp without time zone
);


--
-- Name: pghero_query_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pghero_query_stats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pghero_query_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pghero_query_stats_id_seq OWNED BY public.pghero_query_stats.id;


--
-- Name: pghero_space_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pghero_space_stats (
    id bigint NOT NULL,
    database text,
    schema text,
    relation text,
    size bigint,
    captured_at timestamp without time zone
);


--
-- Name: pghero_space_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pghero_space_stats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pghero_space_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pghero_space_stats_id_seq OWNED BY public.pghero_space_stats.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    ip_address character varying,
    user_agent character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sources (
    id bigint NOT NULL,
    name character varying,
    url character varying,
    last_modified character varying,
    etag character varying,
    active boolean DEFAULT true,
    show_images boolean DEFAULT true,
    last_error_status character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    allow_video boolean DEFAULT false,
    allow_audio boolean DEFAULT false,
    description character varying,
    image_url character varying,
    articles_count integer,
    last_built character varying
);


--
-- Name: sources_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sources_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sources_id_seq OWNED BY public.sources.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    provider character varying,
    uid character varying,
    username character varying,
    display_name character varying,
    avatar_url character varying,
    access_token character varying,
    domain character varying
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: federails_activities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federails_activities ALTER COLUMN id SET DEFAULT nextval('public.federails_activities_id_seq'::regclass);


--
-- Name: federails_actors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federails_actors ALTER COLUMN id SET DEFAULT nextval('public.federails_actors_id_seq'::regclass);


--
-- Name: federails_followings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federails_followings ALTER COLUMN id SET DEFAULT nextval('public.federails_followings_id_seq'::regclass);


--
-- Name: federails_hosts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federails_hosts ALTER COLUMN id SET DEFAULT nextval('public.federails_hosts_id_seq'::regclass);


--
-- Name: instance_actors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_actors ALTER COLUMN id SET DEFAULT nextval('public.instance_actors_id_seq'::regclass);


--
-- Name: job_runs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_runs ALTER COLUMN id SET DEFAULT nextval('public.job_runs_id_seq'::regclass);


--
-- Name: mastodon_clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mastodon_clients ALTER COLUMN id SET DEFAULT nextval('public.mastodon_clients_id_seq'::regclass);


--
-- Name: pghero_query_stats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pghero_query_stats ALTER COLUMN id SET DEFAULT nextval('public.pghero_query_stats_id_seq'::regclass);


--
-- Name: pghero_space_stats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pghero_space_stats ALTER COLUMN id SET DEFAULT nextval('public.pghero_space_stats_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: sources id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sources ALTER COLUMN id SET DEFAULT nextval('public.sources_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: federails_activities federails_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federails_activities
    ADD CONSTRAINT federails_activities_pkey PRIMARY KEY (id);


--
-- Name: federails_actors federails_actors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federails_actors
    ADD CONSTRAINT federails_actors_pkey PRIMARY KEY (id);


--
-- Name: federails_followings federails_followings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federails_followings
    ADD CONSTRAINT federails_followings_pkey PRIMARY KEY (id);


--
-- Name: federails_hosts federails_hosts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federails_hosts
    ADD CONSTRAINT federails_hosts_pkey PRIMARY KEY (id);


--
-- Name: instance_actors instance_actors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_actors
    ADD CONSTRAINT instance_actors_pkey PRIMARY KEY (id);


--
-- Name: job_runs job_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_runs
    ADD CONSTRAINT job_runs_pkey PRIMARY KEY (id);


--
-- Name: mastodon_clients mastodon_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mastodon_clients
    ADD CONSTRAINT mastodon_clients_pkey PRIMARY KEY (id);


--
-- Name: pghero_query_stats pghero_query_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pghero_query_stats
    ADD CONSTRAINT pghero_query_stats_pkey PRIMARY KEY (id);


--
-- Name: pghero_space_stats pghero_space_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pghero_space_stats
    ADD CONSTRAINT pghero_space_stats_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sources sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sources
    ADD CONSTRAINT sources_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: index_articles_on_federails_actor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_articles_on_federails_actor_id ON public.articles USING btree (federails_actor_id);


--
-- Name: index_articles_on_published_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_articles_on_published_at ON public.articles USING btree (published_at);


--
-- Name: index_articles_on_searchable_fields; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_articles_on_searchable_fields ON public.articles USING gin ((((to_tsvector('simple'::regconfig, public.f_unaccent(COALESCE((title)::text, ''::text))) || to_tsvector('simple'::regconfig, public.f_unaccent(COALESCE((source_name)::text, ''::text)))) || to_tsvector('simple'::regconfig, public.f_unaccent(COALESCE(searchable_content, ''::text))))));


--
-- Name: index_articles_on_url_and_title; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_articles_on_url_and_title ON public.articles USING btree (url, title);


--
-- Name: index_comments_on_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_deleted_at ON public.comments USING btree (deleted_at);


--
-- Name: index_comments_on_federails_actor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_federails_actor_id ON public.comments USING btree (federails_actor_id);


--
-- Name: index_comments_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_user_id ON public.comments USING btree (user_id);


--
-- Name: index_federails_activities_on_actor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_federails_activities_on_actor_id ON public.federails_activities USING btree (actor_id);


--
-- Name: index_federails_activities_on_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_federails_activities_on_entity ON public.federails_activities USING btree (entity_type, entity_id);


--
-- Name: index_federails_activities_on_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_federails_activities_on_uuid ON public.federails_activities USING btree (uuid);


--
-- Name: index_federails_actors_on_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_federails_actors_on_entity ON public.federails_actors USING btree (entity_type, entity_id);


--
-- Name: index_federails_actors_on_federated_url; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_federails_actors_on_federated_url ON public.federails_actors USING btree (federated_url);


--
-- Name: index_federails_actors_on_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_federails_actors_on_uuid ON public.federails_actors USING btree (uuid);


--
-- Name: index_federails_followings_on_actor_id_and_target_actor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_federails_followings_on_actor_id_and_target_actor_id ON public.federails_followings USING btree (actor_id, target_actor_id);


--
-- Name: index_federails_followings_on_target_actor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_federails_followings_on_target_actor_id ON public.federails_followings USING btree (target_actor_id);


--
-- Name: index_federails_followings_on_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_federails_followings_on_uuid ON public.federails_followings USING btree (uuid);


--
-- Name: index_federails_hosts_on_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_federails_hosts_on_domain ON public.federails_hosts USING btree (domain);


--
-- Name: index_job_runs_on_job_name_and_started_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_job_runs_on_job_name_and_started_at ON public.job_runs USING btree (job_name, started_at);


--
-- Name: index_pghero_query_stats_on_database_and_captured_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_pghero_query_stats_on_database_and_captured_at ON public.pghero_query_stats USING btree (database, captured_at);


--
-- Name: index_pghero_space_stats_on_database_and_captured_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_pghero_space_stats_on_database_and_captured_at ON public.pghero_space_stats USING btree (database, captured_at);


--
-- Name: index_poly_comments_on_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_poly_comments_on_parent ON public.comments USING btree (parent_type, parent_id);


--
-- Name: index_sessions_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sessions_on_user_id ON public.sessions USING btree (user_id);


--
-- Name: index_users_on_provider_and_uid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_provider_and_uid ON public.users USING btree (provider, uid);


--
-- Name: index_users_on_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_username ON public.users USING btree (username);


--
-- Name: comments fk_rails_03de2dc08c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_rails_03de2dc08c FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: federails_followings fk_rails_2e62338faa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federails_followings
    ADD CONSTRAINT fk_rails_2e62338faa FOREIGN KEY (actor_id) REFERENCES public.federails_actors(id);


--
-- Name: comments fk_rails_3a181ceff0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_rails_3a181ceff0 FOREIGN KEY (federails_actor_id) REFERENCES public.federails_actors(id);


--
-- Name: federails_followings fk_rails_4a2870c181; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federails_followings
    ADD CONSTRAINT fk_rails_4a2870c181 FOREIGN KEY (target_actor_id) REFERENCES public.federails_actors(id);


--
-- Name: sessions fk_rails_758836b4f0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT fk_rails_758836b4f0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: federails_activities fk_rails_85ef6259df; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federails_activities
    ADD CONSTRAINT fk_rails_85ef6259df FOREIGN KEY (actor_id) REFERENCES public.federails_actors(id);


--
-- Name: articles fk_rails_f85e85e020; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT fk_rails_f85e85e020 FOREIGN KEY (federails_actor_id) REFERENCES public.federails_actors(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20260109171753');

