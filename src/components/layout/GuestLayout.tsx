import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Button,
  Grid,
  Column,
  Content,
  SkipToContent,
} from '@carbon/react';
import { Login, Notification } from '@carbon/icons-react';

export function GuestLayout() {
  const navigate = useNavigate();

  return (
    <div className="public-layout">
      <Header aria-label="SurveyGPT" className="public-header--carbon">
        <SkipToContent />
        <HeaderName element={Link} href="/" prefix="">
          SurveyGPT
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label="Sign In"
            onClick={() => navigate('/signin')}
          >
            <Login size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      <div className="guest-banner">
        <Grid narrow>
          <Column sm={4} md={8} lg={16}>
            <div className="guest-banner__inner">
              <Notification size={16} />
              <span>You're editing as a guest. <strong>Sign up</strong> to save and publish your survey.</span>
              <Button
                kind="primary"
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Sign Up Free
              </Button>
            </div>
          </Column>
        </Grid>
      </div>

      <Content id="main-content" className="public-layout__content guest-layout__content">
        <Outlet />
      </Content>
    </div>
  );
}
