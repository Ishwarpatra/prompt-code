use regex::Regex;
use std::sync::LazyLock;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PromptType {
    Role,
    Cot,
    System,
    Agent,
    Fewshot,
    Project,
    Power,
}

impl PromptType {
    pub fn id(&self) -> &'static str {
        match self {
            Self::Role => "role",
            Self::Cot => "cot",
            Self::System => "system",
            Self::Agent => "agent",
            Self::Fewshot => "fewshot",
            Self::Project => "project",
            Self::Power => "power",
        }
    }

    pub fn label(&self) -> &'static str {
        match self {
            Self::Role => "Role prompt",
            Self::Cot => "Step-by-step checklist",
            Self::System => "System prompt",
            Self::Agent => "Agent prompt",
            Self::Fewshot => "Few-shot prompt",
            Self::Project => "Project prompt",
            Self::Power => "Power prompt",
        }
    }

    pub fn reason(&self) -> &'static str {
        match self {
            Self::Role => {
                "Best for design work that needs an expert voice and a fixed output format."
            }
            Self::Cot => "Best when the model must go through items one by one and flag risks.",
            Self::System => {
                "Sets the role, rules and tone for an assistant that will talk to people."
            }
            Self::Agent => "Defines the goal, the tools it may use, its limits and when to stop.",
            Self::Fewshot => {
                "Shows worked examples so the output keeps the same format every time."
            }
            Self::Project => {
                "Sets goals, constraints, deliverables and stages for larger pieces of work."
            }
            Self::Power => "A general structured rewrite when no other type fits better.",
        }
    }

    pub fn from_id(id: &str) -> Option<Self> {
        match id {
            "role" => Some(Self::Role),
            "cot" => Some(Self::Cot),
            "system" => Some(Self::System),
            "agent" => Some(Self::Agent),
            "fewshot" => Some(Self::Fewshot),
            "project" => Some(Self::Project),
            "power" => Some(Self::Power),
            _ => None,
        }
    }
}

static ROLE_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)\b(class|classes|object|uml|schema|architecture|design)\b").unwrap()
});
static COT_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)\b(audit|risk|risks|privacy|gdpr|compliance|review|security)\b").unwrap()
});
static SYSTEM_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)\b(chatbot|bot|assistant|support|customer|customers)\b").unwrap()
});
static AGENT_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?i)\b(agent|tool|tools|automate|workflow)\b").unwrap());
static FEWSHOT_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?i)\b(extract|classify|format|example|examples)\b").unwrap());
static PROJECT_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)\b(project|plan|roadmap|milestone|milestones|build)\b").unwrap()
});

pub fn classify(text: &str) -> PromptType {
    if ROLE_RE.is_match(text) {
        PromptType::Role
    } else if COT_RE.is_match(text) {
        PromptType::Cot
    } else if SYSTEM_RE.is_match(text) {
        PromptType::System
    } else if AGENT_RE.is_match(text) {
        PromptType::Agent
    } else if FEWSHOT_RE.is_match(text) {
        PromptType::Fewshot
    } else if PROJECT_RE.is_match(text) {
        PromptType::Project
    } else {
        PromptType::Power
    }
}

pub fn build_prompt(prompt_type: PromptType, idea: &str, instruction: Option<&str>) -> String {
    let task_clean = idea.split_whitespace().collect::<Vec<_>>().join(" ");
    let task = if task_clean.len() > 240 {
        &task_clean[..240]
    } else {
        &task_clean
    };

    let change = if let Some(inst) = instruction {
        let inst_clean = inst.split_whitespace().collect::<Vec<_>>().join(" ");
        let inst_sub = if inst_clean.len() > 200 {
            &inst_clean[..200]
        } else {
            &inst_clean
        };
        format!("\nChange requested: {}", inst_sub)
    } else {
        String::new()
    };

    let base = match prompt_type {
        PromptType::Role => format!(
            "You are a senior specialist in this area.\nTask: {}\nReturn: 1. A short plan. 2. The main parts, each with a one-line purpose. 3. Open questions you need answered.\nAsk before assuming anything unclear.",
            task
        ),
        PromptType::Cot => format!(
            "Work through the items one at a time.\nTask: {}\nFor each item, state: what it is, where it sits, who is affected, and the risk.\nEnd with the three biggest risks, ranked.",
            task
        ),
        PromptType::System => format!(
            "You are a helpful assistant for this job: {}\nRules: stay on topic, be brief and polite, never invent facts.\nIf you are not sure, say so and ask one question.",
            task
        ),
        PromptType::Agent => format!(
            "You are an agent with a clear goal: {}\nTools: [list the tools you may use, and when].\nLimits: do not act outside the goal. Ask a person before anything that cannot be undone.\nStop when the goal is met and report what you did.",
            task
        ),
        PromptType::Fewshot => format!(
            "Do the following task and keep the same format as the examples.\nTask: {}\nExample 1: [input] -> [output]\nExample 2: [input] -> [output]\nNow do the same for the new input.",
            task
        ),
        PromptType::Project => format!(
            "Project goal: {}\nConstraints: [time, budget, tools]\nDeliverables: [list]\nWork in stages and confirm each stage before the next.",
            task
        ),
        PromptType::Power => format!(
            "Goal: {}\nContext: [who this is for]\nSteps: [what to do, in order]\nOutput format: [how the answer should look]\nCheck your answer against the goal before replying.",
            task
        ),
    };

    format!("{}{}", base, change)
}
