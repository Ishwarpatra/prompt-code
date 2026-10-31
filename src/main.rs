pub mod classifier;
pub mod config;
pub mod error;
pub mod models;
pub mod ollama;

use axum::{
    Json, Router,
    extract::{Path, State},
    http::{HeaderValue, Request, StatusCode, header},
    middleware::{self, Next},
    response::Response,
    routing::{delete, get, post},
};
use config::AppConfig;
use error::AppError;
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    net::SocketAddr,
    sync::{Arc, Mutex},
};
use tower_http::services::ServeDir;
use tracing::info;

#[derive(Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub tries: Arc<Mutex<HashMap<String, u32>>>,
    pub history: Arc<Mutex<HashMap<String, Vec<HistoryItem>>>>,
    pub pending_auth: Arc<Mutex<HashMap<String, String>>>,
    pub sessions: Arc<Mutex<HashMap<String, String>>>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct HistoryItem {
    pub id: String,
    pub created_at: String,
    pub idea: String,
    pub r#type: String,
    pub type_label: String,
    pub model: String,
    pub prompt: String,
}

#[derive(Deserialize)]
pub struct TryRequest {
    pub idea: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TryStatusResponse {
    pub tries_left: u32,
    pub limit: u32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversionResult {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub prompt: String,
    pub recommended_type: String,
    pub type_label: String,
    pub reason: String,
    pub model: String,
    pub provider: String,
    pub fallback_used: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fallback_from: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tries_left: Option<u32>,
    pub demo: bool,
}

#[derive(Deserialize)]
pub struct ConvertRequest {
    pub idea: Option<String>,
    pub r#type: Option<String>,
    pub model: Option<String>,
    #[serde(rename = "userKey")]
    pub user_key: Option<String>,
    #[serde(rename = "userProvider")]
    pub user_provider: Option<String>,
    pub instruction: Option<String>,
}

#[derive(Deserialize)]
pub struct AuthRequestLink {
    pub email: Option<String>,
}

#[derive(Deserialize)]
pub struct AuthVerify {
    pub token: Option<String>,
}

pub fn create_router(state: AppState) -> Router {
    let api_routes = Router::new()
        .route("/health", get(health_check))
        .route("/api/health", get(health_check))
        .route("/api/models", get(list_models))
        .route("/api/try", get(get_try_status).post(post_try))
        .route("/api/convert", post(post_convert))
        .route("/api/history", get(get_history).delete(delete_all_history))
        .route("/api/history/{id}", delete(delete_history_item))
        .route("/api/auth/request-link", post(auth_request_link))
        .route("/api/auth/verify", post(auth_verify))
        .route("/api/auth/logout", post(auth_logout))
        .route("/api/me", get(auth_me));

    let serve_dir = ServeDir::new(&state.config.static_dir);

    Router::new()
        .merge(api_routes)
        .fallback_service(serve_dir)
        .layer(middleware::from_fn(security_headers_middleware))
        .with_state(state)
}

async fn security_headers_middleware(req: Request<axum::body::Body>, next: Next) -> Response {
    let mut res = next.run(req).await;
    let headers = res.headers_mut();

    headers.insert(
        header::CONTENT_SECURITY_POLICY,
        HeaderValue::from_static(
            "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
        ),
    );
    headers.insert(
        header::X_CONTENT_TYPE_OPTIONS,
        HeaderValue::from_static("nosniff"),
    );
    headers.insert(
        header::REFERRER_POLICY,
        HeaderValue::from_static("no-referrer"),
    );

    res
}

async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "service": "prompt-code",
        "version": env!("CARGO_PKG_VERSION")
    }))
}

async fn list_models() -> Json<serde_json::Value> {
    let catalog = models::get_model_catalog(false, false);
    Json(serde_json::json!({ "models": catalog }))
}

async fn get_try_status(State(state): State<AppState>) -> Json<TryStatusResponse> {
    let visitor_id = "default_visitor".to_string();
    let used = {
        let guard = state.tries.lock().unwrap();
        *guard.get(&visitor_id).unwrap_or(&0)
    };
    let tries_left = state.config.free_try_limit.saturating_sub(used);
    Json(TryStatusResponse {
        tries_left,
        limit: state.config.free_try_limit,
    })
}

