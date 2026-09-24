-- Initial catalogue entries. Descriptions are deliberately generic industry use cases
-- (clean-room framing: no client names, no work architecture).
-- Set youtube_id once a demo is recorded; flip published to show an agent in the catalogue.
-- Safe to re-run: existing slugs are left untouched.

insert into public.agents (slug, name, persona, problem, description, tags, published, sort_order)
values
  (
    'sre-assistant',
    'SRE Assistant',
    'Site reliability engineers',
    'Correlates incidents with metrics and logs, finds the likely root cause and drafts a remediation plan.',
    'Picks up a new incident from the ticketing system, pulls the related alerts, metrics and recent changes from the observability stack, and walks through a structured root-cause analysis. It ends with a ranked list of likely causes and a step-by-step remediation plan an on-call engineer can review and act on.',
    array['IT operations', 'Multi-agent', 'Tool use'],
    true, 10
  ),
  (
    'candidate-screening-assistant',
    'Candidate Screening Assistant',
    'Recruiters and hiring managers',
    'Parses CVs against a job description, scores the match and generates tailored interview questions.',
    'Reads a job description and a batch of CVs, extracts skills and experience into a common structure, and scores each candidate against the role with a short justification. For shortlisted candidates it drafts targeted first-round questions that probe the gaps it found.',
    array['HR', 'Document parsing', 'Scoring'],
    true, 20
  ),
  (
    'employee-onboarding-assistant',
    'Employee Onboarding Assistant',
    'HR teams and new joiners',
    'Guides new hires through their first weeks, answers policy questions and tracks onboarding tasks.',
    'Gives each new joiner a personalised onboarding checklist, answers questions about policies and tools from the company handbook, and nudges them and their manager when tasks slip.',
    array['HR', 'RAG', 'Workflow'],
    true, 30
  ),
  (
    'timesheet-assistant',
    'Timesheet Assistant',
    'Employees and project managers',
    'Fills and checks timesheets from calendars and tickets, and flags gaps before the deadline.',
    'Drafts weekly timesheets from calendar events and ticket activity, checks them against project codes and policy, and reminds people about missing entries before submission closes.',
    array['Operations', 'Tool use', 'Workflow'],
    false, 40
  ),
  (
    'major-incident-assistant',
    'Major Incident Assistant',
    'Incident managers',
    'Coordinates major incidents: builds the timeline, drafts stakeholder updates and tracks actions.',
    'During a major incident it keeps a live timeline from chat and tickets, drafts regular stakeholder updates, tracks owners and actions, and produces a first draft of the post-incident review.',
    array['IT operations', 'Multi-agent', 'Human-in-the-loop'],
    false, 50
  ),
  (
    'script-approval-assistant',
    'Script Approval Assistant',
    'Platform and change-management teams',
    'Reviews submitted scripts for risk, routes them to the right approver and records the decision.',
    'Analyses a submitted script for risky operations and policy violations, summarises what it does in plain language, routes it to the right approver based on risk and scope, and records the outcome for audit.',
    array['DevOps', 'Code review', 'Human-in-the-loop'],
    false, 60
  ),
  (
    'public-schemes-assistant',
    'Public Schemes Assistant',
    'Citizens',
    'Finds the government schemes a person is eligible for and explains how to apply, in plain language.',
    'Asks a few simple questions about a person''s situation, matches them against public government schemes, explains eligibility and benefits in plain language, and lists the documents and steps needed to apply.',
    array['Public sector', 'RAG', 'Conversational'],
    false, 70
  )
on conflict (slug) do nothing;
