use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct OllamaGenerateRequest<'a> {
    model: &'a str,
    prompt: &'a str,
    stream: bool,
}

#[derive(Deserialize)]
struct OllamaGenerateResponse {
    response: String,
}

pub async fn generate_prompt(
    base_url: &str,
    primary_model: &str,
    fallback_model: &str,
    prompt_type_label: &str,
    prompt_type_reason: &str,
    idea: &str,
    instruction: Option<&str>,
) -> Result<(String, String, bool), String> {
    let mut system_instructions = format!(
        "You are an expert prompt engineer. Your job is to transform the user's rough idea into an exceptional, highly effective {} ({}).\n\n\
        User's Idea: \"{}\"\n",
        prompt_type_label, prompt_type_reason, idea
    );

    if let Some(inst) = instruction {
        system_instructions.push_str(&format!("\nRefinement Instruction: \"{}\"\n", inst));
    }

    system_instructions.push_str(
        "\nProvide a well-structured, detailed prompt that can be directly pasted into an AI model or generator to achieve the best possible result.\n\
        Output ONLY the final generated prompt. Do not include conversational filler, preamble, or markdown backticks around the entire response."
    );

    // Try primary model first
    match try_call(base_url, primary_model, &system_instructions).await {
        Ok(text) => Ok((text, primary_model.to_string(), false)),
        Err(primary_err) => {
            // Attempt fallback model
            match try_call(base_url, fallback_model, &system_instructions).await {
                Ok(text) => Ok((text, fallback_model.to_string(), true)),
                Err(fallback_err) => Err(format!(
                    "Primary '{}' failed: {}. Fallback '{}' failed: {}",
                    primary_model, primary_err, fallback_model, fallback_err
                )),
            }
        }
    }
}

async fn try_call(base_url: &str, model: &str, prompt: &str) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(45))
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("{}/api/generate", base_url.trim_end_matches('/'));
    let payload = OllamaGenerateRequest {
        model,
        prompt,
        stream: false,
    };

    let res = client
        .post(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("HTTP {}", res.status()));
    }

    let parsed: OllamaGenerateResponse = res.json().await.map_err(|e| e.to_string())?;
    let text = parsed.response.trim().to_string();
    if text.is_empty() {
        return Err("Empty response from Ollama".to_string());
    }

    Ok(text)
}
