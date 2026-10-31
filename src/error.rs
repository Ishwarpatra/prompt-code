use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Serialize;
use thiserror::Error;

#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
pub struct ApiErrorBody {
    pub code: &'static str,
    pub message: String,
    pub retryable: bool,
}

#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
pub struct ErrorEnvelope {
    pub error: ApiErrorBody,
}

#[derive(Error, Debug)]
pub enum AppError {
    #[error("INPUT_EMPTY: {0}")]
    InputEmpty(&'static str),

    #[error("INPUT_TOO_LONG: {0}")]
    InputTooLong(String),

    #[error("TRY_LIMIT_REACHED: {0}")]
    TryLimitReached(&'static str),

    #[error("RATE_LIMITED: {0}")]
    RateLimited(&'static str),

    #[error("KEY_INVALID: {0}")]
    KeyInvalid(&'static str),

    #[error("NO_KEY_CONFIGURED: {0}")]
    NoKeyConfigured(&'static str),

    #[error("ALL_PROVIDERS_FAILED: {0}")]
    AllProvidersFailed(&'static str),

    #[error("UNAUTHENTICATED: {0}")]
    Unauthenticated(&'static str),

    #[error("NOT_FOUND: {0}")]
    NotFound(&'static str),

    #[error("EMAIL_INVALID: {0}")]
    EmailInvalid(&'static str),

    #[error("LINK_INVALID: {0}")]
    LinkInvalid(&'static str),
}

impl AppError {
    pub fn to_envelope(&self) -> (StatusCode, ErrorEnvelope) {
        match self {
            Self::InputEmpty(msg) => (
                StatusCode::BAD_REQUEST,
                ErrorEnvelope {
                    error: ApiErrorBody {
                        code: "INPUT_EMPTY",
                        message: (*msg).to_string(),
                        retryable: false,
                    },
                },
            ),
            Self::InputTooLong(msg) => (
                StatusCode::BAD_REQUEST,
                ErrorEnvelope {
                    error: ApiErrorBody {
                        code: "INPUT_TOO_LONG",
                        message: msg.clone(),
                        retryable: false,
                    },
                },
            ),
            Self::TryLimitReached(msg) => (
                StatusCode::TOO_MANY_REQUESTS,
                ErrorEnvelope {
                    error: ApiErrorBody {
                        code: "TRY_LIMIT_REACHED",
                        message: (*msg).to_string(),
                        retryable: false,
                    },
                },
            ),
            Self::RateLimited(msg) => (
                StatusCode::TOO_MANY_REQUESTS,
                ErrorEnvelope {
                    error: ApiErrorBody {
                        code: "RATE_LIMITED",
                        message: (*msg).to_string(),
                        retryable: true,
                    },
                },
            ),
            Self::KeyInvalid(msg) => (
                StatusCode::UNAUTHORIZED,
                ErrorEnvelope {
                    error: ApiErrorBody {
                        code: "KEY_INVALID",
                        message: (*msg).to_string(),
                        retryable: false,
                    },
                },
            ),
            Self::NoKeyConfigured(msg) => (
                StatusCode::SERVICE_UNAVAILABLE,
                ErrorEnvelope {
                    error: ApiErrorBody {
                        code: "ALL_PROVIDERS_FAILED",
                        message: (*msg).to_string(),
                        retryable: false,
                    },
                },
            ),
            Self::AllProvidersFailed(msg) => (
                StatusCode::SERVICE_UNAVAILABLE,
                ErrorEnvelope {
                    error: ApiErrorBody {
                        code: "ALL_PROVIDERS_FAILED",
                        message: (*msg).to_string(),
                        retryable: true,
                    },
                },
            ),
            Self::Unauthenticated(msg) => (
                StatusCode::UNAUTHORIZED,
                ErrorEnvelope {
                    error: ApiErrorBody {
                        code: "UNAUTHENTICATED",
                        message: (*msg).to_string(),
                        retryable: false,
                    },
                },
            ),
            Self::NotFound(msg) => (
                StatusCode::NOT_FOUND,
                ErrorEnvelope {
                    error: ApiErrorBody {
                        code: "NOT_FOUND",
                        message: (*msg).to_string(),
                        retryable: false,
                    },
                },
            ),
            Self::EmailInvalid(msg) => (
                StatusCode::BAD_REQUEST,
                ErrorEnvelope {
                    error: ApiErrorBody {
                        code: "EMAIL_INVALID",
                        message: (*msg).to_string(),
                        retryable: false,
                    },
                },
            ),
            Self::LinkInvalid(msg) => (
                StatusCode::BAD_REQUEST,
                ErrorEnvelope {
                    error: ApiErrorBody {
                        code: "LINK_INVALID",
                        message: (*msg).to_string(),
                        retryable: false,
                    },
                },
            ),
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, envelope) = self.to_envelope();
        (status, Json(envelope)).into_response()
    }
}
