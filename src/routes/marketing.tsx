import { Link } from 'react-router-dom';
import {
  Button,
  ButtonSet,
  Grid,
  Column,
  Tile,
  Accordion,
  AccordionItem,
  Tag,
  Heading,
  Section,
} from '@carbon/react';
import {
  Add,
  ArrowRight,
  CheckmarkFilled,
  ChartBar,
  Code,
  Connect,
  Dashboard,
  Flash,
  Share,
  WatsonHealthRotate_360,
} from '@carbon/icons-react';

/** Four pillars — avoids repeating “how it works” detail */
const features = [
  {
    icon: <Dashboard size={24} />,
    title: 'Visual builder',
    description:
      'Drag-and-drop editor, templates, and branding so your team ships surveys without engineering.',
  },
  {
    icon: <Flash size={24} />,
    title: 'Rich questions & logic',
    description:
      '25+ question types plus branching and display logic so respondents only see what matters.',
  },
  {
    icon: <ChartBar size={24} />,
    title: 'Live results',
    description:
      'Dashboards and exports as responses arrive — CSV, Excel, or PDF when you need to dig deeper.',
  },
  {
    icon: <WatsonHealthRotate_360 size={24} />,
    title: 'AI on open ends',
    description:
      'Summaries and themes from free-text answers so you are not reading thousands of rows by hand.',
  },
];

