use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub role: String,
    pub status: String,
    pub open_weight: bool,
}

pub fn get_model_catalog(is_fallback: bool, all_down: bool) -> Vec<ModelInfo> {
    let s_primary = if all_down {
        "down"
    } else if is_fallback {
        "busy"
    } else {
        "ok"
    };

    let s_backup = if all_down { "down" } else { "ok" };

    vec![
        ModelInfo {
            id: "gemma-4-31b-it".to_string(),
            name: "Gemma 4 31B".to_string(),
            role: "default".to_string(),
            status: s_primary.to_string(),
            open_weight: true,
        },
        ModelInfo {
            id: "gemma-4-26b-a4b-it".to_string(),
            name: "Gemma 4 26B".to_string(),
            role: "backup".to_string(),
            status: s_backup.to_string(),
            open_weight: true,
        },
        ModelInfo {
            id: "llama".to_string(),
            name: "Llama 3.3".to_string(),
            role: "backup".to_string(),
            status: s_backup.to_string(),
            open_weight: true,
        },
        ModelInfo {
            id: "qwen".to_string(),
            name: "Qwen 2.5".to_string(),
            role: "backup".to_string(),
            status: s_backup.to_string(),
            open_weight: true,
        },
        ModelInfo {
            id: "mistral".to_string(),
            name: "Mistral Nemo".to_string(),
            role: "backup".to_string(),
            status: s_backup.to_string(),
            open_weight: true,
        },
    ]
}
