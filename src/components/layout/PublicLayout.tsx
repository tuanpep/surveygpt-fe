import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderNavigation,
  HeaderMenuItem,
  SkipToContent,
  Content,
  Section,
  Heading,
  Link as CarbonLink,
} from '@carbon/react';
import { Login, LogoGithub, LogoLinkedin, LogoTwitter } from '@carbon/icons-react';

export function PublicLayout() {
  const navigate = useNavigate();

  return (
    <div className="public-layout">
      <Header aria-label="SurveyGPT" className="public-header--carbon">
        <SkipToContent />
        <HeaderName element={Link} href="/" prefix="">
          SurveyGPT
        </HeaderName>
        <HeaderNavigation aria-label="SurveyGPT">
          <HeaderMenuItem href="#features">Features</HeaderMenuItem>
          <HeaderMenuItem href="#pricing">Pricing</HeaderMenuItem>
          <HeaderMenuItem href="#faq">FAQ</HeaderMenuItem>
        </HeaderNavigation>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label="Sign In"
            onClick={() => navigate('/signin')}
          >
            <Login size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      <Content id="main-content" className="public-layout__content">
        <Outlet />
      </Content>

      <footer className="site-footer">
        <div className="site-footer__grid">
          <div>
            <Section level={3}>
              <Heading className="site-footer__heading">Product</Heading>
            </Section>
            <ul className="site-footer__links">
              <li><CarbonLink href="#features">Features</CarbonLink></li>
              <li><CarbonLink href="#pricing">Pricing</CarbonLink></li>
              <li><CarbonLink as={Link} to="/signup">Sign Up</CarbonLink></li>
              <li><CarbonLink as={Link} to="/signin">Sign In</CarbonLink></li>
            </ul>
          </div>
          <div>
            <Section level={3}>
              <Heading className="site-footer__heading">Resources</Heading>
            </Section>
            <ul className="site-footer__links">
              <li><CarbonLink href="#faq">FAQ</CarbonLink></li>
              <li><CarbonLink href="#features">Documentation</CarbonLink></li>
              <li><CarbonLink href="#features">API Reference</CarbonLink></li>
              <li><CarbonLink href="#features">Blog</CarbonLink></li>
            </ul>
          </div>
          <div>
            <Section level={3}>
              <Heading className="site-footer__heading">Company</Heading>
            </Section>
            <ul className="site-footer__links">
              <li><CarbonLink href="#features">About</CarbonLink></li>
              <li><CarbonLink href="#features">Careers</CarbonLink></li>
              <li><CarbonLink href="#features">Contact</CarbonLink></li>
              <li><CarbonLink href="#features">Partners</CarbonLink></li>
            </ul>
          </div>
          <div>
            <Section level={3}>
              <Heading className="site-footer__heading">Legal</Heading>
            </Section>
            <ul className="site-footer__links">
              <li><CarbonLink href="#features">Privacy Policy</CarbonLink></li>
              <li><CarbonLink href="#features">Terms of Service</CarbonLink></li>
              <li><CarbonLink href="#features">Cookie Policy</CarbonLink></li>
              <li><CarbonLink href="#features">GDPR</CarbonLink></li>
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom">
          <p>&copy; 2026 SurveyGPT. All rights reserved.</p>
          <div className="site-footer__social">
            <CarbonLink href="#features" aria-label="Twitter"><LogoTwitter size={20} /></CarbonLink>
            <CarbonLink href="#features" aria-label="GitHub"><LogoGithub size={20} /></CarbonLink>
            <CarbonLink href="#features" aria-label="LinkedIn"><LogoLinkedin size={20} /></CarbonLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
