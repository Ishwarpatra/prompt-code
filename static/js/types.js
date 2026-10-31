/* Prompt types shown on the landing page and used by the demo backend. */
window.PC_TYPES = [
  { id: 'role',    label: 'Role prompt',            when: 'Best for design work that needs an expert voice and a fixed output format.', example: 'Designing the classes for an inventory app.' },
  { id: 'cot',     label: 'Step-by-step checklist', when: 'Best when the model must go through items one by one and flag risks.',      example: 'Auditing how an app stores and shares user data.' },
  { id: 'system',  label: 'System prompt',          when: 'Sets the role, rules and tone for an assistant that will talk to people.',  example: 'A support chatbot for a small online shop.' },
  { id: 'agent',   label: 'Agent prompt',           when: 'Defines the goal, the tools it may use, its limits and when to stop.',      example: 'An agent that reads bug reports and drafts replies.' },
  { id: 'fewshot', label: 'Few-shot prompt',        when: 'Shows worked examples so the output keeps the same format every time.',     example: 'Pulling fields such as dates and names out of emails.' },
  { id: 'project', label: 'Project prompt',         when: 'Sets goals, constraints, deliverables and stages for larger pieces of work.', example: 'Planning a three-month app build with milestones.' },
  { id: 'power',   label: 'Power prompt',           when: 'A general structured rewrite when no other type fits better.',              example: 'Turning a vague request into a clear, complete one.' }
];
window.PC_TYPE_BY_ID = {};
window.PC_TYPES.forEach(function (t) { window.PC_TYPE_BY_ID[t.id] = t; });

window.PC_EXAMPLES = {
  class:   'I want a prompt that helps generate class designs for an inventory app, with attributes and relationships.',
  audit:   'Review how our app stores and shares user data and flag the risks.',
  chatbot: 'A support chatbot for a small online shop that answers politely and hands over to a person when unsure.',
  agent:   'An agent that reads new bug reports, labels them, and drafts a reply.',
  project: 'Plan a three-month build of a mobile habit tracker, with milestones.'
};
