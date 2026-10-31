use std::env;

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub default_model: String,
    pub fallback_model: String,
    pub gemma_api_key: Option<String>,
    pub gemma_api_base: String,
    pub openai_api_key: Option<String>,
    pub gemini_api_key: Option<String>,
    pub max_input_len: usize,
    pub free_try_limit: u32,
    pub static_dir: String,
    pub ollama_url: String,
    pub ollama_model: String,
    pub ollama_fallback: String,
    pub max_concurrent_inferences: usize,
    pub rate_limit_per_minute: usize,
    pub queue_timeout_secs: u64,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self::from_env()
    }
}

impl AppConfig {
    pub fn from_env() -> Self {
        let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(8000);
        let default_model =
            env::var("DEFAULT_MODEL").unwrap_or_else(|_| "gemma-4-31b-it".to_string());
        let fallback_model =
            env::var("FALLBACK_MODEL").unwrap_or_else(|_| "gemma-4-26b-a4b-it".to_string());
        let gemma_api_key = env::var("GEMMA_API_KEY")
            .ok()
            .filter(|k| !k.trim().is_empty());
        let gemma_api_base = env::var("GEMMA_API_BASE")
            .unwrap_or_else(|_| "https://api.gemma.google/v1".to_string());
        let openai_api_key = env::var("OPENAI_API_KEY")
            .ok()
            .filter(|k| !k.trim().is_empty());
        let gemini_api_key = env::var("GEMINI_API_KEY")
            .ok()
            .filter(|k| !k.trim().is_empty());
        let max_input_len = env::var("MAX_INPUT_LEN")
            .ok()
            .and_then(|l| l.parse().ok())
            .unwrap_or(4000);
        let free_try_limit = env::var("FREE_TRY_LIMIT")
            .ok()
            .and_then(|l| l.parse().ok())
            .unwrap_or(3);
        let static_dir = env::var("STATIC_DIR").unwrap_or_else(|_| "static".to_string());
        let ollama_url = env::var("OLLAMA_URL").unwrap_or_else(|_| "http://127.0.0.1:11434".to_string());
        let ollama_model = env::var("OLLAMA_MODEL").unwrap_or_else(|_| "gemma3:4b".to_string());
        let ollama_fallback = env::var("OLLAMA_FALLBACK").unwrap_or_else(|_| "llama3.2:latest".to_string());
        let max_concurrent_inferences = env::var("MAX_CONCURRENT_INFERENCES")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(1);
        let rate_limit_per_minute = env::var("RATE_LIMIT_PER_MINUTE")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(10);
        let queue_timeout_secs = env::var("QUEUE_TIMEOUT_SECS")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(15);

        Self {
            host,
            port,
            default_model,
            fallback_model,
            gemma_api_key,
            gemma_api_base,
            openai_api_key,
            gemini_api_key,
            max_input_len,
            free_try_limit,
            static_dir,
            ollama_url,
            ollama_model,
            ollama_fallback,
            max_concurrent_inferences,
            rate_limit_per_minute,
            queue_timeout_secs,
        }
    }
}
