export const resources = [
  {
    id: 'tenant',
    label: 'Tenant',
    icon: 'Home',
    children: [
      {
        id: 'sub-prod',
        label: 'Subscription',
        badge: '2',
        icon: 'Cloud',
        children: [
          {
            id: 'acct-prod',
            label: 'Account',
            icon: 'Globe2',
            children: [
              {
                id: 'vnet-prod',
                label: 'Virtual network',
                icon: 'RadioTower',
                children: [
                  { id: 'svc-edge', label: 'API service', icon: 'Globe2', badge: 'risk' },
                  { id: 'cache', label: 'Session cache', icon: 'Layers' },
                  { id: 'db-primary', label: 'Primary database', icon: 'Database', badge: '2' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'sub-shared',
        label: 'Subscription',
        icon: 'Cloud',
        children: [
          {
            id: 'acct-shared',
            label: 'Account',
            icon: 'Globe2',
            children: [
              {
                id: 'vnet-dns',
                label: 'Virtual network',
                icon: 'RadioTower',
                children: [{ id: 'dns', label: 'DNS VNet', icon: 'RadioTower', badge: 'risk' }],
              },
            ],
          },
        ],
      },
    ],
  },
]

export const chatMessages = [
  {
    role: 'user',
    text: 'Can you review this Terraform PR like a production architecture change, not a flat resource list?',
  },
  {
    role: 'assistant',
    text: 'Yes. I mapped the plan into tenant, subscription, account, and virtual network boundaries, then highlighted the risky resource changes.',
  },
  {
    role: 'user',
    text: 'Show me the gate blockers and what security needs to approve.',
  },
]

export const insights = [
  {
    id: 'misconfig',
    title: 'Workload misconfiguration',
    severity: 'High',
    resource: 'API service',
    description:
      'The public service is introduced without a rate-limit rule on the attached WAF policy. This makes the new ingress path review-blocking.',
    treatment: 'Mitigate',
    status: 'Open',
  },
  {
    id: 'stateful',
    title: 'Stateful replacement',
    severity: 'Critical',
    resource: 'Primary database',
    description:
      'The database replacement is tied to a plan hash and requires security approval before the GitHub Check can pass.',
    treatment: 'Approve with evidence',
    status: 'Waiting',
  },
  {
    id: 'cost',
    title: 'Cost increase',
    severity: 'Medium',
    resource: 'Session cache',
    description:
      'The planned cache replica count moves monthly run rate above the workspace budget threshold by 574 USD.',
    treatment: 'Track',
    status: 'Open',
  },
]

export const actionRuns = [
  { id: 'plan', label: 'Terraform plan', state: 'Passed', time: '41s' },
  { id: 'checkov', label: 'Checkov policy', state: 'Blocked', time: '18s' },
  { id: 'infracost', label: 'Infracost delta', state: 'Warning', time: '9s' },
  { id: 'aegis', label: 'isengard/plan-review', state: 'Action required', time: '1m 04s' },
]

export const mitigationSteps = [
  'Confirm public ingress is only attached to the generated application load balancer.',
  'Add a WAF rate-limit rule or document an approved exception.',
  'Attach database replacement evidence to the security approval.',
  'Re-run the GitHub Actions demo and verify the plan hash did not change.',
]