const steps = [
  {
    num: '01',
    icon: <Code size={28} />,
    title: 'Build',
    description: 'Start from a template or blank canvas. Add questions, logic, and your brand.',
  },
  {
    num: '02',
    icon: <Share size={28} />,
    title: 'Distribute',
    description: 'Share a link, embed on your site, or use email and QR — reach people where they are.',
  },
  {
    num: '03',
    icon: <Connect size={28} />,
    title: 'Act',
    description: 'Watch the dashboard, export data, and use AI summaries to decide what to do next.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try the core experience',
    features: [
      '3 active surveys',
      '100 responses/month',
      '8 question types',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Get started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For teams shipping feedback often',
    features: [
      'Unlimited surveys',
      '10,000 responses/month',
      '25+ question types',
      'Conditional logic',
      'Custom themes & branding',
      'AI-powered insights',
      'Priority support',
    ],
    cta: 'Start free trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'Security and scale',
    features: [
      'Everything in Pro',
      'Unlimited responses',
      'SSO & SAML',
      'Advanced permissions',
      'API access',
      'Dedicated account manager',
      '99.9% SLA',
    ],
    cta: 'Contact sales',
    popular: false,
  },
];

const faqs = [
  {
    question: 'Do I need a credit card to start?',
    answer:
      'No. The Free plan does not require a card. Upgrade when you need higher limits, advanced question types, or AI insights — your work carries over.',
  },
  {
    question: 'Can I export responses?',
    answer:
      'Yes. Export to CSV, Excel, or PDF. Paid plans include API access for piping data into your own tools.',
  },
  {
    question: 'How is my data protected?',
    answer:
      'We encrypt data at rest and in transit (TLS 1.3). Infrastructure follows industry-standard practices; Enterprise adds SSO and finer access controls.',
  },
  {
    question: 'What do paid plans add beyond Free?',
    answer:
      'Higher limits, full question libraries, conditional logic, custom themes, AI summaries on open-ended answers, team roles, and priority support — see the plan cards above for detail.',
  },
];

export function HomePage() {
  return (
    <div className="landing">
      <section className="hero" aria-labelledby="hero-heading">
        <Grid narrow>
          <Column sm={4} md={8} lg={{ span: 12, offset: 2 }}>
            <div className="hero__content">
              <Heading id="hero-heading">
                Surveys, responses, and insights
                <br />
                <span className="hero__highlight">in one place</span>
              </Heading>
              <p className="hero__subtitle">
                Design surveys your way, collect answers in real time, and turn feedback into
                decisions — without juggling three different tools.
              </p>
              <ButtonSet className="hero__actions">
                <Button
                  kind="primary"
                  size="lg"
                  renderIcon={Add}
                  as={Link}
                  to="/signup"
                >
                  Start for free
                </Button>
                <Button kind="ghost" size="lg" renderIcon={ArrowRight} href="#how-it-works">
                  How it works
                </Button>
              </ButtonSet>
            </div>
          </Column>
        </Grid>
        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-value">10K+</span>
            <span className="hero__stat-label">Surveys created</span>
          </div>
          <div className="hero__stat-divider" aria-hidden="true" />
          <div className="hero__stat">
            <span className="hero__stat-value">2M+</span>
            <span className="hero__stat-label">Responses collected</span>
          </div>
          <div className="hero__stat-divider" aria-hidden="true" />
          <div className="hero__stat">
            <span className="hero__stat-value">99.9%</span>
            <span className="hero__stat-label">Uptime target</span>
          </div>
        </div>
      </section>

      <section id="features" className="features" aria-labelledby="features-heading">
        <Grid narrow>
          <Column sm={4} md={8} lg={16}>
            <div className="section-header">
              <Heading id="features-heading">Why teams use SurveyGPT</Heading>
              <p>
                Builder, logic, analytics, and AI — the parts that usually sit in separate products,
                wired together for feedback workflows.
              </p>
            </div>
          </Column>
          {features.map((f) => (
            <Column sm={4} md={4} lg={4} key={f.title}>
              <Tile className="feature-tile">
                <div className="feature-tile__icon">{f.icon}</div>
                <Section level={3}>
                  <Heading className="feature-tile__title">{f.title}</Heading>
                </Section>
                <p className="feature-tile__desc">{f.description}</p>
              </Tile>
            </Column>
          ))}
        </Grid>
      </section>

      <section id="how-it-works" className="how-it-works" aria-labelledby="steps-heading">
        <Grid narrow>
          <Column sm={4} md={8} lg={16}>
            <div className="section-header">
              <Heading id="steps-heading">From idea to insight</Heading>
              <p>Three steps. No separate stack of form tools and spreadsheets.</p>
            </div>
          </Column>
          {steps.map((s, i) => (
            <Column
              sm={4}
              md={4}
              lg={i % 3 === 0 ? { span: 4, offset: 2 } : 4}
              key={s.num}
            >
              <Tile className="step-tile">
                <div className="step-tile__icon">{s.icon}</div>
                <span className="step-tile__num">{s.num}</span>
                <Section level={3}>
                  <Heading className="step-tile__title">{s.title}</Heading>
                </Section>
                <p className="step-tile__desc">{s.description}</p>
              </Tile>
            </Column>
          ))}
        </Grid>
      </section>

      <section id="pricing" className="pricing" aria-labelledby="pricing-heading">
        <Grid narrow>
          <Column sm={4} md={8} lg={16}>
            <div className="section-header">
              <Heading id="pricing-heading">Pricing</Heading>
              <p>Start free. Upgrade when volume and advanced features matter.</p>
            </div>
          </Column>
          {plans.map((plan, i) => (
            <Column
              sm={4}
              md={4}
              lg={i % 3 === 0 ? { span: 4, offset: 2 } : 4}
              key={plan.name}
            >
              <Tile className={`pricing-tile ${plan.popular ? 'pricing-tile--popular' : ''}`}>
                {plan.popular && (
                  <Tag type="purple" className="pricing-tile__badge">
                    Most popular
                  </Tag>
                )}
                <Section level={3}>
                  <Heading className="pricing-tile__name">{plan.name}</Heading>
                </Section>
                <p className="pricing-tile__desc">{plan.description}</p>
                <div className="pricing-tile__price">
                  {plan.price}
                  <span>{plan.period}</span>
                </div>
                <ul className="pricing-tile__features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <CheckmarkFilled size={16} aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  kind={plan.popular ? 'primary' : 'secondary'}
                  as={Link}
                  to="/signup"
                  className="pricing-tile__btn"
                >
                  {plan.cta}
                </Button>
              </Tile>
            </Column>
          ))}
        </Grid>
      </section>

      <section id="faq" className="faq faq--last" aria-labelledby="faq-heading">
        <Grid narrow>
          <Column sm={4} md={8} lg={{ span: 12, offset: 2 }}>
            <div className="section-header">
              <Heading id="faq-heading">FAQ</Heading>
              <p>Short answers — the pricing cards above list feature differences in full.</p>
            </div>
          </Column>
          <Column sm={4} md={8} lg={{ span: 12, offset: 2 }}>
            <Accordion className="faq__accordion">
              {faqs.map((faq) => (
                <AccordionItem title={faq.question} key={faq.question}>
                  <p className="faq__answer">{faq.answer}</p>
                </AccordionItem>
              ))}
            </Accordion>
          </Column>
        </Grid>
      </section>
    </div>
  );
}