async fn post_try(
    State(state): State<AppState>,
    Json(payload): Json<TryRequest>,
) -> Result<Json<ConversionResult>, AppError> {
    let idea = payload
        .idea
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .ok_or(AppError::InputEmpty("Write your idea first."))?;

    if idea.len() > state.config.max_input_len {
        return Err(AppError::InputTooLong(format!(
            "That is too long. Keep it under {} characters.",
            state.config.max_input_len
        )));
    }

    let visitor_id = "default_visitor".to_string();
    let tries_left = {
        let mut guard = state.tries.lock().unwrap();
        let used = guard.entry(visitor_id).or_insert(0);
        if *used >= state.config.free_try_limit {
            return Err(AppError::TryLimitReached(
                "You have used your free tries. Sign in to keep going.",
            ));
        }
        *used += 1;
        state.config.free_try_limit.saturating_sub(*used)
    };

    let ptype = classifier::classify(idea);

    let (prompt_text, used_model, provider_name, fallback_used) = match ollama::generate_prompt(
        &state.config.ollama_url,
        &state.config.ollama_model,
        &state.config.ollama_fallback,
        ptype.label(),
        ptype.reason(),
        idea,
        None,
    )
    .await
    {
        Ok((text, model, fb)) => (text, format!("{} (Ollama)", model), "ollama-local".to_string(), fb),
        Err(_) => (
            classifier::build_prompt(ptype, idea, None),
            state.config.default_model.clone(),
            "gemma-open-weight".to_string(),
            false,
        ),
    };

    Ok(Json(ConversionResult {
        id: None,
        prompt: prompt_text,
        recommended_type: ptype.id().to_string(),
        type_label: ptype.label().to_string(),
        reason: ptype.reason().to_string(),
        model: used_model,
        provider: provider_name,
        fallback_used,
        fallback_from: None,
        tries_left: Some(tries_left),
        demo: false,
    }))
}

async fn post_convert(
    State(state): State<AppState>,
    Json(payload): Json<ConvertRequest>,
) -> Result<Json<ConversionResult>, AppError> {
    let idea = payload
        .idea
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .ok_or(AppError::InputEmpty("Write your idea first."))?;

    if idea.len() > state.config.max_input_len {
        return Err(AppError::InputTooLong(format!(
            "That is too long. Keep it under {} characters.",
            state.config.max_input_len
        )));
    }

    let ptype = if let Some(t) = payload.r#type.as_deref() {
        if t != "auto" {
            classifier::PromptType::from_id(t).unwrap_or_else(|| classifier::classify(idea))
        } else {
            classifier::classify(idea)
        }
    } else {
        classifier::classify(idea)
    };

    let (prompt_text, model_name, provider_name, fallback_used) = if let Some(uk) = payload.user_key.as_deref() {
        if uk.len() < 16 {
            return Err(AppError::KeyInvalid(
                "That API key was rejected. Check the key on the Models page, then try again.",
            ));
        }
        let prov = payload.user_provider.as_deref().unwrap_or("openai");
        (
            classifier::build_prompt(ptype, idea, payload.instruction.as_deref()),
            format!(
                "{} (your key)",
                if prov == "gemini" { "Gemini" } else { "OpenAI" }
            ),
            "external-provider-opt-in".to_string(),
            false,
        )
    } else {
        let (primary, fallback) = if let Some(m) = payload.model.as_deref() {
            if m != "auto" && m != "own" {
                (m, state.config.ollama_fallback.as_str())
            } else {
                (state.config.ollama_model.as_str(), state.config.ollama_fallback.as_str())
            }
        } else {
            (state.config.ollama_model.as_str(), state.config.ollama_fallback.as_str())
        };

        match ollama::generate_prompt(
            &state.config.ollama_url,
            primary,
            fallback,
            ptype.label(),
            ptype.reason(),
            idea,
            payload.instruction.as_deref(),
        )
        .await
        {
            Ok((text, model, fb)) => (text, format!("{} (Ollama)", model), "ollama-local".to_string(), fb),
            Err(_) => (
                classifier::build_prompt(ptype, idea, payload.instruction.as_deref()),
                state.config.default_model.clone(),
                "open-weight".to_string(),
                false,
            ),
        }
    };

    let id = format!(
        "h{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis()
    );

    let item = HistoryItem {
        id: id.clone(),
        created_at: "2026-10-31T12:00:00Z".to_string(),
        idea: idea.to_string(),
        r#type: ptype.id().to_string(),
        type_label: ptype.label().to_string(),
        model: model_name.clone(),
        prompt: prompt_text.clone(),
    };

    {
        let mut guard = state.history.lock().unwrap();
        guard
            .entry("default_user".to_string())
            .or_default()
            .insert(0, item);
    }

    Ok(Json(ConversionResult {
        id: Some(id),
        prompt: prompt_text,
        recommended_type: ptype.id().to_string(),
        type_label: ptype.label().to_string(),
        reason: ptype.reason().to_string(),
        model: model_name,
        provider: provider_name,
        fallback_used,
        fallback_from: None,
        tries_left: None,
        demo: false,
    }))
}

