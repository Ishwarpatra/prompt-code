use std::{
    collections::HashMap,
    sync::Mutex,
    time::{Duration, Instant},
};

/// In-memory sliding-window rate limiter per client key.
#[derive(Debug)]
pub struct RateLimiter {
    requests: Mutex<HashMap<String, Vec<Instant>>>,
}

impl Default for RateLimiter {
    fn default() -> Self {
        Self::new()
    }
}

impl RateLimiter {
    pub fn new() -> Self {
        Self {
            requests: Mutex::new(HashMap::new()),
        }
    }

    /// Checks if `key` (e.g. client IP or session id) has exceeded `limit` requests within `window`.
    /// Returns `Ok(())` if allowed, or `Err(retry_after_secs)` if rate limited.
    pub fn check(&self, key: &str, limit: usize, window: Duration) -> Result<(), u64> {
        let now = Instant::now();
        let mut map = self.requests.lock().unwrap();
        let timestamps = map.entry(key.to_string()).or_default();

        // Evict expired timestamps older than the sliding window
        timestamps.retain(|&t| now.duration_since(t) < window);

        if timestamps.len() >= limit {
            let oldest = timestamps[0];
            let elapsed = now.duration_since(oldest);
            let retry_after = window.saturating_sub(elapsed).as_secs().max(1);
            Err(retry_after)
        } else {
            timestamps.push(now);
            Ok(())
        }
    }
}
