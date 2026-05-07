from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gemini_api_key: str = ""
    supabase_url: str = ""
    supabase_key: str = ""          # SUPABASE_KEY in .env (same key used by kuru-pipeline)
    supabase_service_role_key: str = ""
    neo4j_uri: str = ""
    neo4j_username: str = ""
    neo4j_password: str = ""
    redis_url: str = ""
    cors_origins: list[str] = ["http://localhost:3000"]


settings = Settings()