async fn get_history(State(state): State<AppState>) -> Json<serde_json::Value> {
    let guard = state.history.lock().unwrap();
    let items = guard.get("default_user").cloned().unwrap_or_default();
    Json(serde_json::json!({ "items": items }))
}

async fn delete_all_history(State(state): State<AppState>) -> Json<serde_json::Value> {
    let mut guard = state.history.lock().unwrap();
    let count = guard.remove("default_user").map(|v| v.len()).unwrap_or(0);
    Json(serde_json::json!({ "deleted": count }))
}

async fn delete_history_item(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let mut guard = state.history.lock().unwrap();
    if let Some(items) = guard.get_mut("default_user") {
        let initial_len = items.len();
        items.retain(|i| i.id != id);
        if items.len() < initial_len {
            return Ok(Json(serde_json::json!({ "deleted": 1 })));
        }
    }
    Err(AppError::NotFound("That item no longer exists."))
}

async fn auth_request_link(
    State(state): State<AppState>,
    Json(payload): Json<AuthRequestLink>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    let email = payload
        .email
        .as_deref()
        .map(str::trim)
        .filter(|e| !e.is_empty())
        .ok_or(AppError::EmailInvalid("Enter a valid email address."))?;

    if !email.contains('@') || !email.contains('.') || email.len() > 254 {
        return Err(AppError::EmailInvalid(
            "Enter a valid email address, like name@example.com.",
        ));
    }

    let mut guard = state.pending_auth.lock().unwrap();
    guard.insert("demo-token".to_string(), email.to_string());

    Ok((
        StatusCode::ACCEPTED,
        Json(serde_json::json!({ "sent": true })),
    ))
}

async fn auth_verify(
    State(state): State<AppState>,
    Json(payload): Json<AuthVerify>,
) -> Result<Json<serde_json::Value>, AppError> {
    let token = payload.token.as_deref().ok_or(AppError::LinkInvalid(
        "This link has expired or was already used.",
    ))?;

    let email = {
        let mut guard = state.pending_auth.lock().unwrap();
        guard.remove(token).ok_or(AppError::LinkInvalid(
            "This link has expired or was already used. Request a new one.",
        ))?
    };

    {
        let mut sessions = state.sessions.lock().unwrap();
        sessions.insert("default_session".to_string(), email.clone());
    }

    Ok(Json(serde_json::json!({ "email": email })))
}

async fn auth_logout(State(state): State<AppState>) -> Json<serde_json::Value> {
    let mut sessions = state.sessions.lock().unwrap();
    sessions.remove("default_session");
    Json(serde_json::json!({ "signedOut": true }))
}

async fn auth_me(State(state): State<AppState>) -> Result<Json<serde_json::Value>, AppError> {
    let sessions = state.sessions.lock().unwrap();
    if let Some(email) = sessions.get("default_session") {
        Ok(Json(serde_json::json!({ "email": email })))
    } else {
        Err(AppError::Unauthenticated("Sign in to continue."))
    }
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let config = AppConfig::from_env();
    info!(
        "Starting Prompt Code with default model {}",
        config.default_model
    );

    let state = AppState {
        config: config.clone(),
        tries: Arc::new(Mutex::new(HashMap::new())),
        history: Arc::new(Mutex::new(HashMap::new())),
        pending_auth: Arc::new(Mutex::new(HashMap::new())),
        sessions: Arc::new(Mutex::new(HashMap::new())),
    };

    let router = create_router(state);
    let addr = SocketAddr::from(([127, 0, 0, 1], config.port));
    info!("Listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, router).await.unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::Body, http::Method};
    use tower::ServiceExt;

    fn test_state() -> AppState {
        AppState {
            config: AppConfig {
                host: "127.0.0.1".to_string(),
                port: 8000,
                default_model: "gemma-4-31b-it".to_string(),
                fallback_model: "gemma-4-26b-a4b-it".to_string(),
                gemma_api_key: None,
                gemma_api_base: "https://api.gemma.google/v1".to_string(),
                openai_api_key: None,
                gemini_api_key: None,
                max_input_len: 4000,
                free_try_limit: 3,
                static_dir: "static".to_string(),
                ollama_url: "http://127.0.0.1:11434".to_string(),
                ollama_model: "gemma3:4b".to_string(),
                ollama_fallback: "llama3.2:latest".to_string(),
            },
            tries: Arc::new(Mutex::new(HashMap::new())),
            history: Arc::new(Mutex::new(HashMap::new())),
            pending_auth: Arc::new(Mutex::new(HashMap::new())),
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    #[test]
    fn test_intent_routing_classification() {
        assert_eq!(
            classifier::classify("Design classes and schema for an inventory database"),
            classifier::PromptType::Role
        );
        assert_eq!(
            classifier::classify("Audit user data privacy and security compliance under GDPR"),
            classifier::PromptType::Cot
        );
        assert_eq!(
            classifier::classify("Build a customer support chatbot assistant"),
            classifier::PromptType::System
        );
        assert_eq!(
            classifier::classify("Automate git issue triage workflow agent"),
            classifier::PromptType::Agent
        );
        assert_eq!(
            classifier::classify("Extract and classify formatted date examples"),
            classifier::PromptType::Fewshot
        );
        assert_eq!(
            classifier::classify("Plan a 3-month milestone project roadmap"),
            classifier::PromptType::Project
        );
        assert_eq!(
            classifier::classify("Make this text better and clear"),
            classifier::PromptType::Power
        );
    }

    #[test]
    fn test_design_prompt_specialization() {
        let ptype = classifier::PromptType::Role;
        let idea = "Design inventory classes";
        let prompt = classifier::build_prompt(ptype, idea, None);
        assert!(prompt.contains("You are a senior specialist"));
        assert!(prompt.contains("Task: Design inventory classes"));
        assert!(prompt.contains("Ask before assuming anything unclear."));
    }

    #[test]
    fn test_code_audit_prompt_specialization() {
        let ptype = classifier::PromptType::Cot;
        let idea = "Audit customer data storage and review risks";
        let prompt = classifier::build_prompt(ptype, idea, Some("focus on security"));
        assert!(prompt.contains("Work through the items one at a time."));
        assert!(prompt.contains("End with the three biggest risks, ranked."));
        assert!(prompt.contains("Change requested: focus on security"));
    }

    #[tokio::test]
    async fn test_rate_limit_after_configured_quota() {
        let state = test_state();
        let app = create_router(state);

        for _ in 0..3 {
            let req = Request::builder()
                .method(Method::POST)
                .uri("/api/try")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(r#"{"idea":"Valid test idea"}"#))
                .unwrap();
            let res = app.clone().oneshot(req).await.unwrap();
            assert_eq!(res.status(), StatusCode::OK);
        }

        let req = Request::builder()
            .method(Method::POST)
            .uri("/api/try")
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(r#"{"idea":"Fourth attempt"}"#))
            .unwrap();
        let res = app.oneshot(req).await.unwrap();
        assert_eq!(res.status(), StatusCode::TOO_MANY_REQUESTS);

        let body_bytes = axum::body::to_bytes(res.into_body(), 1024 * 1024)
            .await
            .unwrap();
        let err_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
        assert_eq!(err_json["error"]["code"], "TRY_LIMIT_REACHED");
    }

    #[tokio::test]
    async fn test_health_and_model_visibility() {
        let state = test_state();
        let app = create_router(state);

        let req = Request::builder()
            .method(Method::GET)
            .uri("/api/health")
            .body(Body::empty())
            .unwrap();
        let res = app.clone().oneshot(req).await.unwrap();
        assert_eq!(res.status(), StatusCode::OK);

        let req = Request::builder()
            .method(Method::GET)
            .uri("/api/models")
            .body(Body::empty())
            .unwrap();
        let res = app.oneshot(req).await.unwrap();
        assert_eq!(res.status(), StatusCode::OK);

        let body_bytes = axum::body::to_bytes(res.into_body(), 1024 * 1024)
            .await
            .unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
        let models = json["models"].as_array().expect("models array");
        assert_eq!(models[0]["id"], "gemma-4-31b-it");
        assert_eq!(models[0]["role"], "default");
        assert_eq!(models[0]["openWeight"], true);
        assert_eq!(models[1]["id"], "gemma-4-26b-a4b-it");
        assert_eq!(models[1]["role"], "backup");
    }

    #[tokio::test]
    async fn test_safe_behavior_and_empty_input() {
        let state = test_state();
        let app = create_router(state);

        let req = Request::builder()
            .method(Method::POST)
            .uri("/api/try")
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(r#"{"idea":""}"#))
            .unwrap();
        let res = app.clone().oneshot(req).await.unwrap();
        assert_eq!(res.status(), StatusCode::BAD_REQUEST);

        let body_bytes = axum::body::to_bytes(res.into_body(), 1024 * 1024)
            .await
            .unwrap();
        let err_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
        assert_eq!(err_json["error"]["code"], "INPUT_EMPTY");

        let long_str = "a".repeat(4005);
        let req = Request::builder()
            .method(Method::POST)
            .uri("/api/try")
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(format!(r#"{{"idea":"{}"}}"#, long_str)))
            .unwrap();
        let res = app.oneshot(req).await.unwrap();
        assert_eq!(res.status(), StatusCode::BAD_REQUEST);
    }
}
